import getDistanceFromLatLonInKm from '@/helpers/getDistance';
import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export class AddressService {
  static async getUserAddress(req: Request) {
    try {
      return await prisma.userAddress.findMany({
        where: {
          userId: Number(req.user.id),
          isActive: 1,
        },
        include: {
          address: {
            include: {
              City: {
                include: {
                  Province: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new ErrorHandler('Error getting user address', 400);
    }
  }
  static async getUserAddressWithin10KiloFromBranch(req: Request) {
    try {
      const maxDistance = 10;
      const userAddress = await prisma.userAddress.findMany({
        where: {
          userId: Number(req.user.id),
        },
        include: {
          address: {
            include: {
              City: {
                include: {
                  Province: true,
                },
              },
            },
          },
        },
      });

      const branchLocation = await prisma.cart.findFirst({
        where: {
          userId: Number(req.user.id),
        },
        include: {
          ProductStock: {
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

      const nearbyProduct = userAddress.filter((ua) => {
        const distance = getDistanceFromLatLonInKm(
          Number(branchLocation?.ProductStock?.Branch.address.lat),
          Number(branchLocation?.ProductStock?.Branch.address.lon),
          ua.address.lat,
          ua.address.lon,
        );

        if (distance <= maxDistance) {
          return true;
        }
      });

      return nearbyProduct;
    } catch (error) {
      throw new ErrorHandler('Error getting user address', 400);
    }
  }

  static async getProvinces(req: Request) {
    try {
      return await prisma.province.findMany({});
    } catch (error) {
      throw new ErrorHandler('Error getting province detail', 400);
    }
  }

  static async getCityByProvince(req: Request) {
    try {
      const { provinceId } = req.query;
      return await prisma.city.findMany({
        where: {
          provinceId: Number(provinceId),
        },
      });
    } catch (error) {
      throw new ErrorHandler('Error getting city detail', 400);
    }
  }

  static async createUserAddress(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const { street, cityId, lon, lat, isDefault } = req.body;

        if (!street || !cityId || !lon || !lat) {
          throw new ErrorHandler('All fields are required', 400);
        }

        const city = await prisma.city.findUnique({
          where: { id: parseInt(cityId) },
        });

        if (!city) {
          throw new ErrorHandler('City not found', 404);
        }

        if (!req.user.id) {
          throw new ErrorHandler('User not authenticated', 401);
        }

        const newAddress = await prisma.address.create({
          data: {
            street: street,
            cityId: city.id,
            lon: parseFloat(lon),
            lat: parseFloat(lat),
          },
        });

        return await prisma.userAddress.create({
          data: {
            userId: Number(req.user.id),
            addressId: newAddress.id,
            isDefault: Number(isDefault),
          },
          include: {
            address: {
              include: {
                City: {
                  include: {
                    Province: true,
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        throw new ErrorHandler(
          'Terjadi kesalahan saat menambahkan address',
          400,
        );
      }
    });
  }

  static async updateUserAddress(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const { addressId, street, cityId, lon, lat } = req.body;
        console.log(
          addressId,
          street,
          cityId,
          lon,
          lat,
          'ini req user address',
        );

        if (!addressId || !street || !cityId || !lon || !lat) {
          throw new ErrorHandler('All fields are required', 400);
        }

        const city = await prisma.city.findUnique({
          where: { id: parseInt(cityId) },
        });

        if (!city) {
          throw new ErrorHandler('City not found', 404);
        }

        if (!req.user.id) {
          throw new ErrorHandler('User not authenticated', 401);
        }

        return await prisma.address.update({
          where: {
            id: Number(addressId),
          },
          data: {
            street: street,
            cityId: city.id,
            lon: parseFloat(lon),
            lat: parseFloat(lat),
          },
        });
      } catch (error) {
        throw new ErrorHandler('Terjadi kesalahan saat mengupdate alamat', 400);
      }
    });
  }

  static async deleteUserAddress(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const { id } = req.body;
        console.log(id, 'ini req user address');
        if (!id) {
          throw new ErrorHandler('Address ID is required', 400);
        }
        if (!req.user.id) {
          throw new ErrorHandler('User not authenticated', 401);
        }
        const address = await prisma.userAddress.findUnique({
          where: { id: Number(id) },
        });
        if (address && address.isDefault == 1) {
          await prisma.userAddress.update({
            where: {
              id: Number(id),
            },
            data: {
              isActive: 0,
              isDefault: 0,
            },
          });
          const firstAddress = await prisma.userAddress.findFirst({
            where: {
              userId: Number(req.user.id),
            },
          });
          return await prisma.userAddress.update({
            where: {
              id: firstAddress?.id,
            },
            data: {
              isDefault: 1,
            },
          });
        } else {
          return await prisma.userAddress.update({
            where: {
              id: Number(id),
            },
            data: {
              isActive: 0,
            },
          });
        }
      } catch (error) {
        throw new ErrorHandler('Terjadi kesalahan saat menghapus alamat', 400);
      }
    });
  }

  static async setDefaultUserAddress(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const { userAddressId } = req.body;

        if (!userAddressId || !req.user.id) {
          throw new ErrorHandler('User address ID or user ID is missing', 400);
        }

        await prisma.userAddress.updateMany({
          where: {
            userId: Number(req.user.id),
          },
          data: {
            isDefault: 0,
          },
        });

        return await prisma.userAddress.update({
          where: {
            id: Number(userAddressId),
          },
          data: { isDefault: 1 },
        });
      } catch (error) {
        throw new ErrorHandler(
          'There was an error when setting default address',
          400,
        );
      }
    });
  }
}
