import { IUser, IUserDetail } from '@/interfaces/user';
import prisma from '@/prisma';
import Queue from 'bull';

export const userDeletionQueue = new Queue('userDeletion');

userDeletionQueue.process(async (job) => {
  prisma.$transaction(async (prisma) => {
    const userId = job.data.userId;
    const user = (await prisma.user.findFirst({
      where: {
        id: userId,
      },
    })) as IUser;

    if (user && !user.is_verified) {
      await prisma.userDetail.delete({
        where: {
          userId,
        },
      });
      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      console.log('User deleted due to unverified account');
    }
  });
});
