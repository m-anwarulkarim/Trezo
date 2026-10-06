import { Building2, CheckCircle, Clock, MapPin, Send, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewMetrics } from "@/lib/overview";

type Props = {
  metrics?: OverviewMetrics | undefined;
  isLoading?: boolean | undefined;
};

export function OverviewCourierSection({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-52 space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-52 space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const areas = metrics.areaDistribution;
  const courier = metrics.courierStatus;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Area Distribution Card (Inside vs Outside Dhaka) */}
      <Card className="border bg-card/80 shadow-xs backdrop-blur-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            এরিয়া ডিস্ট্রিবিউশন (Location Breakdown)
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            ঢাকার ভেতরে বনাম ঢাকার বাইরের অর্ডার ও ডেলিভারি চার্জ
          </p>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col justify-center space-y-3">
          {areas.map((area) => (
            <div
              key={area.areaKey}
              className="rounded-xl border bg-muted/30 p-3 space-y-2 transition-all hover:bg-muted/50"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" /> {area.name}
                </span>
                <Badge variant="outline" className="font-bold text-[10px] bg-background">
                  {area.ordersCount} টি ({area.percentage.toFixed(1)}%)
                </Badge>
              </div>

              <Progress value={area.percentage} className="h-2" />

              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>সেলস: <strong className="text-foreground">৳{area.revenue.toLocaleString()}</strong></span>
                <span>ডেলিভারি চার্জ: <strong className="text-blue-600">৳{area.deliveryChargeCollected.toLocaleString()}</strong></span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Pathao Courier Sync Status Card */}
      <Card className="border bg-card/80 shadow-xs backdrop-blur-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            পাঠাও কুরিয়ার সিঙ্ক (Pathao Sync Status)
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            কুরিয়ার প্যানেলে কতটি অর্ডার এন্ট্রি করা হয়েছে
          </p>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col justify-center space-y-4">
          <div className="rounded-2xl border bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Send className="h-4 w-4 text-blue-600" /> সিঙ্ক সম্পন্ন হার
              </span>
              <span className="text-lg font-black text-blue-700">
                {courier.enteredPercentage.toFixed(1)}%
              </span>
            </div>

            <Progress value={courier.enteredPercentage} className="h-2.5 bg-blue-100" />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border bg-white p-2.5 text-center shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-600" /> এন্ট্রি সম্পন্ন
                </span>
                <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                  {courier.enteredCount} টি
                </span>
              </div>

              <div className="rounded-xl border bg-white p-2.5 text-center shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" /> এন্ট্রি বাকি
                </span>
                <span className="text-lg font-black text-amber-600 mt-0.5 block">
                  {courier.pendingCount} টি
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
