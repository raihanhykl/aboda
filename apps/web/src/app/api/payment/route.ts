// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
import Midtrans, { Snap } from 'midtrans-client';
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
    console.log('Is production mode:', snap.apiConfig.isProduction);
    console.log(order_token, 'ini order_token di route.ts');
    console.log(shippingCost, 'ini shipping cost di route.ts');
    console.log(order_id, 'ini orderid');

    const parameter: Midtrans.TransactionRequestBody = {
      transaction_details: {
        order_id,
        gross_amount: shippingCost,
      },
    };
    if (!token) {
      console.log(token, 'before isi token');
      token = await snap.createTransactionToken(parameter);
      console.log(token, 'after isi token');
    }
    console.log(token, 'ini token');
    token = await snap.createTransactionToken(parameter);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.error();
  }
}
