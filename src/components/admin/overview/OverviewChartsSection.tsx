import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, Package, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewMetrics } from "@/lib/overview";

type Props = {
  metrics?: OverviewMetrics | undefined;
  isLoading?: boolean | undefined;
};

export function OverviewChartsSection({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
        <Card className="border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const trends = metrics.dailyTrends;
  const breakdown = metrics.statusBreakdown;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. Sales & Orders Trend Line/Area Chart */}
      <Card className="lg:col-span-2 border bg-card/80 shadow-xs backdrop-blur-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              সেলস ও অর্ডার ট্রেন্ড (Sales & Orders Trend)
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              দিন ভিত্তিক মোট সেলস (টাকা) ও অর্ডারের পরিবর্তন
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
              রেভিনিউ (৳)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
              অর্ডার (টি)
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {trends.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-muted-foreground">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trends}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}টি`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const rev = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;
                        const ord = payload.find((p) => p.dataKey === "orders")?.value ?? 0;
                        return (
                          <div className="rounded-xl border bg-popover/95 p-3 text-xs shadow-lg backdrop-blur-md space-y-1">
                            <p className="font-bold text-foreground border-b pb-1 mb-1">{label}</p>
                            <p className="font-semibold text-blue-600 flex items-center gap-1">
                              <Banknote className="h-3.5 w-3.5 text-blue-600" /> সেলস: ৳{Number(rev).toLocaleString()}
                            </p>
                            <p className="font-semibold text-emerald-600 flex items-center gap-1">
                              <Package className="h-3.5 w-3.5 text-emerald-600" /> অর্ডার: {ord} টি
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="রেভিনিউ"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="অর্ডার"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Order Status Donut Chart */}
      <Card className="border bg-card/80 shadow-xs backdrop-blur-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-indigo-600" />
            অর্ডার স্ট্যাটাস (Status Ratio)
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            স্ট্যাটাস অনুযায়ী অর্ডারের শতকরা ভাগ
          </p>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col items-center justify-center">
          {breakdown.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              <div className="relative h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="label"
                    >
                      {breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0 && payload[0]) {
                          const rawData = payload[0].payload;
                          if (!rawData) return null;
                          const data = rawData as (typeof breakdown)[0];
                          const total = metrics?.totalOrders ?? 0;
                          const pct =
                            total > 0
                              ? ((data.count / total) * 100).toFixed(1)
                              : 0;
                          return (
                            <div className="rounded-lg border bg-popover/95 p-2 text-xs shadow-md backdrop-blur-md">
                              <p className="font-bold text-foreground">{data.label}</p>
                              <p className="font-medium text-muted-foreground">
                                {data.count} টি ({pct}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>

                {/* Center text in donut chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-foreground">
                    {metrics.totalOrders}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    মোট অর্ডার
                  </span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="w-full grid grid-cols-2 gap-2 text-xs font-semibold pt-1 border-t">
                {breakdown.map((item) => (
                  <div key={item.status} className="flex items-center gap-2 truncate">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-muted-foreground">
                      {item.label.split(" ")[0]} ({item.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
