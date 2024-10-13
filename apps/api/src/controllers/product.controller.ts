import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/product.services';

export class ProductController {
  // Search
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.getAllProducts(req);
      return res.send(responseHandle('Get All Products Success', data));
    } catch (error) {
      next(error);
    }
  }

  async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.searchProducts(req);
      return res.send(responseHandle('Search Products Success', data));
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.getProductById(req);
      return res.send(responseHandle('Get Product Success', data));
    } catch (error) {
      next(error);
    }
  }
  // CRUD
}
