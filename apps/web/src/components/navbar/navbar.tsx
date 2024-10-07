'use client';
import { useState } from 'react';
import { ShoppingCart, User, Search, ChevronDown, Menu } from 'lucide-react';
import { actionLogout } from '@/action/auth.action';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const session = useSession();

  return (
    <nav className="bg-[#1B8057] text-white">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <ShoppingCart className="h-8 w-8" />
            <span className="text-2xl font-bold">aboda</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 flex-grow mx-8">
            <div className="flex flex-col">
              <span className="text-sm">Location</span>
              <div className="flex items-center">
                <span className="text-[#F8C519] mr-1">●</span>
                <span>Karawang, Indonesia</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
            </div>
            <div className="flex-grow">
              <div className="relative w-[80%]">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full py-2 px-4 pr-10 rounded-md bg-[#39906D] focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-[#93C2AF]" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-11">
            {session.data?.user.image ? (
              <>
                <img
                  src={session.data.user.image}
                  className="h-10 w-10 rounded-full"
                />
                <p>{session.data.user.email}</p>
              </>
            ) : (
              <ShoppingCart className="h-6 w-6" />
            )}
            <button className=" flex gap-3" onClick={() => actionLogout()}>
              <User className="h-6 w-6" />
              Logout
            </button>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Bottom bar - Desktop */}
        <div className="hidden md:flex justify-between py-2">
          {[
            'Home',
            'Shop',
            'Fruit',
            'Vegetable',
            'Beverages',
            'About Us',
            'Blogs',
          ].map((item) => (
            <a key={item} href="#" className="hover:text-green-200">
              {item}
            </a>
          ))}
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full py-2 px-4 pr-10 rounded-md bg-[#39906D] focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-[#93C2AF]" />
              </div>
            </div>
            <div className="flex flex-col space-y-2 pb-4">
              {[
                'Home',
                'Shop',
                'Fruit',
                'Vegetable',
                'Beverages',
                'About Us',
                'Blogs',
              ].map((item) => (
                <a key={item} href="#" className="hover:text-green-200">
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
