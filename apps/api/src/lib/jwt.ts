import { JWT_SECRET, VERIFY_EMAIL_SECRET } from '@/config';
import { sign } from 'jsonwebtoken';

export const generateToken = (payload: any, expiresIn: string = '1hr') => {
  return sign(payload, JWT_SECRET, { expiresIn });
};

export const generateTokeEmailVerification = (
  payload: any,
  expiresIn: string = '15m',
) => {
  return sign(payload, VERIFY_EMAIL_SECRET, { expiresIn, algorithm: 'HS256' });
};
