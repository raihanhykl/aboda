import validator from 'validator';
import { z } from 'zod';
export const registerSchema = z.object({
  first_name: z.string().max(20, {
    message: 'First name must be less than 20 characters',
  }),
  last_name: z.string().max(20, {
    message: 'Last name must be less than 20 characters',
  }),
  email: z.string().email({
    message: 'Invalid email address',
  }),
  phone_number: z
    .string()
    .optional() // Membuat phone_number bersifat opsional
    .refine(
      (value) => !value || value.length >= 8, // Validasi panjang minimal jika ada value
      {
        message: 'Mohon masukan nomor telepon yang valid (minimal 8 karakter).',
      },
    )
    .refine(
      (value) => !value || validator.isMobilePhone(value), // Validasi nomor telepon jika ada value
      {
        message: 'Mohon masukan nomor telepon yang valid.',
      },
    ),
  f_referral_code: z
    .string()
    .max(7, { message: 'Masukkan referral code yang valid.' }),
});

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

export const socialRegister = z.object({
  first_name: z.string().max(20, {
    message: 'First name must be less than 20 characters',
  }),
  last_name: z.string().max(20, {
    message: 'Last name must be less than 20 characters',
  }),
  email: z.string().email({
    message: 'Invalid email address',
  }),
  phone_number: z
    .string()
    .optional() // Membuat phone_number bersifat opsional
    .refine(
      (value) => !value || value.length >= 8, // Validasi panjang minimal jika ada value
      {
        message: 'Mohon masukan nomor telepon yang valid (minimal 8 karakter).',
      },
    )
    .refine(
      (value) => !value || validator.isMobilePhone(value), // Validasi nomor telepon jika ada value
      {
        message: 'Mohon masukan nomor telepon yang valid.',
      },
    ),
});
