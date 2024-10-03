'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

import Head from 'next/head';
import { Poppins } from 'next/font/google';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';
import { usePathname } from 'next/navigation';

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
      </Head>
      <body
        className={
          poppins.className + ' min-h-screen flex flex-col justify-between'
        }
      >
        {!pathname.includes('/signup') && !pathname.includes('/signin') && (
          <Navbar />
        )}
        {children}
        <Footer />
      </body>
    </html>
  );
}
