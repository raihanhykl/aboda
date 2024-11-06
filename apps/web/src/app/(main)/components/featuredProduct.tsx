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
import { Branch } from '../shop/page';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { longitude, latitude } = useSelector(
    (state: RootState) => state.position,
  );

  useEffect(() => {
    if (latitude != 0 || longitude != 0) {
      const fetchMoreProducts = async () => {
        // Replace this with your actual API call
        const response = await api.get(
          `/product?page=1&limit=6&lat=${latitude}&long=${longitude}`,
        );
        // const newProducts = response.data.data.data;
        // const newProducts2 = newProducts[0].ProductStocks.map((stock: any) => ({
        //   id: stock.Product.id,
        //   branchId: stock.branchId,
        //   product_name: stock.Product.product_name,
        //   description: stock.Product.description,
        //   price: stock.Product.price,
        //   weight: stock.Product.weight,
        //   stock: stock.stock,
        //   image: stock.Product.image[0].imageUrl, // Ensure image is included if available
        //   category: stock.Product.categoryId,
        // }));
        const allProducts = response.data.data.data.flatMap((branch: Branch) =>
          branch.ProductStocks.map((stock) => ({
            id: stock.Product.id,
            branchId: stock.branchId,
            product_name: stock.Product.product_name,
            description: stock.Product.description,
            price: stock.Product.price,
            weight: stock.Product.weight,
            stock: stock.stock,
            image: stock.Product.image[0].imageUrl,
            category: stock.Product.categoryId,
          })),
        );

        console.log(allProducts, 'coyyy');
        setProducts(allProducts);
        setLoading(false);
      };

      fetchMoreProducts();
    }
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
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex-none w-64 sm:w-72 md:w-80">
                <ProductCardSkeleton button={false} />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((branch: any) => (
              <div key={branch.id} className="flex-none w-64 sm:w-72 md:w-80">
                <ProductCard key={branch.id} {...branch} />
              </div>
            ))
          ) : (
            <div>
              <p>No products found or out of service area!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
