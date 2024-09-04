import express from 'express';
import { getTokens } from '../controllers/tokenController';

const router = express.Router();

/**
 * @swagger
 * /tokens:
 *   get:
 *     summary: Retrieve a list of tokens
 *     description: Retrieve a list of tokens with optional query parameters for filtering.
 *     responses:
 *       200:
 *         description: A list of tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Token'
 */
router.get('/tokens', getTokens);

export default router;
