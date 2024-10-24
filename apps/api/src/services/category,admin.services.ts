import prisma from '@/prisma'; // Sesuaikan path prisma client
import { Request, Response } from 'express';

export class CategoryService {
  // Mendapatkan semua kategori produk
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          Products: true,
        },
      });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  }

  static async createCategory(req: Request, res: Response) {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name cannot be empty' });
    }

    const existingCategory = await prisma.category.findFirst({
      where: { name },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: 'Category with this name already exists' });
    }

    try {
      const newCategory = await prisma.category.create({
        data: {
          name,
        },
      });
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create category' });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    const categoryId = parseInt(req.params.id);
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name cannot be empty' });
    }

    const existingCategory = await prisma.category.findFirst({
      where: { name },
    });

    if (existingCategory && existingCategory.id !== categoryId) {
      return res
        .status(400)
        .json({ message: 'Another category with this name already exists' });
    }

    try {
      const updatedCategory = await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          name,
        },
      });
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update category' });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    const categoryId = parseInt(req.params.id);

    try {
      await prisma.category.delete({
        where: {
          id: categoryId,
        },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete category' });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    const categoryId = parseInt(req.params.id);

    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          Products: true,
        },
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  }
}
