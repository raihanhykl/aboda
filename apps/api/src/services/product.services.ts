import getDistanceFromLatLonInKm from '@/helpers/getDistance';
import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Branch, Prisma } from '@prisma/client';
import { Request } from 'express';

export class ProductService {
  // Untuk Search

  static async getAllProducts(req: Request) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 8;
      const skip = (page - 1) * limit;
      const { lat, long, name } = req.query;
      const maxDistance = 10;

      // console.log(lat, 'ini lat', long, 'ini long', name, 'ini name');

      // Filter produk berdasarkan nama jika ada
      const productFilter = name
        ? {
            ProductStocks: {
              some: {
                Product: {
                  product_name: {
                    contains: String(name),
                    // mode: 'insensitive',
                  },
                },
              },
            },
          }
        : {};

      // Ambil cabang yang memiliki produk yang sesuai dengan filter
      const branches = await prisma.branch.findMany({
        include: {
          address: true,
          ProductStocks: true,
        },
        // skip: skip,
        // take: limit,
      });

      const shortest: { branch: Branch | undefined; distance: number } = {
        branch: undefined,
        distance: Infinity,
      };

      // Filter cabang berdasarkan jarak dan hitung jarak terdekat
      const nearbyProduct = branches.filter((branch) => {
        const distance = getDistanceFromLatLonInKm(
          Number(lat),
          Number(long),
          branch.address.lat,
          branch.address.lon,
        );

        if (distance <= maxDistance && distance < shortest.distance) {
          shortest.branch = branch;
          shortest.distance = distance;
        }
      });

      const branchesFiltered = await prisma.branch.findMany({
        where: {
          // id: 1,
          id: shortest.branch?.id || 1,
          ...productFilter,
        },
        include: {
          address: true,
          ProductStocks: {
            where: name
              ? {
                  Product: {
                    product_name: {
                      contains: String(name),
                    },
                  },
                }
              : {}, //
            include: {
              Product: {
                include: {
                  image: true,
                },
              },
            },
            skip: skip,
            take: limit,
          },
        },
        // skip: skip,
        // take: limit,
      });

      // const total = branchesFiltered.reduce(
      //   (acc, branch) => acc + branch.ProductStocks.length,
      //   0,
      // );

      const total = await prisma.productStock.count({
        where: {
          // branchId: 1,
          branchId: shortest.branch?.id,
          Product: {
            product_name: {
              contains: name ? String(name) : '',
            },
          },
        },
      });

      // const testing = await prisma.branch.findMany({
      //   where: {
      //     id: 1,
      //   },
      //   include: {
      //     ProductStocks: {
      //       where: {
      //         Product: {
      //           product_name: {
      //             contains: '',
      //           },
      //         },
      //       },
      //       include: {
      //         Product: {
      //           include: {
      //             image: true,
      //           },
      //         },
      //       },
      //       skip: skip,
      //       take: limit,
      //     },
      //   },
      // });

      return {
        data: branchesFiltered,
        // data: testing,
        total,
      };
    } catch (error) {
      throw new ErrorHandler('Failed to fetch products', 500);
    }
  }

  static async searchProducts(req: Request) {
    try {
      const { name } = req.query;

      if (!name) {
        throw new ErrorHandler('Product name is required', 400);
      }

      return await prisma.product.findMany({
        where: {
          product_name: {
            contains: String(name).toLowerCase(),
          },
        },
        include: {
          ProductStocks: {
            include: {
              Branch: true,
            },
          },
        },
      });
    } catch (error) {
      throw new ErrorHandler('Failed to search products', 500);
    }
  }

  static async getProductById(req: Request) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          image: true,
          ProductStocks: {
            include: {
              Branch: {
                include: {
                  address: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      return product;
    } catch (error) {
      throw new ErrorHandler('Failed to fetch product', 500);
    }
  }
  static async getProductDetail(req: Request) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          ProductStocks: {
            include: {
              Branch: {
                include: {
                  address: true,
                },
              },
            },
          },
          image: true,
          discounts: true,
        },
      });
      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }
      const productWithImages = {
        ...product,
        image: product.image.map((img) => ({
          ...img,
          imageUrl: `/images/product/${img.imageUrl}`,
        })),
      };
      return productWithImages;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw new ErrorHandler('Failed to fetch product details', 500);
    }
  }
  // Product Management
  static async getAllProductsManagement(req: Request) {
    try {
      const products = await prisma.product.findMany({
        include: {
          ProductStocks: {
            include: {
              Branch: {
                select: {
                  id: true,
                  branch_name: true,
                },
              },
            },
          },
          image: true,
        },
      });

      if (products.length === 0) {
        throw new ErrorHandler('No products found', 404);
      }

      const formattedProducts = products.map((product) => ({
        id: product.id,
        name: product.product_name,
        description: product.description,
        price: product.price,
        category: product.categoryId,
        images: product.image.map((img) => ({
          imageUrl: `/images/product/${img.imageUrl}`,
        })),
        branches: product.ProductStocks.map((stock) => ({
          branchId: stock.Branch.id,
          branchName: stock.Branch.branch_name,
        })),
      }));

      return formattedProducts;
    } catch (error) {
      console.error('Error fetching all products for management:', error);
      throw new ErrorHandler('Failed to fetch products for management', 500);
    }
  }

  static async getProductStockByBranch(req: Request) {
    try {
      let stock;
      const maxDistance = 10;
      const { lat, long, productId } = req.query;

      const branches = await prisma.branch.findMany({
        include: {
          address: true,
          ProductStocks: true,
        },
      });

      const shortest: { branch: Branch | undefined; distance: number } = {
        branch: undefined,
        distance: Infinity,
      };

      // Filter cabang berdasarkan jarak dan hitung jarak terdekat
      const nearbyProduct = branches.filter(async (branch) => {
        const distance = getDistanceFromLatLonInKm(
          Number(lat),
          Number(long),
          branch.address.lat,
          branch.address.lon,
        );

        if (distance <= maxDistance && distance < shortest.distance) {
          shortest.branch = branch;
          shortest.distance = distance;
        }
        console.log(shortest.branch?.id, 'ini id');
        console.log(shortest.branch?.branch_name);
        console.log(productId, 'ini product_id');
      });
      return await prisma.productStock.findFirst({
        include: {
          Branch: true,
        },
        where: {
          branchId: shortest.branch?.id,
          productId: Number(productId),
        },
      });

      return stock;
    } catch (error) {}
  }
}
