// @ts-ignore
import Midtrans, { Snap } from 'midtrans-client';
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/axios.config';
import { SNAP_MIDTRANS_CLIENT_KEY, SNAP_MIDTRANS_SERVER_KEY } from '@/config';

const snap = new Snap({
  isProduction: false,
  serverKey: `${SNAP_MIDTRANS_SERVER_KEY}`,
  clientKey: `${SNAP_MIDTRANS_CLIENT_KEY}`,
});

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      productName,
      price,
      quantity,
      shippingCost,
      order_id,
      order_token,
    } = await request.json();

    let token;

    const parameter: Midtrans.TransactionRequestBody = {
      transaction_details: {
        order_id,
        gross_amount: shippingCost,
      },
    };
    if (!token) {
      token = await snap.createTransactionToken(parameter);
    }
    token = await snap.createTransactionToken(parameter);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.error();
  }
}
