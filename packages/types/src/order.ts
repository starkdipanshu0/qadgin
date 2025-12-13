import { Order } from "@repo/order-db";

export type OrderType = Order;

export type OrderChartType = {
  month: string;
  total: number;
  successful: number;
  revenue: number;
};
