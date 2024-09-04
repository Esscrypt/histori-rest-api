import { Request, Response } from 'express';
import { Token } from '../models';

export const getTokens = async (req: Request, res: Response) => {
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
};
