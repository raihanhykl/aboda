import prisma from '@/prisma';

export const returnBranch = async () => {
  return await prisma.branch.findMany({
    where: {
      isActive: 1,
    },
    include: {
      AdminDetails: {
        include: {
          User: true,
        },
      },
      address: {
        include: {
          City: {
            include: {
              Province: true,
            },
          },
        },
      },
      ProductStocks: {
        include: {
          Product: true,
        },
      },
    },
  });
};

export const returnAdminDetail = async () => {
  return prisma.adminDetail.findMany({
    include: {
      User: true,
    },
    where: {
      branchId: null,
    },
  });
};
