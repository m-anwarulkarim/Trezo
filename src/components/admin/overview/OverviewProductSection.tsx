import { Award, Box, Layers, PackageCheck, ShoppingBag, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewMetrics } from "@/lib/overview";

type Props = {
  metrics?: OverviewMetrics | undefined;
  isLoading?: boolean | undefined;
};

export function OverviewProductSection({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-60 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
        <Card className="border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-60 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = metrics.productCategories;
  const packages = metrics.packageTiers;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Top Selling Product Categories */}
      <Card className="border bg-card/80 shadow-xs backdrop-blur-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            সেরা বিক্রিত প্রোডাক্ট (Top Products)
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            ফয়েল ব্যাগ বনাম ট্যাপ ফিল্টারের তুলনামূলক বিক্রয়
          </p>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col justify-center space-y-3">
          {categories.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div
                  key={cat.key}
                  className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-muted/40 to-muted/20 p-3.5 space-y-2.5 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-12 w-12 rounded-lg border object-cover bg-white shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-foreground truncate">
                          {cat.name}
                        </span>
                        {idx === 0 && (
                          <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 font-bold text-[10px] gap-1 shrink-0">
                            <Trophy className="h-3 w-3 text-amber-600" />
                            টপ সেলার
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                        বিক্রি: <span className="text-foreground font-extrabold">{cat.unitsSold}</span> টি প্যাক · মোট: <span className="text-emerald-600 font-extrabold">৳{cat.revenue.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                      <span>মার্কেট শেয়ার</span>
                      <span>{cat.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Package Tier / Variant Breakdown */}
      <Card className="border bg-card/80 shadow-xs backdrop-blur-xs flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            প্যাকেজ সাইজ ব্রেকডাউন (Package Tiers)
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">
            ১০, ২০, ৩০ পিস ব্যাগ ও ৫০, ১০০ পিস ফিল্টার প্যাকেজের আলাদা বিক্রি
          </p>
        </CardHeader>
        <CardContent className="pt-2 flex-1 flex flex-col justify-center space-y-2.5">
          {packages.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="space-y-2.5">
              {packages.map((pkg, idx) => (
                <div
                  key={pkg.packageName}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-background p-2.5 transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={pkg.image}
                      alt={pkg.packageName}
                      className="h-9 w-9 rounded-md border object-cover bg-white shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground truncate">
                          {pkg.packageName}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full shrink-0">
                            #১
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {pkg.percentage.toFixed(1)}% শেয়ার
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-foreground">
                      {pkg.unitsSold} টি
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600">
                      ৳{pkg.revenue.toLocaleString()}
                    </div>
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
