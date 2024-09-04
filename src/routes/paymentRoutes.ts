import express from 'express';
import { createCustomer, createSubscription } from '../controllers/paymentController';

const router = express.Router();

/**
 * @swagger
 * /create-customer:
 *   post:
 *     summary: Create a new Stripe customer
 *     description: Creates a new customer in Stripe with the provided email and payment method ID.
 *     responses:
 *       200:
 *         description: The newly created customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/create-customer', createCustomer);

/**
 * @swagger
 * /create-subscription:
 *   post:
 *     summary: Create a new subscription
 *     description: Creates a new subscription for the provided customer ID and price ID.
 *     responses:
 *       200:
 *         description: The newly created subscription and associated API key.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/create-subscription', createSubscription);

export default router;
