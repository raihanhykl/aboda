// import prisma from '@/prisma'; // Sesuaikan path prisma client
// import { Request, Response } from 'express';

// export class CategoryService {
//   // Mendapatkan semua kategori produk
//   static async getAllCategories(req: Request, res: Response) {
//     try {
//       const categories = await prisma.category.findMany({
//         orderBy: {
//           name: 'asc',
//         },
//         include: {
//           Products: true,
//         },
//       });
//       // res.json(categories);
//       return categories;
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to fetch categories' });
//     }
//   }

//   static async createCategory(req: Request, res: Response) {
//     const { name, image } = req.body;

//     if (!name || name.trim() === '') {
//       return res.status(400).json({ message: 'Category name cannot be empty' });
//     }

//     const existingCategory = await prisma.category.findFirst({
//       where: { name },
//     });

//     if (existingCategory) {
//       return res
//         .status(400)
//         .json({ message: 'Category with this name already exists' });
//     }

//     try {
//       const newCategory = await prisma.category.create({
//         data: {
//           name,
//           image,
//         },
//       });

//       return res.status(201).json(newCategory);
//     } catch (error) {
//       return res.status(500).json({ message: 'Failed to create category' });
//     }
//   }

//   static async updateCategory(req: Request, res: Response) {
//     const categoryId = parseInt(req.params.id);
//     const { name } = req.body;

//     if (!name || name.trim() === '') {
//       return res.status(400).json({ message: 'Category name cannot be empty' });
//     }

//     const existingCategory = await prisma.category.findFirst({
//       where: { name },
//     });

//     if (existingCategory && existingCategory.id !== categoryId) {
//       return res
//         .status(400)
//         .json({ message: 'Another category with this name already exists' });
//     }

//     try {
//       const updatedCategory = await prisma.category.update({
//         where: {
//           id: categoryId,
//         },
//         data: {
//           name,
//         },
//       });
//       res.json(updatedCategory);
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to update category' });
//     }
//   }

//   static async deleteCategory(req: Request, res: Response) {
//     const categoryId = parseInt(req.params.id);

//     try {
//       await prisma.category.delete({
//         where: {
//           id: categoryId,
//         },
//       });
//       res.status(204).send();
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to delete category' });
//     }
//   }

//   static async getCategoryById(req: Request, res: Response) {
//     const categoryId = parseInt(req.params.id);

//     try {
//       const category = await prisma.category.findUnique({
//         where: { id: categoryId },
//         include: {
//           Products: true,
//         },
//       });

//       if (!category) {
//         return res.status(404).json({ message: 'Category not found' });
//       }

//       res.json(category);
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to fetch category' });
//     }
//   }
// }
import { Request } from 'express';
import prisma from '@/prisma';
import { ErrorHandler } from '@/helpers/response';

export class CategoryService {
  // Mendapatkan semua kategori produk
  static async getAllCategories() {
    try {
      return await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { Products: true },
      });
    } catch (error) {
      throw new ErrorHandler('Gagal mengambil kategori', 500);
    }
  }

  // Membuat kategori baru
  static async createCategory(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const { name } = req.body;
        const image = req.file;

        if (!name || name.trim() === '') {
          throw new ErrorHandler('Nama kategori tidak boleh kosong', 400);
        }

        const existingCategory = await prisma.category.findFirst({
          where: { name },
        });
        if (existingCategory) {
          throw new ErrorHandler('Kategori dengan nama ini sudah ada', 400);
        }

        const newCategory = await prisma.category.create({
          data: {
            name,
            image: image?.filename,
          },
        });

        return newCategory;
      } catch (error) {
        if (error instanceof ErrorHandler) {
          throw error;
        }
        throw new ErrorHandler('Gagal membuat kategori', 500);
      }
    });
  }

  static async updateCategory(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const { id } = req.params;
        const { name } = req.body;
        const image = req.file?.path || '';

        if (!name || name.trim() === '') {
          throw new ErrorHandler('Nama kategori tidak boleh kosong', 400);
        }

        const existingCategory = await prisma.category.findFirst({
          where: { name },
        });
        if (existingCategory && existingCategory.id !== Number(id)) {
          throw new ErrorHandler(
            'Kategori lain dengan nama ini sudah ada',
            400,
          );
        }

        const updatedCategory = await prisma.category.update({
          where: { id: Number(id) },
          data: {
            name,
            image,
          },
        });

        return updatedCategory;
      } catch (error) {
        if (error instanceof ErrorHandler) {
          throw error;
        }
        throw new ErrorHandler('Gagal memperbarui kategori', 500);
      }
    });
  }

  // Menghapus kategori berdasarkan ID
  static async deleteCategory(req: Request) {
    try {
      const { id } = req.params;

      await prisma.category.delete({
        where: { id: Number(id) },
      });

      return { message: 'Kategori berhasil dihapus' };
    } catch (error) {
      throw new ErrorHandler('Gagal menghapus kategori', 500);
    }
  }

  // Mendapatkan kategori berdasarkan ID
  static async getCategoryById(req: Request) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id: Number(id) },
        include: { Products: true },
      });

      if (!category) {
        throw new ErrorHandler('Kategori tidak ditemukan', 404);
      }

      return category;
    } catch (error) {
      throw new ErrorHandler('Gagal mengambil kategori', 500);
    }
  }
}
