import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/category.admin.services';

export class CategoryController {
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getAllCategories();
      return res.send(responseHandle('Get All Categories Success', data));
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getCategoryById(req);
      return res.send(responseHandle('Get Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.createCategory(req);
      return res.send(responseHandle('Create Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.updateCategory(req);
      return res.send(responseHandle('Update Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.deleteCategory(req);
      return res.send(responseHandle('Delete Category Success', data));
    } catch (error) {
      next(error);
    }
  }
}
