export interface Address {
  id: number;
  address: {
    street: string;
    City: {
      id: number;
      city: string;
      Province: {
        name: string;
      };
    };
  };
}

export interface Voucher {
  id: number;
  voucher_name: string;
  discount_value: number;
}

export interface Cart {
  id: number;
  ProductStock: {
    Product: {
      id: number;
      product_name: string;
      price: number;
      weight: number;
    };
    Branch: {
      id: number;
      branch_name: string;
      address: {
        cityId: number;
      };
    };
  };
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
}

export interface ShippingCost {
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
}

export interface ShippingOption {
  code: string;
  name: string;
  costs: ShippingCost[];
}
