// import { responseHandle } from '@/helpers/response';
// import { NextFunction, Request, Response } from 'express';
// import { CategoryService } from '@/services/category.admin.services';

// export class CategoryController {
//   async getAllCategories(req: Request, res: Response, next: NextFunction) {
//     try {
//       const data = await CategoryService.getAllCategories(req, res);
//       return res.send(responseHandle('Get All Categories Success', data));
//     } catch (error) {
//       next(error);
//     }
//   }

//   async createCategory(req: Request, res: Response, next: NextFunction) {
//     try {
//       const data = await CategoryService.createCategory(req, res);
//       return res.send(responseHandle('Create Category Success', data));
//     } catch (error) {
//       next(error);
//     }
//   }

//   async updateCategory(req: Request, res: Response, next: NextFunction) {
//     try {
//       const data = await CategoryService.updateCategory(req, res);
//       return res.send(responseHandle('Update Category Success', data));
//     } catch (error) {
//       next(error);
//     }
//   }

//   async deleteCategory(req: Request, res: Response, next: NextFunction) {
//     try {
//       await CategoryService.deleteCategory(req, res);
//       return res.send('Delete Category Success');
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getCategoryById(req: Request, res: Response, next: NextFunction) {
//     try {
//       const data = await CategoryService.getCategoryById(req, res);
//       return res.send(responseHandle('Get Category By ID Success', data));
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// // export default new CategoryController();
import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/category.admin.services';

export class CategoryController {
  // Get all categories
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getAllCategories();
      return res.send(responseHandle('Get All Categories Success', data));
    } catch (error) {
      next(error);
    }
  }

  // Get category by ID
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getCategoryById(req);
      return res.send(responseHandle('Get Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  // Create a category
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.createCategory(req);
      return res.send(responseHandle('Create Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  // Update a category
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.updateCategory(req);
      return res.send(responseHandle('Update Category Success', data));
    } catch (error) {
      next(error);
    }
  }

  // Delete a category
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.deleteCategory(req);
      return res.send(responseHandle('Delete Category Success', data));
    } catch (error) {
      next(error);
    }
  }
}
