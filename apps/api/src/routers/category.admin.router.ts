import { Router } from 'express';
import { CategoryController } from '../controllers/category.admin.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { Uploader } from '@/middlewares/upload';

export class CategoryRouter {
  private router = Router();
  private categoryController = new CategoryController();
  private imageUploader = Uploader('category', 'category');

  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get('/', this.categoryController.getAllCategories);
    this.router.get('/:id', this.categoryController.getCategoryById);
    this.router.post(
      '/',
      validateToken,
      this.imageUploader.single('image'),
      this.categoryController.createCategory,
    );
    this.router.put(
      '/:id',
      validateToken,
      this.imageUploader.single('image'),
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
