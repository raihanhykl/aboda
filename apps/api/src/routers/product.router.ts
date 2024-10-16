import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

export class ProductRouter {
  private router = Router();
  private productController = new ProductController();

  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get('/', this.productController.getAllProducts);
    this.router.get('/search', this.productController.searchProducts);
    this.router.get('/:id', this.productController.getProductById);
    this.router.post('/', this.productController.createProduct);
    this.router.put('/:id', this.productController.updateProduct);
    this.router.delete('/:id', this.productController.deleteProduct);
  }

  public getRouter() {
    return this.router;
  }
}
