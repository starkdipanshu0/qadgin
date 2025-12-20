export interface OrderProductType {
  productId: number;
  variantId?: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderType {
  id?: number;
  userId: string;
  email?: string;

  // Financials matching DB schema
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency?: string;

  status: string;
  createdAt?: Date;
  products: OrderProductType[];
}

export type OrderChartType = {
  month: string;
  total: number;
  successful: number;
  revenue: number;
};
