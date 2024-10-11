import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema, socialRegister } from '@/schemas/auth.schema';
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
    this.router.post(
      '/v3',
      validateData(socialRegister),
      this.authController.socialRegister,
    );
    this.router.get(
      '/check-verify-email/:token',
      verifyEmail,
      this.authController.checkVerifyEmail,
    );
    this.router.post(
      '/set-password/:token',
      verifyEmail,
      this.authController.setPassword,
    );
  }
  public getRouter() {
    return this.router;
  }
}
