import { Router } from 'express';
import { CategoryController } from '../controllers/category.admin.controller';
import { validateToken } from '@/middlewares/verifyToken';

export class CategoryRouter {
  private router = Router();
  private categoryController = new CategoryController();

  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get('/', this.categoryController.getAllCategories);

    this.router.post(
      '/',
      validateToken,
      this.categoryController.createCategory,
    );

    this.router.get('/:id', this.categoryController.getCategoryById);

    this.router.put(
      '/:id',
      validateToken,
      this.categoryController.updateCategory,
    );

    this.router.delete(
      '/:id',
      validateToken,
      this.categoryController.deleteCategory,
    );
  }

  public getRouter() {
    return this.router;
  }
}
