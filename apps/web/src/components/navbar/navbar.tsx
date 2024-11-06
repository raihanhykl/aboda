'use client';
import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  Menu,
  MapPin,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import NavbarButton from './navbar.button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { api } from '@/config/axios.config';
import { setPosition } from '@/state/position/positionSlice';
import Image from 'next/image';
import { setAddresses } from '@/state/addresses/addressesSlice';

interface Address {
  longitude: number;
  latitude: number;
  city: string;
  street: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const addresses = useSelector((state: RootState) => state.addresses);
  const dispatch = useDispatch();
  const { city, street } = useSelector((state: RootState) => state.position);
  const session = useSession();
  const [currentLocation, setCurrentLocation] = useState<{
    longitude: number;
    latitude: number;
    city: string;
    street: string;
  } | null>(addresses[0] || null);
  const getCurrentPosition = () =>
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          city: 'current',
          street: '',
        });
        dispatch(
          setPosition({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            city: 'current',
            street: '',
          }),
        );
      },
      (error) => {
        console.error('Error getting current location:', error);
      },
    );

  useEffect(() => {
    if (!session.data?.user) return;
    getCurrentPosition();
    const fetchAddresses = async () => {
      api
        .get('/user/get-all-user-addresses', {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        })
        .then((response) => {
          const formattedAddresses = response.data.data.map((item: any) => ({
            longitude: item.address.lon,
            latitude: item.address.lat,
            city: item.address.City.city,
            street: item.address.street,
          }));
          dispatch(setAddresses(formattedAddresses));
          for (let i = 0; i < response.data.data.length; i++) {
            if (response.data.data[i].isDefault == 1) {
              dispatch(
                setPosition({
                  longitude: response.data.data[i].address.lon,
                  latitude: response.data.data[i].address.lat,
                  city: response.data.data[i].address.City.city,
                  street: response.data.data[i].address.street,
                }),
              );
              break;
            }
          }
        });
    };

    if (session.status === 'authenticated') {
      fetchAddresses();
    }
  }, [session]);

  return (
    <nav className="sticky top-0 z-50 bg-[#1B8057] text-white">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <Link href="/">
            <div className="flex items-center space-x-4">
              <Image src="/logo-putih.png" alt="Logo" width={50} height={50} />
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-4 flex-grow mx-8">
            <div className="flex flex-col">
              <span className="text-sm pl-2">Location</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-white hover:bg-[#39906D] w-full justify-start "
                  >
                    <MapPin className="h-4 w-4 text-[#F8C519]" />
                    <div>
                      {city != 'current'
                        ? street && city && `${street}, ${city}`
                        : 'Current location'}
                    </div>
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {currentLocation && (
                    <DropdownMenuItem
                      onSelect={() => dispatch(setPosition(currentLocation))}
                    >
                      Use current location
                    </DropdownMenuItem>
                  )}
                  {addresses &&
                    addresses.map((address, index) => (
                      <DropdownMenuItem
                        key={index}
                        onSelect={() => dispatch(setPosition(address))}
                      >
                        {`${address.street}, ${address.city}`}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* <div className="flex-grow"> */}
            {/* <div className="relative w-[80%]"> */}
            {/* <input
                  type="text"
                  placeholder="Search..."
                  className="w-full py-2 px-4 pr-10 rounded-md bg-[#39906D] focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-[#93C2AF]" /> */}
            {/* </div> */}
            {/* </div> */}
          </div>
          <div className="flex items-center space-x-11">
            <NavbarButton />
            <button
              className={`md:hidden ${session.data?.user.roleId == 1 ? 'hidden' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Bottom bar - Desktop */}
        {session.data?.user && session.data?.user.roleId != 1 ? (
          <div className="hidden md:flex justify-between py-2">
            {[
              'Dashboard',
              'Discount Management',
              'Order Management',
              'Branches Management',
              'Product Management',
              'Inventory Management',
              // 'Blogs',
            ].map((item) => (
              <Link
                key={item}
                href={`${item === 'Dashboard' ? '/admin-dashboard' : '/admin-dashboard/' + item.split(' ')[0].toLocaleLowerCase()}`}
                className="hover:text-green-200"
              >
                {item}
              </Link>
            ))}
          </div>
        ) : null}

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
                'Dashboard',
                'Discount Management',
                'Order Management',
                'Branches Management',
                'Product Management',
                'Inventory Management',
                // 'Blogs',
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
