// src/app/api/rajaongkir/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { origin, destination, weight, courier } = await request.json();

    // Logging data yang diterima dari frontend
    console.log('Received data:', { origin, destination, weight, courier });

    // Validasi data sebelum mengirim ke Raja Ongkir
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
      'https://api.rajaongkir.com/starter/cost',
      {
        origin: origin.toString(),
        destination: destination.toString(),
        weight: weight,
        courier: courier.toLowerCase(),
      },
      {
        headers: {
          key: '6217fa0987d802058e79fa9a345c6923',
        },
      },
    );

    // Logging respons dari Raja Ongkir
    console.log('Raja Ongkir response:', response.data);
    console.log(weight);

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
