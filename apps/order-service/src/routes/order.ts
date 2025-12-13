import { Hono } from "hono";
import { shouldBeAdmin, shouldBeUser } from "../middleware/authMiddleware";
import { prisma } from "@repo/order-db";
import { startOfMonth, subMonths } from "date-fns";
import { OrderChartType } from "@repo/types";

export const orderRoute = new Hono();

orderRoute.get("/user-orders", shouldBeUser, async (c) => {
  const userId = c.get("userId");
  const orders = await prisma.order.findMany({ where: { userId } });
  return c.json(orders);
});

orderRoute.get("/orders", shouldBeAdmin, async (c) => {
  const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10;
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return c.json(orders);
});

orderRoute.get("/order-chart", shouldBeAdmin, async (c) => {
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const raw = (await prisma.order.aggregateRaw({
    pipeline: [
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
          successful: {
            $sum: {
              $cond: [{ $eq: ["$status", "success"] }, 1, 0],
            },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "success"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1,
          successful: 1,
          revenue: 1,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ],
  })) as unknown as any[];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const results: OrderChartType[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    const match = raw.find(
      (item) => item.year === year && item.month === month
    );

    results.push({
      month: monthNames[month - 1] as string,
      total: match ? match.total : 0,
      successful: match ? match.successful : 0,
      revenue: match ? match.revenue : 0,
    });
  }

  return c.json(results);
});
