'use client';
import Image from 'next/image';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { CarouselAboda } from './(main)/components/carousel';
import FeaturedCategories from './(main)/components/categories';
import { FeaturedProducts } from './(main)/components/featuredProduct';
import { error } from 'console';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Home() {
  const [location, setLocation] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  // const [error, setError] = useState<string | null>(null);
  // const session = useSession();

  return (
    <>
      <div className="container mx-auto py-5">
        <CarouselAboda />
        <FeaturedCategories />
        <FeaturedProducts />
      </div>
    </>
  );
}
