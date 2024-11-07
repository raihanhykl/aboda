import { z } from 'zod';
import validator from 'validator';
export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string({ message: 'Mohon masukan kata sandi Anda.' })
    .min(6, {
      message:
        'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
    })
    .regex(/[a-zA-Z]/, {
      message:
        'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
    })
    .regex(/[0-9]/, {
      message:
        'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
    })
    .trim(),
});

export const registerSchema = z.object({
  first_name: z.string().min(1, { message: 'Mohon masukan nama depan Anda.' }),
  last_name: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  phone_number: z
    .string({ message: 'Mohon masukan nomor telepon Anda.' })
    .min(8, {
      message: 'Mohon masukan nomor telepon yang valid.',
    })
    .refine(validator.isMobilePhone, {
      message: 'Mohon masukan nomor telepon yang valid.',
    }),
  f_referral_code: z
    .string()
    .max(7, { message: 'Masukkan referral code yang valid.' }),
});

export const setFirstPassword = z
  .object({
    password: z
      .string({ message: 'Mohon masukan kata sandi Anda.' })
      .min(6, {
        message:
          'Mohon masukan kata sandi anda como Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[a-zA-Z]/, {
        message:
          'Mohon masukan kata sandi anda como Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[0-9]/, {
        message:
          'Mohon masukan kata sandi anda como Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .trim(),
    confirmPassword: z
      .string({ message: 'Mohon masukan kata sandi Anda.' })
      .min(6, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[a-zA-Z]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[0-9]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .trim(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: "Confirm password doesn't match with your new password",
        path: ['confirmPassword'],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const editProfileSchema = z.object({
  first_name: z.string().min(1, { message: 'Mohon masukan nama depan Anda.' }),
  last_name: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  phone_number: z
    .string({ message: 'Mohon masukan nomor telepon Anda.' })
    .min(8, {
      message: 'Mohon masukan nomor telepon yang valid.',
    })
    .refine(validator.isMobilePhone, {
      message: 'Mohon masukan nomor telepon yang valid.',
    }),
});

export const createAdminSchema = z.object({
  first_name: z.string().min(1, { message: 'Mohon masukan nama depan Admin.' }),
  last_name: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  phone_number: z
    .string({ message: 'Mohon masukan nomor telepon Admin.' })
    .min(8, {
      message: 'Mohon masukan nomor telepon yang valid.',
    })
    .refine(validator.isMobilePhone, {
      message: 'Mohon masukan nomor telepon yang valid.',
    }),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({ message: 'Mohon masukan kata sandi Anda.' })
      .min(6, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[a-zA-Z]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[0-9]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .trim(),
    newPassword: z
      .string({ message: 'Mohon masukan kata sandi Anda.' })
      .min(6, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[a-zA-Z]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[0-9]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .trim(),
    confirmPassword: z
      .string({ message: 'Mohon masukan kata sandi Anda.' })
      .min(6, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[a-zA-Z]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .regex(/[0-9]/, {
        message:
          'Mohon masukan kata sandi anda sebagai Kata sandi minimal harus 6 karakter, berisi huruf dan angka',
      })
      .trim(),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: "Confirm password doesn't match with your new password",
        path: ['confirmPassword'],
      });
    }
  });
