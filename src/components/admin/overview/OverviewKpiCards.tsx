import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Package,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Truck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewMetrics } from "@/lib/overview";

type Props = {
  metrics?: OverviewMetrics | undefined;
  isLoading?: boolean | undefined;
};

export function OverviewKpiCards({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border bg-card/60 shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "মোট সেলস (Revenue)",
      value: `৳${metrics.totalRevenue.toLocaleString()}`,
      subtext: `কনফার্মড: ৳${metrics.confirmedRevenue.toLocaleString()}`,
      icon: Banknote,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      badgeBg: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "মোট অর্ডার (Total Orders)",
      value: `${metrics.totalOrders} টি`,
      subtext: `আজকে ${metrics.todayOrdersCount} টি · পেন্ডিং ${metrics.pendingCount} টি`,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      badgeBg: "bg-blue-100 text-blue-800",
    },
    {
      title: "কনফার্মড রেট (Confirmed)",
      value: `${metrics.confirmedRate.toFixed(1)}%`,
      subtext: `${metrics.confirmedCount} টি অর্ডার কনফার্মড`,
      icon: CheckCircle2,
      color: "text-indigo-600",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      badgeBg: "bg-indigo-100 text-indigo-800",
    },
    {
      title: "ডেলিভারি সফল (Delivered)",
      value: `${metrics.deliveredRate.toFixed(1)}%`,
      subtext: `${metrics.deliveredCount} টি (৳${metrics.deliveredRevenue.toLocaleString()})`,
      icon: Truck,
      color: "text-sky-600",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      badgeBg: "bg-sky-100 text-sky-800",
    },
    {
      title: "ক্যান্সেলড ও রিটার্ন",
      value: `${metrics.cancelledRate.toFixed(1)}%`,
      subtext: `বাতিল: ${metrics.cancelledCount} · রিটার্ন: ${metrics.returnedCount}`,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      badgeBg: "bg-rose-100 text-rose-800",
    },
    {
      title: "গড় অর্ডার মূল্য (AOV)",
      value: `৳${metrics.aov.toLocaleString()}`,
      subtext: `প্রতি অর্ডারে গড়ে রেভিনিউ`,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      badgeBg: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={i}
            className={`relative overflow-hidden border transition-all hover:shadow-md ${c.border} bg-card/80 backdrop-blur-xs`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground truncate">
                  {c.title}
                </span>
                <div className={`p-2 rounded-xl ${c.bg} ${c.color} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-foreground">
                  {c.value}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground truncate">
                  {c.subtext}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
