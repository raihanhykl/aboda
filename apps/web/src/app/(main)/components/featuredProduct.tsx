'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import ProductCard, { Product } from '@/components/card/card.product';
import { api } from '@/config/axios.config';
import { set } from 'cypress/types/lodash';
import ProductCardSkeleton from '@/components/card/skeleton.product';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { longitude, latitude } = useSelector(
    (state: RootState) => state.position,
  );

  useEffect(() => {
    const fetchMoreProducts = async () => {
      // Replace this with your actual API call
      const response = await api.get(
        `/product?page=1&limit=6&lat=${latitude}&long=${longitude}`,
      );
      const newProducts = response.data.data.data;
      setProducts(newProducts);
      setLoading(false);
    };

    fetchMoreProducts();
  }, [longitude, latitude]);

  return (
    <section className="py-8 px-4 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <span className="text-gray-700">Featured </span>
            <span className="text-green-600">Products</span>
          </h2>
          <Button asChild variant="default">
            <Link href="/shop">
              View All Products
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex-none w-64 sm:w-72 md:w-80">
                  <ProductCardSkeleton button={false} />
                </div>
              ))
            : products.map((branch: any) =>
                branch.ProductStocks.map((product: any, index: number) => (
                  <div key={index} className="flex-none w-64 sm:w-72 md:w-80">
                    <ProductCard key={product.id} {...product.Product} />
                  </div>
                )),
              )}
        </div>
      </div>
    </section>
  );
}
