'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProductCard from '../../../components/card/card.product';
import ProductCardSkeleton from '@/components/card/skeleton.product';

const categories = [
  'Vegetables',
  'Fresh Fruits',
  'Milk & Eggs',
  'Bakery',
  'House Hold',
  'Dry Fruits',
  'Drinks',
];

const products = [
  {
    id: 1,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 2,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 3,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 4,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 5,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 6,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 7,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 8,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 9,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 10,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 11,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 12,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 13,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 14,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
  {
    id: 15,
    name: 'Fresh Kiwi',
    category: 'Fruits',
    price: 20000,
    image: '/hand-pick.jpg.webp',
  },
];

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  setTimeout(() => setIsLoading(false), 2000);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Shop</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <div className="sticky top-32">
            <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Category</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category}>
                      <Checkbox id={category} />
                      <label htmlFor={category} className="ml-2 text-sm">
                        {category}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Availability</h3>
                <ul className="space-y-2">
                  <li>
                    <Checkbox id="in-stock" />
                    <label htmlFor="in-stock" className="ml-2 text-sm">
                      In Stock
                    </label>
                  </li>
                  <li>
                    <Checkbox id="out-of-stock" />
                    <label htmlFor="out-of-stock" className="ml-2 text-sm">
                      Out of Stock
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
        <main className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by: Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              : products.map((product) => <ProductCard {...product} />)}
          </div>
        </main>
      </div>
    </div>
  );
}
