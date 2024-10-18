'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

import Head from 'next/head';
import { Poppins } from 'next/font/google';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from '@/state/store';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Atur sesuai kebutuhan
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="text/javascript"
          src="https://app.midtrans.com/snap/snap.js"
          data-client-key="SB-Mid-client-c7SnHqsRuZTiamhl"
        ></script>
      </Head>
      <body
        className={
          poppins.className + ' min-h-screen flex flex-col justify-between'
        }
      >
        <Provider store={store}>
          <SessionProvider>
            {!pathname.includes('/signup') &&
              !pathname.includes('/signin') &&
              !pathname.includes('/verification') &&
              !pathname.includes('/forgot-password-form') && <Navbar />}
            {children}
            <Toaster />
            <Footer />
          </SessionProvider>
        </Provider>
      </body>
    </html>
  );
}
