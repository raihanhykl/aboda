// src/pages/api/rajaongkir.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  if (method === 'POST') {
    try {
      const response = await axios.post(
        'https://api.rajaongkir.com/starter/cost',
        req.body,
        {
          headers: {
            key:
              process.env.RAJA_ONGKIR_KEY || '6217fa0987d802058e79fa9a345c6923', // Ganti dengan API key Anda
          },
        },
      );

      // Mengembalikan respons dari Raja Ongkir
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error('Error fetching data from Raja Ongkir:', error);
      res
        .status(error.response?.status || 500)
        .json({ message: 'Error fetching data' });
    }
  } else {
    // Mengirimkan respon 405 jika metode yang tidak diizinkan digunakan
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
