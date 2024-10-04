import { IUser } from './user';
import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
