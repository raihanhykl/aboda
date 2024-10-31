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
        skip: skip,
        take: limit,
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
          id: shortest.branch?.id,
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
              Product: true,
            },
          },
        },
        skip: skip,
        take: limit,
      });

      const total = branchesFiltered.reduce(
        (acc, branch) => acc + branch.ProductStocks.length,
        0,
      );

      return {
        data: branchesFiltered,
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
}
