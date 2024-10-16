import { z } from 'zod';
import validator from 'validator';

export const addAddressSchema = z.object({
  street: z.string().min(1, { message: 'Mohon masukan alamat jalan Anda.' }),
  selectedProvince: z
    .string()
    .min(1, { message: 'Mohon pilih provinsi.' })
    .nullable()
    .refine((val) => val !== null, { message: 'Mohon pilih provinsi.' }),
  selectedCity: z
    .string()
    .min(1, { message: 'Mohon pilih kota.' })
    .nullable()
    .refine((val) => val !== null, { message: 'Mohon pilih kota.' }),
  lon: z.number().refine((val) => validator.isFloat(val.toString()), {
    message: 'Mohon masukan nilai longitude yang valid.',
  }),
  lat: z.number().refine((val) => validator.isFloat(val.toString()), {
    message: 'Mohon masukan nilai latitude yang valid.',
  }),
});
