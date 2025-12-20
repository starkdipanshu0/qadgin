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
  paymentId?: string;
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

export interface CreateOrderProductInput {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  email?: string;
  paymentId?: string;

  // Tax and Shipping are usually calculated by Payment/Checkout service
  // so we accept them, but we verify the subtotal ourselves.
  tax: number;
  shipping: number;

  currency?: string;

  products: CreateOrderProductInput[];

  // Status is optional, default PENDING
  status?: string;
}
