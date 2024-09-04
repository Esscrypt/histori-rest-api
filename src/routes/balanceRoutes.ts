import express from 'express';
import { getBalances } from '../controllers/balanceController';

const router = express.Router();

/**
 * @swagger
 * /balances:
 *   get:
 *     summary: Retrieve a list of balances
 *     description: Retrieve a list of balances with optional query parameters for filtering.
 *     responses:
 *       200:
 *         description: A list of balances.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Balance'
 */
router.get('/balances', getBalances);

export default router;
