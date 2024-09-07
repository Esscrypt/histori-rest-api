import { Request, Response } from 'express';
import Stripe from 'stripe';
import { APIGateway } from '@aws-sdk/client-api-gateway';
import logger from '../middleware/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const apiGateway = new APIGateway({
  region: 'us-east-1',
});

export const createCustomer = async (req: Request, res: Response) => {
  const { email, paymentMethodId } = req.body;

  try {
    // CSRF Token validation
    res.locals.csrfToken; // You can use the CSRF token if needed for response

    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

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

    const apiKey = await createApiGatewayApiKey(customerId);

    res.json({ subscription, apiKey });
  } catch (error) {
    logger.error('Error creating subscription: ' + (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
};

const createApiGatewayApiKey = async (customerId: string) => {
  try {
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

    return apiKeyResponse.value;
  } catch (error) {
    logger.error('Error creating API Gateway key: ' + (error as Error).message);
    throw error;
  }
};


const YOUR_DOMAIN = process.env.YOUR_DOMAIN || 'http://localhost:4242';

// Create a checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const prices = await stripe.prices.list({
      lookup_keys: [req.body.lookup_key],
      expand: ['data.product'],
    });

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
      res.redirect(303, session.url);
    } else {
      console.error('Session URL is null');
      res.status(500).json({ error: 'Session URL is null' });
    }
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a portal session for managing subscription
export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer as string,
      return_url: YOUR_DOMAIN,
    });

    res.redirect(303, portalSession.url);
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// Helper: Create API Key
const createApiKeyForCustomer = async (customerId: string) => {
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

  logger.info(`Created API key for customer ${customerId}`);
  return apiKeyResponse.value;
};

// Helper: Delete API Key
const deleteApiKeyForCustomer = async (customerId: string) => {
  const apiKeys = await apiGateway.getApiKeys({
    nameQuery: `apikey_${customerId}`,
    includeValues: true,
  });

  if (apiKeys.items && apiKeys.items.length > 0) {
    const apiKeyId = apiKeys.items[0].id;

    await apiGateway.deleteApiKey({
      apiKey: apiKeyId as string,
    });

    logger.info(`Deleted API key for customer ${customerId}`);
  } else {
    logger.warn(`No API key found for customer ${customerId}`);
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  let event = req.body;
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

  // Verify webhook signature if endpoint secret exists
  if (endpointSecret) {
    const signature = req.headers['stripe-signature'] as string;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err: any) {
      logger.error(`⚠️  Webhook signature verification failed:`, err.message);
      return res.sendStatus(400);
    }
  }

  const { type, data } = event;
  const subscription = data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  try {
    switch (type) {
      case 'customer.subscription.created':
        await createApiKeyForCustomer(customerId);
        break;

      case 'customer.subscription.deleted':
        await deleteApiKeyForCustomer(customerId);
        break;

      case 'customer.subscription.updated':
        logger.info(`Subscription updated for customer ${customerId}`);
        break;

      default:
        logger.warn(`Unhandled event type ${type}`);
        break;
    }

    res.sendStatus(200);
  } catch (error: any) {
    logger.error(`Error handling event ${type}: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};