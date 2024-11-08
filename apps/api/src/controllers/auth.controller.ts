import { ErrorHandler, responseHandle } from '@/helpers/response';
import { AuthService } from '@/services/auth.services';
import { NextFunction, Request, Response } from 'express';
import { logger } from 'handlebars';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.login(req);
      return res.send(responseHandle('Login Success', data));
    } catch (error) {
      next(error);
    }
  }
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.refreshToken(req);
      return res.send(responseHandle('Refresh Token Success', data));
    } catch (error) {
      next(error);
    }
  }
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.register(req);
      return res.send(responseHandle('Register Success', data));
    } catch (error) {
      next(error);
      // throw new ErrorHandler(error.message, error.statuscode);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.forgotPassword(req);
      return res.send(responseHandle('Forgot Password Success', data));
    } catch (error) {
      next(error);
    }
  }

  async socialRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.socialRegister(req);
      return res.send(responseHandle('Social Register Success', data));
    } catch (error) {
      next(error);
    }
  }
  async checkVerifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.checkVerifyEmail(req);
      return res.send(responseHandle('User unverified', data));
    } catch (error) {
      next(error);
    }
  }

  async setPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.setPassword(req);
      return res.send(responseHandle('Set Password Success', data));
    } catch (error) {
      next(error);
    }
  }
}
