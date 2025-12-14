export interface OrderProductType {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderType {
  id?: number;
  userId: string;
  email?: string;
  amount: number;
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
