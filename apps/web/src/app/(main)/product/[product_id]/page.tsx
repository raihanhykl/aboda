'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';
import { api } from '@/config/axios.config';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/state/store'; // Adjust the path based on your project structure
import { fetchCart, selectCart } from '@/state/cart/cartSlice';
import { BASE_API_URL } from '@/config';

type Props = {
  params: {
    product_id: number;
  };
};

export default function ProductPage({ params }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [productStock, setProductStock] = useState<any>(null);
  const { toast } = useToast();
  const session = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector(selectCart);
  // const session = useSession();

  const { longitude, latitude } = useSelector(
    (state: RootState) => state.position,
  );

  const handleAddToCart = async () => {
    try {
      // const res = await api.post('/cart/add', {
      //   productStockId: productStock.id,
      //   quantityInput: quantity,
      // });

      const res = await api.post(
        '/cart/add',
        { productStockId: productStock.id, quantityInput: quantity },
        {
          headers: {
            Authorization: 'Bearer ' + session.data?.user?.access_token,
          },
        },
      );
      if (session.data?.user?.access_token) {
        dispatch(fetchCart(session.data.user.access_token));
      }

      toast({
        description: 'Product added to cart successfully',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  useEffect(() => {
    if (latitude != 0 || longitude != 0) {
      const fetchMoreProducts = async () => {
        // Replace this with your actual API call
        console.log(latitude, longitude, 'ini ya');

        const response = await api.get(
          `/product/get-branch?lat=${latitude}&long=${longitude}&productId=${params.product_id}`,
        );

        console.log(response.data.data, 'ini response.data');

        setProductStock(response.data.data);
      };

      fetchMoreProducts();
    }
  }, [longitude, latitude]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${params.product_id}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [params.product_id]);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Shop</h1>
      <nav className="text-sm mb-8">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <a href="#" className="text-gray-500">
              Home
            </a>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <a href="#" className="text-gray-500">
              Shop
            </a>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <a href="#" className="text-gray-500">
              Fruits
            </a>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <span className="text-gray-900">Product Details</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          {/* Product Image */}
          {product.image && product.image.length > 0 ? (
            <Image
              width={500}
              height={500}
              // src={product.images[0].imageUrl} // Display main product image
              src={`${BASE_API_URL}/product/${product.image[0].imageUrl}`}
              alt={product.product_name}
              className="aspect-square object-cover mb-4"
            />
          ) : (
            <div className="aspect-square bg-gray-200 mb-4"></div>
          )}

          {/* Additional Images */}
          {/* <div className="grid grid-cols-4 gap-4">
            {product.images.map((img: { imageUrl: string }, i: number) => (
              <div key={i} className="aspect-square">
                <Image
                  width={125}
                  height={125}
                  src={img.imageUrl}
                  alt={`${product.product_name} image ${i + 1}`}
                  className="object-cover"
                />
              </div>
            ))}
          </div> */}
        </div>

        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold mb-2">{product.product_name}</h2>
          <div className="mb-4">
            <span className="text-2xl font-bold mr-2">RP. {product.price}</span>
            {product.original_price && (
              <span className="text-gray-500 line-through">
                RP. {product.original_price}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-gray-600 mb-2">
            Branch:{' '}
            {productStock?.Branch?.branch_name || 'Branch not available'}
          </p>
          <p className="text-gray-600 mb-6">
            Stock: {productStock?.stock ?? 'Stock not available'}
          </p>

          <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" onClick={decrementQuantity}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 text-xl">{quantity}</span>
            <Button variant="outline" size="icon" onClick={incrementQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleAddToCart}
            disabled={
              session.status !== 'authenticated' ||
              productStock?.stock <= 0 ||
              session.data.user.roleId !== 1
            } // Disables if the user is not logged in
          >
            Add To Cart
          </Button>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Product Description</h3>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>100% Fresh Product</li>
            <li>Fast Delivery</li>
            <li>High Quality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
