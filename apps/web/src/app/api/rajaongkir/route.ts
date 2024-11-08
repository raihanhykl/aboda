// src/app/api/rajaongkir/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { RAJA_ONGKIR, RAJA_ONGKIR_KEY } from '@/config';

export async function POST(request: Request) {
  try {
    const { origin, destination, weight, courier } = await request.json();
    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: origin, destination, weight, courier',
        },
        { status: 400 },
      );
    }

    const response = await axios.post(
      `${RAJA_ONGKIR}`,
      {
        origin: origin.toString(),
        destination: destination.toString(),
        weight: weight,
        courier: courier.toLowerCase(),
      },
      {
        headers: {
          key: `${RAJA_ONGKIR_KEY}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      'Error fetching data from Raja Ongkir:',
      error.response?.data || error.message,
    );
    return NextResponse.json(
      {
        message: 'Error fetching data',
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 },
    );
  }
}
