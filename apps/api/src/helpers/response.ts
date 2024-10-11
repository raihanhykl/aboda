import prisma from '@/prisma';

export const responseHandle = (
  message: string,
  data: any,
  success: boolean = true,
) => {
  return {
    message,
    data,
    success,
  };
};

export class ErrorHandler extends Error {
  statuscode: number;
  constructor(message: string, status: number) {
    super(message);
    this.statuscode = status;
  }
}

export const referralVoucher = async (code: string, id: number) => {
  const res = await prisma.userDetail.findFirst({
    where: {
      referral_code: code,
    },
  });

  if (!res) throw new ErrorHandler('Invalid referral code', 400);

  await prisma.userVoucher.create({
    data: {
      userId: id,
      voucherId: 1,
      expires_at: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      is_valid: 1,
    },
  });
};

export const generateReferralCode = () => {
  return Math.random()
    .toString(36)
    .toLocaleUpperCase()
    .slice(2, 9)
    .padEnd(7, '0');
};
