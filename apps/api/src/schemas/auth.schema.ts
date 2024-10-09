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
