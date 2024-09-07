import express from 'express';
import { createCustomer, createSubscription } from '../controllers/paymentController';
import authenticateToken from '../middleware/authenticateToken';
import { createCheckoutSession, createPortalSession, handleStripeWebhook } from '../controllers/paymentController';
import bodyParser from 'body-parser';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', createPortalSession);

// Webhook needs to use raw body for Stripe's signature verification
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);


export default router;
