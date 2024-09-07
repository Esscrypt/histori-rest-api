// src/types/express/index.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;  // You can replace `string | JwtPayload` with the actual user type
    }
  }
}