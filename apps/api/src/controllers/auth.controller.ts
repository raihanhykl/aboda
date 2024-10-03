import { responseHandle } from '@/helpers/response';
import { AuthService } from '@/services/auth.services';
import { NextFunction, Request, Response } from 'express';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.register(req);
      return res.send(responseHandle('Register Success', data));
    } catch (error) {
      next(error);
    }
  }
}
