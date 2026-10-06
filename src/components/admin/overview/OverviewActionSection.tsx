import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Phone,
  Send,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusMeta } from "@/lib/orders";
import type { OverviewMetrics } from "@/lib/overview";

type Props = {
  metrics?: OverviewMetrics | undefined;
  isLoading?: boolean | undefined;
};

export function OverviewActionSection({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border bg-card/60 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border bg-card/60 shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-64 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const recent = metrics.recentOrders;

  return (
    <div className="space-y-6">
      {/* 1. Action Needed Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pending Alerts */}
        <Card className="border bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-background border-amber-500/25 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" /> পেন্ডিং অর্ডার ওয়েটিং
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {metrics.pendingCount} <span className="text-xs font-semibold text-muted-foreground">টি</span>
              </p>
              <p className="text-[11px] font-medium text-amber-800 mt-0.5">
                কল দিয়ে কনফার্মেশন প্রয়োজন
              </p>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1 shadow-xs shrink-0">
              <Link to="/admin/orders/web">
                কনফার্ম করুন <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pathao Sync Pending */}
        <Card className="border bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-background border-blue-500/25 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <Send className="h-4 w-4 text-blue-600" /> কুরিয়ার সিঙ্ক বাকি
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {metrics.courierStatus.pendingCount} <span className="text-xs font-semibold text-muted-foreground">টি</span>
              </p>
              <p className="text-[11px] font-medium text-blue-800 mt-0.5">
                পাঠাও কুরিয়ার প্যানেলে পাঠানো বাকি
              </p>
            </div>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1 shadow-xs shrink-0">
              <Link to="/admin/orders/list">
                পাঠাও এন্ট্রি <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Confirmed & Ready to Ship */}
        <Card className="border bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-background border-emerald-500/25 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> কনফার্মড রেডি অর্ডার
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {metrics.confirmedCount} <span className="text-xs font-semibold text-muted-foreground">টি</span>
              </p>
              <p className="text-[11px] font-medium text-emerald-800 mt-0.5">
                কুরিয়ার ও প্যাকিংয়ের জন্য রেডি
              </p>
            </div>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 shadow-xs shrink-0">
              <Link to="/admin/orders/list">
                লিস্ট দেখুন <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2. Recent Live Orders Table */}
      <Card className="border bg-card/80 shadow-xs backdrop-blur-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              সাম্প্রতিক ১০টি লাইভ অর্ডার (Recent Orders Stream)
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              সর্বশেষ আসা অর্ডারের তথ্য ও তাৎক্ষণিক অবস্থা
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs font-bold gap-1">
            <Link to="/admin/orders/web">
              সব দেখুন <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              কোনো সাম্প্রতিক অর্ডার পাওয়া যায়নি
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">অর্ডার আইডি</TableHead>
                    <TableHead>কাস্টমার</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead>সোর্স</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="text-right">মোট (৳)</TableHead>
                    <TableHead className="w-[80px] text-center">সময়</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((ord) => {
                    const meta = statusMeta(ord.status);
                    return (
                      <TableRow key={ord.id} className="hover:bg-muted/40">
                        <TableCell className="font-bold text-xs text-primary">
                          <Link to="/admin/orders/web" className="hover:underline">
                            {ord.orderId}
                          </Link>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {ord.customerName}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">
                          {ord.phone}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold bg-background capitalize">
                            {ord.trafficSource}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] font-bold border ${meta.color}`}>
                            {meta.labelBn}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-xs text-emerald-600">
                          ৳{ord.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(ord.createdAt), {
                            addSuffix: true,
                            locale: bn,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
