import { JWT_SECRET } from '@/config';
import { IUser } from '@/interfaces/user';

import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  console.log(token, 'ini token');

  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  req.user = verify(token, JWT_SECRET) as IUser;

  next();
};
