import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, TrendingUp, Globe, ShoppingBag, Truck, Zap } from "lucide-react";
import { OverviewActionSection } from "@/components/admin/overview/OverviewActionSection";
import { OverviewChartsSection } from "@/components/admin/overview/OverviewChartsSection";
import { OverviewCourierSection } from "@/components/admin/overview/OverviewCourierSection";
import { OverviewHeader } from "@/components/admin/overview/OverviewHeader";
import { OverviewKpiCards } from "@/components/admin/overview/OverviewKpiCards";
import { OverviewProductSection } from "@/components/admin/overview/OverviewProductSection";
import { OverviewTrafficSection } from "@/components/admin/overview/OverviewTrafficSection";
import { fetchOverviewMetrics } from "@/lib/overview";
import type { DateRangePreset } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "ওভারভিউ — Trezo অ্যাডমিন" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");

  const overviewQuery = useQuery({
    queryKey: ["admin-overview-metrics", datePreset],
    queryFn: () => fetchOverviewMetrics(datePreset),
    staleTime: 1000 * 30, // 30 seconds
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Overview Header with Date Filter */}
      <OverviewHeader
        datePreset={datePreset}
        onPresetChange={setDatePreset}
        onRefresh={() => void overviewQuery.refetch()}
        isFetching={overviewQuery.isFetching}
      />

      {/* Module 1: KPI Summary Bar Cards */}
      <section className="space-y-3">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>রিয়েল-টাইম পারফরম্যান্স সামারি</span>
        </h2>
        <OverviewKpiCards
          metrics={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />
      </section>

      {/* Module 2: Interactive Visual Charts */}
      <section className="space-y-3">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span>অ্যানালিটিক্স ও ট্রেন্ড চার্ট</span>
        </h2>
        <OverviewChartsSection
          metrics={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />
      </section>

      {/* Module 3: Traffic Source Analytics */}
      <section className="space-y-3">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-indigo-500" />
          <span>ট্র্যাফিক সোর্স ও মার্কেটিং চ্যানেল</span>
        </h2>
        <OverviewTrafficSection
          metrics={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />
      </section>

      {/* Module 4: Product & Package Performance */}
      <section className="space-y-3">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4 text-purple-500" />
          <span>প্রোডাক্ট ও প্যাকেজ পারফরম্যান্স</span>
        </h2>
        <OverviewProductSection
          metrics={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />
      </section>

      {/* Module 5: Courier & Area Insights */}
      <section className="space-y-3">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-amber-500" />
          <span>কুরিয়ার ও এরিয়া ইনসাইট</span>
        </h2>
        <OverviewCourierSection
          metrics={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />
      </section>

      {/* Module 6: Smart Action Hub & Live Recent Orders */}
      <section className="space-y-3">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-rose-500" />
          <span>স্মার্ট অ্যাকশন হাব ও লাইভ অর্ডার স্ট্রিম</span>
        </h2>
        <OverviewActionSection
          metrics={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />
      </section>
    </div>
  );
}
