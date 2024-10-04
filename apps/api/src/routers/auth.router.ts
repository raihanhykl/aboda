import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema } from '@/schemas/auth.schema';
import { verifyEmail } from '@/middlewares/verifyEmail';

export class AuthRouter {
  private router = Router();
  private authController = new AuthController();
  constructor() {
    this.routes();
  }
  private routes() {
    this.router.post('/v1', this.authController.login);
    this.router.post(
      '/v2',
      validateData(registerSchema),
      this.authController.register,
    );
    this.router.get(
      '/check-verify-email',
      verifyEmail,
      this.authController.checkVerifyEmail,
    );
    this.router.post('/set-password', this.authController.setPassword);
  }
  public getRouter() {
    return this.router;
  }
}
