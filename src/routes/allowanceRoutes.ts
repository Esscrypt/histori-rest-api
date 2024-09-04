import express from 'express';
import { getAllowances } from '../controllers/allowanceController';

const router = express.Router();

/**
 * @swagger
 * /allowances:
 *   get:
 *     summary: Retrieve a list of allowances
 *     description: Retrieve a list of allowances with optional query parameters for filtering.
 *     responses:
 *       200:
 *         description: A list of allowances.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Allowance'
 */
router.get('/allowances', getAllowances);

export default router;
