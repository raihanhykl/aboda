import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema } from '@/schemas/auth.schema';
import { verifyEmail } from '@/middlewares/verifyEmail';
import { CartController } from '@/controllers/cart.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { BranchController } from '@/controllers/branch.controller';

export class BranchRouter {
  private router = Router();
  private BranchController = new BranchController();
  constructor() {
    this.routes();
  }
  private routes() {
    this.router.get(
      '/get-all-branch',
      validateToken,
      this.BranchController.getAllBranch,
    );
    this.router.get(
      '/get-all-unassigned',
      validateToken,
      this.BranchController.getUnassignedAdmin,
    );
    this.router.post(
      '/create-admin',
      validateToken,
      this.BranchController.createAdmin,
    );
    this.router.put(
      '/update-branch',
      validateToken,
      this.BranchController.updateBranch,
    );
    this.router.post(
      '/create-branch',
      validateToken,
      this.BranchController.addBranch,
    );
    this.router.put(
      '/delete-branch/:id',
      validateToken,
      this.BranchController.deleteBranch,
    );
  }
  public getRouter() {
    return this.router;
  }
}
