'use client';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#1B8057] text-white p-8 h-full mx-[15px] my-[15px] rounded-[16px]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex justify-center">
              <Image src="/logo-putih.png" alt="Logo" width={60} height={60} />
            </Link>
            <p className="text-xs">
              Aboda memastikan belanja nyaman, aman, dan cepat, dengan
              registrasi mudah, pembayaran fleksibel, dan pengiriman tepat
              waktu.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/career">Career</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-4">Customer Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account">My Account</Link>
              </li>
              <li>
                <Link href="/track-order">Track Your Order</Link>
              </li>
              <li>
                <Link href="/return">Return</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className=" font-semibold mb-4">Our Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">User Terms & Condition</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className=" font-semibold mb-4">Contact Info</h3>
            <p className=" text-sm">+62861527498</p>
            <p className=" text-sm">aboda@gmail.com</p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t-[1px] border-white  text-center">
          <p>Copyright©2024 Aboda Corp. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
