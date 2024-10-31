export interface Product {
  id: number;
  product_name: string;
  image: string;
  category: string;
  price: number;
  button?: boolean;
  isOutOfStock?: boolean;
}
