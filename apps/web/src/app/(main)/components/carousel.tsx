'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import petani from '@/../public/petani.png';
import handPick from '@/../public/hand-pick.jpg.webp';

const carouselItems = [
  {
    title: 'Your Daily Essentials With Ease',
    description:
      'Aboda memastikan belanja nyaman, aman, dan cepat, dengan registrasi mudah, pembayaran fleksibel, dan pengiriman tepat waktu.',
    buttonText: 'Shop Now',
    buttonLink: '/carts',
    image: '/petani.png',
  },
  {
    title: 'Fresh Produce at Your Doorstep',
    description:
      'Get farm-fresh fruits and vegetables delivered straight to your home.',
    buttonText: 'Explore Produce',
    buttonLink: '/produce',
    image: '/farmet-riset.png.jpg',
  },
  {
    title: 'Discover Local Flavors',
    description:
      'Support local farmers and artisans with our curated selection of regional specialties.',
    buttonText: 'Shop Local',
    buttonLink: '/local',
    image: '/hand-pick.jpg.webp',
  },
];

export function CarouselAboda() {
  const plugin = React.useRef(
    Autoplay({ delay: 1000, stopOnInteraction: true }),
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {carouselItems.map((item, index) => (
          <CarouselItem key={index}>
            <Card className="border-none bg-[#F5F5F5] rounded-3xl">
              <CardContent className="flex flex-row items-center p-0 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]">
                <div className="w-1/2 p-3 sm:p-4 md:p-6 lg:p-12 space-y-1 sm:space-y-2 md:space-y-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold tracking-tight line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 md:line-clamp-none">
                    {item.description}
                  </p>
                  <Button asChild size={'sm'} className="text-xs sm:text-sm">
                    <Link href={item.buttonLink}>{item.buttonText}</Link>
                  </Button>
                </div>
                <div className="w-1/2 h-[150px] sm:h-[200px] md:h-[300px] lg:h-[400px] relative">
                  {' '}
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    className=" rounded-3xl border-none"
                  />
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className=" absolute left-0" />
      <CarouselNext className=" absolute right-0" />
    </Carousel>
  );
}
