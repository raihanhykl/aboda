'use client';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1B8057] text-white p-8 h-full">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8"
              >
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
              <span className="text-2xl font-bold">aboda</span>
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
