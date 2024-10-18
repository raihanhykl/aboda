import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { Upload } from '@/helpers/upload';
export class ProductRouter {
  private router = Router();
  private productController = new ProductController();
  private uploader = new Upload().getUploader();
  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get('/', this.productController.getAllProducts);
    this.router.get(
      '/search',
      validateToken,
      this.productController.searchProducts,
    );
    this.router.post(
      '/',
      validateToken,
      this.uploader.single('image'),
      this.productController.createProduct,
    );
    this.router.get(
      '/:id',
      validateToken,
      this.productController.getProductById,
    );
    this.router.put(
      '/:id',
      validateToken,
      this.uploader.single('image'),
      this.productController.updateProduct,
    );
    this.router.delete(
      '/:id',
      validateToken,
      this.productController.deleteProduct,
    );
    // this.router.get(
    //   '/:id',
    //   validateToken,
    //   this.productController.getProductDetail,
    // );
  }

  public getRouter() {
    return this.router;
  }
}
