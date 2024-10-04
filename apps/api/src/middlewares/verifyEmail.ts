import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { verify_email_secret } from '@/config';
import { IUser } from '@/interfaces/user';
export const verifyEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token } = req.params;
  const user = verify(token, verify_email_secret) as IUser;
  req.user = user;
  next();
};
