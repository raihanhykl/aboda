export interface IBranch {
  id: number;
  branch_name: string;
  addressId: number;
  AdminDetails: IAdminDetail[];
  address: Address;
  ProductStocks: ProductStock[];
}

export interface IAdminDetail {
  id: number;
  userId: number;
  branchId: number;
  User: User;
}

export interface User {
  id: number;
  email: string;
  password: string | null;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  image: string | null;
  is_verified: number;
  is_forgot: number;
  created_at: string;
  updated_at: string;
  provider: string | null;
  roleId: number;
}

export interface Address {
  id: number;
  cityId: number;
  street: string;
  lon: number;
  lat: number;
  City: City;
}

export interface City {
  id: number;
  provinceId: number;
  city: string;
  Province: Province;
}

export interface Province {
  id: number;
  name: string;
}

export interface ProductStock {
  id: number;
  productId: number;
  branchId: number;
  stock: number;
  Product: Product;
}

export interface Product {
  id: number;
  categoryId: number;
  product_name: string;
  description: string;
  price: number;
  weight: number;
  storeAdminId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: number;
  addressId: number;
  userId: number;
  address: Address;
  isDefault: number; //kalo error, grgr ini
}
