import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '@/services/category.admin.services';

export class CategoryController {
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getAllCategories(req, res);
      return res.send(responseHandle('Get All Categories Success', data));
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.createCategory(req, res);
      return res.send(responseHandle('Create Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.updateCategory(req, res);
      return res.send(responseHandle('Update Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteCategory(req, res);
      return res.send('Delete Category Success');
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getCategoryById(req, res);
      return res.send(responseHandle('Get Category By ID Success', data));
    } catch (error) {
      next(error);
    }
  }
}

// export default new CategoryController();
