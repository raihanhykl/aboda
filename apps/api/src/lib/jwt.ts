import { JWT_SECRET, verify_email_secret } from '@/config';
import { sign } from 'jsonwebtoken';

export const generateToken = (payload: any, expiresIn: string = '1hr') => {
  return sign(payload, JWT_SECRET, { expiresIn });
};

export const generateTokeEmailVerification = (
  payload: any,
  expiresIn: string = '15m',
) => {
  console.log(verify_email_secret);

  return sign(payload, verify_email_secret, { expiresIn, algorithm: 'HS256' });
};
