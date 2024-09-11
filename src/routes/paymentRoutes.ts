import express from 'express';
import { createCheckoutSession, createPortalSession } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', createPortalSession);

export default router;
