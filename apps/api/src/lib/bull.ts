import { IUser, IUserDetail } from '@/interfaces/user';
import prisma from '@/prisma';
import Queue from 'bull';

export const userDeletionQueue = new Queue('userDeletion');
export const forgotPasswordQueue = new Queue('forgotPassword');

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

forgotPasswordQueue.process(async (job) => {
  const { email } = job.data;
  const user = (await prisma.user.findFirst({
    where: {
      email,
    },
  })) as IUser;
  if (user && user.is_forgot === 1) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        is_forgot: 0,
      },
    });
    console.log('Reset password is expired due to timeout');
  }
});
