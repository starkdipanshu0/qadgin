"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { OrderChartType } from "@repo/types";
import { use } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import ClientOnly from "./ClientOnly";

const chartConfig = {
  total: {
    label: "Total Orders",
    color: "var(--chart-1)",
  },
  successful: {
    label: "Successful Orders",
    color: "var(--chart-2)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const AppBarChart = ({
  dataPromise,
}: {
  dataPromise: Promise<OrderChartType[]>;
}) => {
  const chartData = use(dataPromise);
  return (
    <ClientOnly>
      <div className="">
        <h1 className="text-lg font-medium mb-6">Total Revenue</h1>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} name="Revenue" />
          </BarChart>
        </ChartContainer>
      </div>
    </ClientOnly>
  );
};

export default AppBarChart;
