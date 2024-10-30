'use client';

import { useEffect, useState } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/config/axios.config';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';

const categories = [
  'Vegetables',
  'Fresh Fruits',
  'Milk & Eggs',
  'Bakery',
  'House Hold',
  'Dry Fruits',
  'Drinks',
];

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input
  const itemsPerPage = 2;
  const { longitude, latitude } = useSelector(
    (state: RootState) => state.position,
  );

  const performSearch = async () => {
    try {
      const res = await api.get(
        `/product?page=${currentPage}&limit=${itemsPerPage}&lat=${latitude}&long=${longitude}&name=${searchQuery}`,
      );
      console.log(res, 'ini ressss');
      setProducts(res.data.data.data);
      setTotalPages(Math.ceil(Number(res.data.data.total) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [currentPage, longitude, latitude, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
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
              ? Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              : products.map((branch: any) =>
                  branch.ProductStocks.map((product: any) => (
                    <ProductCard key={product.id} {...product.Product} />
                  )),
                )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Showing only first, last, and nearby pages */}
            {currentPage > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
                {currentPage > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled
                  >
                    ...
                  </Button>
                )}
              </>
            )}
            <Button variant="default" size="icon" className="h-8 w-8">
              {currentPage}
            </Button>
            {currentPage < totalPages && (
              <>
                {currentPage < totalPages - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled
                  >
                    ...
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
