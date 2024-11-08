import axios from 'axios';
import { api } from '@/config/axios.config';
import { Cart, ShippingOption } from './types';

export const fetchShippingCost = async (
  courier: string,
  destination: number | null,
  weight: number,
  origin: number | null,
  setShippingOptions: React.Dispatch<React.SetStateAction<ShippingOption[]>>,
) => {
  if (courier && destination && weight > 0 && origin) {
    try {
      const response = await axios.post('/api/rajaongkir', {
        origin,
        destination,
        weight,
        courier,
      });
      const results = response.data.rajaongkir.results;
      const shippingServices: ShippingOption[] = results.map((result: any) => ({
        code: result.code,
        name: result.name,
        costs: result.costs,
      }));

      setShippingOptions(shippingServices);
    } catch (error) {
      console.error('Error fetching shipping details:', error);
    }
  }
};

export const applyDiscounts = async (
  initialCarts: Cart[],
  token: string | undefined,
) => {
  const updatedCarts = await Promise.all(
    initialCarts.map(async (cart) => {
      const discount = await getDiscount(
        cart.ProductStock.Branch.id,
        cart.ProductStock.Product.id,
        token,
      );
      let discountAmount = 0;

      if (discount) {
        if (discount.discount_type === 'percentage') {
          discountAmount =
            (cart.ProductStock.Product.price * discount.discount_value) / 100;
        } else if (discount.discount_type === 'fixed') {
          discountAmount = discount.discount_value;
        }
      }

      return {
        ...cart,
        originalPrice: cart.ProductStock.Product.price,
        discountedPrice: Math.max(
          cart.ProductStock.Product.price - discountAmount,
          0,
        ),
      };
    }),
  );

  return updatedCarts;
};

const getDiscount = async (
  branchId: number,
  productId: number,
  token: string | undefined,
) => {
  try {
    const { data } = await api.get('/discount/get-product', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: { branchId, productId },
    });
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching discount:', error);
    return null;
  }
};
