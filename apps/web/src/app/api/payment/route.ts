// import { NextResponse } from 'next/server';
// // Import midtrans-client using require and destructure Snap directly
// // const midtransClient = require('midtrans-client');
// // import Midtrans, { Snap } from 'midtrans-client';
// // const midtransClient = require('midtrans-client');
// import midtransClient from 'midtrans-client';

// export async function POST(request: Request) {
//   try {
//     const { carts, shippingCost } = await request.json();

//     // Logging data yang diterima dari frontend
//     console.log('Received data:', { carts, shippingCost });

//     // Validasi data sebelum memproses transaksi
//     if (!carts || !shippingCost) {
//       return NextResponse.json(
//         {
//           message: 'Missing required fields: carts or shippingCost',
//         },
//         { status: 400 },
//       );
//     }

//     // Hitung total harga
//     const totalPrice = carts.reduce(
//       (total: number, cart: any) =>
//         total + cart.ProductStock.Product.price * cart.quantity,
//       0,
//     );

//     const grossAmount = totalPrice + shippingCost;

//     // Create instance of Snap using require-based import
//     // const snap = new midtransClient.Snap({
//     //   isProduction: false, // Set to true in production
//     //   serverKey: 'SB-Mid-server-p8qMfLxRBmt85nq7t9go50wU', // Replace with your actual server key
//     //   clientKey: 'SB-Mid-client-c7SnHqsRuZTiamhl',
//     // });
//     let snap = new midtransClient.Snap();

//     const transactionDetails = {
//       order_id: `order-${new Date().getTime()}`,
//       gross_amount: grossAmount,
//     };

//     const itemDetails = carts.map((cart: any) => ({
//       id: `item-${cart.ProductStock.Product.name}`,
//       price: cart.ProductStock.Product.price,
//       quantity: cart.quantity,
//       name: cart.ProductStock.Product.name,
//     }));

//     // Create the transaction with Midtrans
//     const transaction = await snap.createTransaction({
//       transaction_details: transactionDetails,
//       item_details: itemDetails,
//       customer_details: {
//         first_name: 'Customer',
//         email: 'customer@example.com',
//       },
//     });

//     return NextResponse.json({
//       token: transaction.token,
//       redirect_url: transaction.redirect_url,
//     });
//   } catch (error: any) {
//     console.error('Error creating transaction with Midtrans:', error.message);

//     return NextResponse.json(
//       {
//         message: 'Transaction failed',
//         error: error.message,
//       },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import Midtrans, { Snap } from 'midtrans-client';

const snap = new Snap({
  isProduction: false,
  serverKey: 'SB-Mid-server-p8qMfLxRBmt85nq7t9go50wU', // Replace with your actual server key
  clientKey: 'SB-Mid-client-c7SnHqsRuZTiamhl',
});

export async function POST(request: NextRequest) {
  try {
    const { id, productName, price, quantity, shippingCost } =
      await request.json();

    console.log(shippingCost, 'ini shipping cost di route.ts');

    // const { carts, shippingCost } = await request.json();
    const parameter: Midtrans.TransactionRequestBody = {
      // item_details: {
      //   name: productName,
      //   price: price,
      //   quantity: quantity,
      // },
      transaction_details: {
        order_id: `order-${new Date().getTime()}`,
        gross_amount: shippingCost,
      },
    };

    const token = await snap.createTransactionToken(parameter);
    console.log(token, 'ini token');

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.error();
  }
}
