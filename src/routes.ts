import express from 'express';
import { Token, Allowance, Balance } from './models';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         symbol:
 *           type: string
 *         decimals:
 *           type: integer
 *         contractAddress:
 *           type: string
 *         totalSupply:
 *           type: string
 *         blockNumber:
 *           type: integer
 *         tokenURI:
 *           type: string
 *         additionalMetadata:
 *           type: object
 *     Allowance:
 *       type: object
 *       properties:
 *         tokenId:
 *           type: integer
 *         owner:
 *           type: string
 *         spender:
 *           type: string
 *         allowance:
 *           type: string
 *         blockNumber:
 *           type: integer
 *     Balance:
 *       type: object
 *       properties:
 *         tokenId:
 *           type: integer
 *         holder:
 *           type: string
 *         balance:
 *           type: string
 *         blockNumber:
 *           type: integer
 */

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
router.get('/tokens', async (req, res) => {
  try {
    const tokens = await Token.findAll({
      where: req.query,
      include: ['allowances', 'balances'],
    });
    res.json(tokens);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

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
router.get('/allowances', async (req, res) => {
  try {
    const allowances = await Allowance.findAll({
      where: req.query,
    });
    res.json(allowances);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

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
router.get('/balances', async (req, res) => {
  try {
    const balances = await Balance.findAll({
      where: req.query,
    });
    res.json(balances);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
