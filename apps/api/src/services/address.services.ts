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
        },
        include: {
          address: true,
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
    try {
      const { street, cityId, lon, lat } = req.body;

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

      const userAddress = await prisma.userAddress.create({
        data: {
          userId: Number(req.user.id),
          addressId: newAddress.id,
        },
      });

      return { message: 'Address added successfully' };
    } catch (error) {
      throw new ErrorHandler('Terjadi kesalahan saat menambahkan address', 400);
    }
  }
}
