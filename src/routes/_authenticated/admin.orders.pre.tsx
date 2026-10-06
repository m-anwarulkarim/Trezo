import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { CalendarClock, Package, Phone, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { bnError } from "@/lib/bn-errors";
import { WEB_STATUS_WITH_CONFIRM, type OrderRow } from "@/lib/orders";
import { trackConfirmedPurchases } from "@/lib/tracking.functions";

export const Route = createFileRoute("/_authenticated/admin/orders/pre")({
  head: () => ({
    meta: [
      { title: "প্রি-অর্ডার — Trezo অ্যাডমিন" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreOrders,
});

type Group = { key: string; title: string; orders: OrderRow[] };

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function PreOrders() {
  const trackConfirmed = useServerFn(trackConfirmedPurchases);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["pre-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("is_deleted", false)
        .eq("status", "pre")
        .order("pre_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["pre-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["web-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["web-order-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("orders")
        .update({ status, last_status_changed_by: userData.user?.id ?? null })
        .eq("id", id);
      if (error) throw error;
      const { error: histErr } = await supabase.from("order_status_history").insert({
        order_id: id,
        status,
        changed_by: userData.user?.id ?? null,
        changed_by_name: userData.user?.email ?? null,
      });
      if (histErr) throw histErr;
      if (status === "confirmed") {
        await trackConfirmed({ data: { orderIds: [id] } }).catch(() => undefined);
      }
    },
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "স্ট্যাটাস পরিবর্তন করা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  const dateMutation = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase.from("orders").update({ pre_date: date }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("তারিখ আপডেট হয়েছে");
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "তারিখ পরিবর্তন করা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("অর্ডার মুছে ফেলা হয়েছে");
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "অর্ডার মুছে ফেলা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  const groups: Group[] = useMemo(() => {
    const all = ordersQuery.data ?? [];
    const s = search.trim().toLowerCase();
    const filtered = s
      ? all.filter(
          (o) =>
            o.customer_name.toLowerCase().includes(s) ||
            o.phone.includes(s) ||
            (o.customer_facing_id || o.order_id).toLowerCase().includes(s),
        )
      : all;

    const today = startOfDay(new Date()).getTime();
    const tomorrow = today + 86400000;
    const buckets: Record<string, OrderRow[]> = {
      today: [],
      tomorrow: [],
      upcoming: [],
      past: [],
      none: [],
    };
    for (const o of filtered) {
      if (!o.pre_date) {
        buckets["none"]!.push(o);
        continue;
      }
      const t = startOfDay(new Date(o.pre_date)).getTime();
      if (t === today) buckets["today"]!.push(o);
      else if (t === tomorrow) buckets["tomorrow"]!.push(o);
      else if (t > tomorrow) buckets["upcoming"]!.push(o);
      else buckets["past"]!.push(o);
    }
    return [
      { key: "today", title: "আজকের প্রি-অর্ডার", orders: buckets["today"]! },
      { key: "tomorrow", title: "আগামীকাল", orders: buckets["tomorrow"]! },
      { key: "upcoming", title: "সামনের দিনগুলো", orders: buckets["upcoming"]! },
      { key: "past", title: "সময় পার হয়ে গেছে", orders: buckets["past"]! },
      { key: "none", title: "তারিখ দেওয়া হয়নি", orders: buckets["none"]! },
    ].filter((g) => g.orders.length > 0);
  }, [ordersQuery.data, search]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="নাম, ফোন বা অর্ডার আইডি..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {ordersQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarClock className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-sm">কোনো প্রি-অর্ডার নেই।</p>
        </div>
      ) : (
        groups.map((group) => (
          <Card key={group.key}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-primary" />
                {group.title}
                <Badge className="bg-primary/10 text-primary">{group.orders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>অর্ডার</TableHead>
                      <TableHead>কাস্টমার</TableHead>
                      <TableHead>নাম্বার</TableHead>
                      <TableHead>প্রি-অর্ডারের তারিখ</TableHead>
                      <TableHead className="text-right">মোট</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <button
                            className="font-semibold text-primary hover:underline"
                            onClick={() => setSelectedOrder(o)}
                          >
                            {o.customer_facing_id || o.order_id}
                          </button>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(o.created_at), "dd/MM/yyyy")}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm font-medium">{o.customer_name}</p>
                          <p className="line-clamp-1 text-[11px] text-muted-foreground">
                            {o.address}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" /> {o.phone}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            className="h-8 w-[140px] text-xs"
                            value={o.pre_date ?? ""}
                            onChange={(e) =>
                              dateMutation.mutate({ id: o.id, date: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right font-semibold">
                          ৳{Number(o.total_amount).toLocaleString("en-US")}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={o.status}
                            onValueChange={(v) =>
                              v !== o.status && statusMutation.mutate({ id: o.id, status: v })
                            }
                          >
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WEB_STATUS_WITH_CONFIRM.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.labelBn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMutation.mutate(o.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {!ordersQuery.isLoading && groups.length === 0 && (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3 w-3" /> ওয়েব অর্ডার পেজ থেকে কোনো অর্ডারকে "প্রি-অর্ডার" করলে সেটি
          এখানে দেখাবে।
        </p>
      )}

      <OrderDetailsDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
