import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/product.services';
import { ProductAdminServices } from '@/services/product.admin.services';

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
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductAdminServices.createProduct(req);
      return res.send(responseHandle('Create Product Success', data));
    } catch (error) {
      next(error);
    }
  }
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductAdminServices.updateProduct(req);
      return res.send(responseHandle('Update Product Success', data));
    } catch (error) {
      next(error);
    }
  }
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductAdminServices.deleteProduct(req);
      return res.send(responseHandle('Delete Product Success', data));
    } catch (error) {
      next(error);
    }
  }
  // Product Detail
  async getProductDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.getProductDetail(req);
      return res.send(responseHandle('Get Product Detail Success', data));
    } catch (error) {
      next(error);
    }
  }
}
