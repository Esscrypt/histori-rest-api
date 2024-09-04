import { Request, Response } from 'express';
import Stripe from 'stripe';
import AWS from 'aws-sdk';
import logger from '../middleware/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const apiGateway = new AWS.APIGateway({
  region: 'us-east-1',
});

export const createCustomer = async (req: Request, res: Response) => {
  const { email, paymentMethodId } = req.body;

  try {
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
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

    // On successful payment, link the Stripe customer to an AWS API Gateway usage plan
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
    }).promise();

    // Attach the API key to the usage plan
    await apiGateway.createUsagePlanKey({
      keyId: apiKeyResponse.id as string,
      keyType: 'API_KEY',
      usagePlanId: process.env.AWS_USAGE_PLAN_ID as string,
    }).promise();

    return apiKeyResponse.value;
  } catch (error) {
    logger.error('Error creating API Gateway key: ' + (error as Error).message);
    throw error;
  }
};
