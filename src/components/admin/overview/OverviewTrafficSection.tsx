import { BarChart3, Globe, PhoneCall, Search, Share2, Video, Package, DollarSign } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewMetrics } from "@/lib/overview";

type Props = {
  metrics?: OverviewMetrics | undefined;
  isLoading?: boolean | undefined;
};

export function OverviewTrafficSection({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <Skeleton className="h-52 w-full" />
          </CardContent>
        </Card>
        <Card className="border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="h-64 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const sources = metrics.trafficSources;

  const getSourceIcon = (key: string) => {
    switch (key) {
      case "facebook":
        return <Share2 className="h-3.5 w-3.5 text-blue-600" />;
      case "google":
        return <Search className="h-3.5 w-3.5 text-red-500" />;
      case "tiktok":
        return <Video className="h-3.5 w-3.5 text-slate-800" />;
      case "youtube":
        return <Video className="h-3.5 w-3.5 text-red-600" />;
      case "manual":
        return <PhoneCall className="h-3.5 w-3.5 text-purple-600" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. Traffic Source Horizontal Bar Chart */}
      <Card className="lg:col-span-2 border bg-card/80 shadow-xs backdrop-blur-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            ট্র্যাফিক সোর্স পারফরম্যান্স (Traffic Source Performance)
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            কাস্টমার কোন চ্যানেল বা এড থেকে কতটি অর্ডার করেছেন
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {sources.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={sources}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}টি`}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0 && payload[0]) {
                        const data = payload[0].payload as (typeof sources)[0];
                        return (
                          <div className="rounded-xl border bg-popover/95 p-3 text-xs shadow-lg backdrop-blur-md space-y-1">
                            <p className="font-bold text-foreground border-b pb-1 mb-1 flex items-center gap-1.5">
                              {getSourceIcon(data.key)} {data.label}
                            </p>
                            <p className="font-semibold text-blue-600 flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" />
                              <span>মোট অর্ডার: {data.count} টি ({data.percentage.toFixed(1)}%)</span>
                            </p>
                            <p className="font-semibold text-emerald-600 flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>মোট সেলস: ৳{data.revenue.toLocaleString()}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22}>
                    {sources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Traffic Source Breakdown Table / List */}
      <Card className="border bg-card/80 shadow-xs backdrop-blur-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            চ্যানেল ব্রেকডাউন (Channel Breakdown)
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            সোর্স অনুযায়ী কনভার্সন ও রেভিনিউ হিসাব
          </p>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-3">
          {sources.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((item) => (
                <div
                  key={item.key}
                  className="rounded-xl border bg-muted/30 p-2.5 space-y-1.5 transition-all hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      {getSourceIcon(item.key)} {item.label}
                    </span>
                    <Badge variant="outline" className="font-bold text-[10px] bg-background">
                      {item.count} টি ({item.percentage.toFixed(1)}%)
                    </Badge>
                  </div>

                  <Progress value={item.percentage} className="h-1.5" />

                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>রেভিনিউ: ৳{item.revenue.toLocaleString()}</span>
                    <span>গড়: ৳{item.count > 0 ? Math.round(item.revenue / item.count) : 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
