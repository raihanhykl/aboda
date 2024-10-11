import Image from 'next/image';
import Link from 'next/link';

type Category = {
  name: string;
  productCount: number;
  image: string;
  slug: string;
};

const categories: Category[] = [
  {
    name: 'Vegetables',
    productCount: 10,
    image: '/hand-pick.jpg.webp',
    slug: 'vegetables',
  },
  {
    name: 'Fresh Fruits',
    productCount: 68,
    image: '/hand-pick.jpg.webp',

    slug: 'fresh-fruits',
  },
  {
    name: 'Milk & Eggs',
    productCount: 29,
    image: '/hand-pick.jpg.webp',
    slug: 'milk-and-eggs',
  },
  {
    name: 'Bakery',
    productCount: 1,
    image: '/hand-pick.jpg.webp',
    slug: 'bakery',
  },
  { name: 'Meat', productCount: 8, image: '/hand-pick.jpg.webp', slug: 'meat' },
  {
    name: 'House Hold',
    productCount: 3001,
    image: '/hand-pick.jpg.webp',

    slug: 'house-hold',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center mb-8">
          <span className="text-3xl font-bold text-gray-700">Featured </span>
          <span className="text-3xl font-bold text-green-600">Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-12">
          {categories.map((category) => (
            <Link
              href={`/shop/${category.slug}`}
              key={category.slug}
              className="group"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden group-hover:ring-4 group-hover:ring-green-500 transition-all duration-300">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 188px, 188px"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-md font-semibold text-center">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.productCount} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
