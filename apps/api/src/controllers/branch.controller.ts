import { responseHandle } from '@/helpers/response';
import { BranchService } from '@/services/branch.services';
import { NextFunction, Request, Response } from 'express';

export class BranchController {
  async getAllBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BranchService.getAllBranch(req);
      return res.send(responseHandle('Success Get All Branch', data));
    } catch (error) {
      next(error);
    }
  }

  async getUnassignedAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BranchService.getAllUnassignedAdmin(req);
      return res.send(responseHandle('Success get all unassigned admin', data));
    } catch (error) {
      next(error);
    }
  }

  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BranchService.createStoreAdmin(req);
      return res.send(responseHandle('Success create admin', data));
    } catch (error) {
      next(error);
    }
  }

  async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BranchService.updateBranch(req);
      return res.send(responseHandle('Success update branch', data));
    } catch (error) {
      next(error);
    }
  }

  async addBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BranchService.addBranch(req);
      return res.send(responseHandle('Success add branch', data));
    } catch (error) {
      next(error);
    }
  }

  async deleteBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BranchService.deleteBranch(req);
      return res.send(responseHandle('Success delete branch', data));
    } catch (error) {
      next(error);
    }
  }

  async unassignAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BranchService.unassignAdmin(req);
      return res.send(responseHandle('Success unassign admin', data));
    } catch (error) {
      next(error);
    }
  }
}
