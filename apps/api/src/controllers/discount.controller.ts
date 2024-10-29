// controllers/discount.controller.ts

import { Request, Response, NextFunction } from 'express';
import { DiscountService } from '../services/discount.services';

export class DiscountController {
  // Get all discounts
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await DiscountService.getAllDiscounts();
      res.json(discounts);
    } catch (error) {
      next(error);
    }
  }

  // Create a new discount
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newDiscount = await DiscountService.createDiscount(req);
      res.json(newDiscount);
    } catch (error) {
      next(error);
    }
  }

  // Update an existing discount
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedDiscount = await DiscountService.updateDiscount(req);
      res.json(updatedDiscount);
    } catch (error) {
      next(error);
    }
  }

  // Delete a discount
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedDiscount = await DiscountService.deleteDiscount(req);
      res.json(deletedDiscount);
    } catch (error) {
      next(error);
    }
  }
}
