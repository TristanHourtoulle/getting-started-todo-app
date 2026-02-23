import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../domain/user';

interface JwtPayload {
  userId: string;
}

export function makeAuthMiddleware(userRepo: UserRepository, jwtSecret: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = header.slice(7);

    try {
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;
      const user = await userRepo.findById(payload.userId);

      if (!user) {
        res.status(401).json({ error: 'User no longer exists' });
        return;
      }

      req.userId = payload.userId;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
