// controllers/discount.controller.ts

import { Request, Response, NextFunction } from 'express';
import { DiscountService } from '../services/discount.services';

export class DiscountController {
  // Get all discounts
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await DiscountService.getAllDiscounts();
      res.json(discounts);
    } catch (error) {
      next(error);
    }
  }

  // Create a new discount
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newDiscount = await DiscountService.createDiscount(req);
      res.json(newDiscount);
    } catch (error) {
      next(error);
    }
  }

  // Update an existing discount
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedDiscount = await DiscountService.updateDiscount(req);
      res.json(updatedDiscount);
    } catch (error) {
      next(error);
    }
  }

  // Delete a discount
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedDiscount = await DiscountService.deleteDiscount(req);
      res.json(deletedDiscount);
    } catch (error) {
      next(error);
    }
  }

  async getSelectedProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedDiscount = await DiscountService.getSelectedProduct(req);
      res.json(deletedDiscount);
    } catch (error) {
      next(error);
    }
  }
}
