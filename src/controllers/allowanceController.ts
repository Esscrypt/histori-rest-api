import { Request, Response } from 'express';
import { Allowance } from '../models';

export const getAllowances = async (req: Request, res: Response) => {
  try {
    const allowances = await Allowance.findAll({
      where: req.query,
    });
    res.json(allowances);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
