import { Request, Response } from 'express';
import Stripe from 'stripe';
import { APIGateway } from '@aws-sdk/client-api-gateway';
import logger from '../middleware/logger';
import { User } from '../models/user';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const apiGateway = new APIGateway({
  region: 'us-east-1',
});

const YOUR_DOMAIN = process.env.YOUR_DOMAIN || 'http://localhost:4242';

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { lookup_key } = req.body;
    logger.info(`Creating checkout session for lookup key: ${lookup_key}`);

    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    if (prices.data.length === 0) {
      logger.warn(`No prices found for lookup key: ${lookup_key}`);
      return res.status(404).json({ error: 'No prices found' });
    }

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });

    if (session.url) {
      logger.info(`Checkout session created successfully for lookup key: ${lookup_key}`);
      res.redirect(303, session.url);
    } else {
      console.error('Session URL is null');
      res.status(500).json({ error: 'Session URL is null' });
    }
  } catch (error: any) {
    logger.error(`Error creating checkout session, Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body;
    logger.info(`Creating portal session for session_id: ${session_id}`);

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer as string,
      return_url: YOUR_DOMAIN,
    });

    logger.info(`Portal session created successfully for session_id: ${session_id}`);
    res.redirect(303, portalSession.url);
  } catch (error: any) {
    logger.error(`Error creating portal session, Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  let event;
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

  if (endpointSecret) {
    const signature = req.headers['stripe-signature'] as string;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
      logger.info(`Webhook received: ${event.type}`);
    } catch (err: any) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  const { type, data } = event;
  const subscription = data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  try {
    switch (type) {
      case 'customer.subscription.created':
        logger.info(`Handling subscription created event for customer: ${customerId}`);
        await createApiKeyForCustomer(customerId);
        break;

      case 'customer.subscription.deleted':
        logger.info(`Handling subscription deleted event for customer: ${customerId}`);
        await deleteApiKeyForCustomer(customerId);
        break;

      case 'customer.subscription.updated':
        logger.info(`Subscription updated for customer: ${customerId}`);
        break;

      default:
        logger.warn(`Unhandled event type: ${type}`);
        break;
    }

    res.sendStatus(200);
  } catch (error: any) {
    logger.error(`Error handling Stripe webhook event ${type}, Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Helper: Create API Gateway API Key
const createApiKeyForCustomer = async (customerId: string) => {
  try {
    logger.info(`Creating API key for customer: ${customerId}`);

    const apiKeyResponse = await apiGateway.createApiKey({
      name: `apikey_${customerId}`,
      description: `API Key for customer ${customerId}`,
      enabled: true,
      generateDistinctId: true,
    });

    await apiGateway.createUsagePlanKey({
      keyId: apiKeyResponse.id as string,
      keyType: 'API_KEY',
      usagePlanId: process.env.AWS_USAGE_PLAN_ID as string,
    });

    logger.info(`API key created successfully for customer: ${customerId}`);
    return apiKeyResponse.value;
  } catch (error: any) {
    logger.error(`Error creating API Gateway key for customer: ${customerId}, Error: ${error.message}`);
    throw error;
  }
};

// Helper: Delete API Key
const deleteApiKeyForCustomer = async (customerId: string) => {
  try {
    logger.info(`Deleting API key for customer: ${customerId}`);
    const apiKeys = await apiGateway.getApiKeys({
      nameQuery: `apikey_${customerId}`,
      includeValues: true,
    });

    if (apiKeys.items && apiKeys.items.length > 0) {
      const apiKeyId = apiKeys.items[0].id;
      await apiGateway.deleteApiKey({ apiKey: apiKeyId as string });
      logger.info(`Deleted API key for customer: ${customerId}`);
    } else {
      logger.warn(`No API key found for customer: ${customerId}`);
    }
  } catch (error: any) {
    logger.error(`Error deleting API key for customer: ${customerId}, Error: ${error.message}`);
    throw error;
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const { email, paymentMethodId } = req.body;

  try {
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Save the stripeClientId to the user
    const user = await User.findOne({ where: { email } });
    if (user) {
      user.stripeClientId = customer.id;
      await user.save();
    }

    res.json(customer);
  } catch (error) {
    logger.error('Error creating customer: ' + (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  const { customerId, priceId } = req.body;

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Create and save the awsApiGatewayApiKey for the user
    const apiKey = await createApiKeyForCustomer(customerId);

    const user = await User.findOne({ where: { stripeClientId: customerId } });
    if (user) {
      user.awsApiGatewayApiKey = apiKey;
      await user.save();
    }

    res.json({ subscription, apiKey });
  } catch (error) {
    logger.error('Error creating subscription: ' + (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
};
