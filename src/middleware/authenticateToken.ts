import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Custom type definition for Request with 'user' property
interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as string | JwtPayload;
    req.user = user; // Assign the user to the request
    next(); // Call the next middleware
  } catch (err) {
    return res.sendStatus(403); // Forbidden
  }
};

export default authenticateToken;
