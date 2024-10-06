import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { VERIFY_EMAIL_SECRET } from '@/config';
import { IUser } from '@/interfaces/user';
export const verifyEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token } = req.params;
  const user = verify(token, VERIFY_EMAIL_SECRET) as IUser;
  req.user = user;
  next();
};
