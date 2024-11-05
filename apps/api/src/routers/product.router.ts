import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { Uploader } from '@/middlewares/upload';
export class ProductRouter {
  private router = Router();
  private productController = new ProductController();
  private imageUploader = Uploader('product', 'product');
  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get(
      '/get-branch',
      this.productController.getProductStockByBranch,
    );
    this.router.get('/', this.productController.getAllProducts);
    this.router.get('/all', this.productController.getAllProductsManagement);
    this.router.get('/search', this.productController.searchProducts);
    this.router.post(
      '/',
      Uploader('product', 'product').single('image'),
      validateToken,
      this.productController.createProduct,
    );
    this.router.get('/:id', this.productController.getProductById);
    this.router.put(
      '/:id',
      validateToken,
      Uploader('product', 'product').single('image'),
      this.productController.updateProduct,
    );
    this.router.delete(
      '/:id',
      validateToken,
      this.productController.deleteProduct,
    );
    this.router.get('/detail/:id', this.productController.getProductDetail);
  }

  public getRouter() {
    return this.router;
  }
}
