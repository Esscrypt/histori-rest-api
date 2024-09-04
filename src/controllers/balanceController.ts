import { Request, Response } from 'express';
import { Balance } from '../models';

export const getBalances = async (req: Request, res: Response) => {
  try {
    const balances = await Balance.findAll({
      where: req.query,
    });
    res.json(balances);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
