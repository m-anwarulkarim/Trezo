import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { format, formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Loader2,
  Package,
  Repeat,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCourierAutoSync } from "@/hooks/useCourierAutoSync";

import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trackConfirmedPurchases } from "@/lib/tracking.functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { bnError } from "@/lib/bn-errors";
import {
  PAGE_SIZE,
  WEB_STATUS_OPTIONS,
  WEB_STATUS_VALUES,
  WEB_STATUS_WITH_CONFIRM,
  getDateRangeISO,
  getDateRangeToISO,
  getProductImage,
  statusMeta,
  type DateRangePreset,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/admin/orders/web")({
  head: () => ({
    meta: [
      { title: "ওয়েব অর্ডার — Trezo অ্যাডমিন" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WebOrders,
});

function WebOrders() {
  const trackConfirmed = useServerFn(trackConfirmedPurchases);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [preDialog, setPreDialog] = useState<{ ids: string[] } | null>(null);
  const [preDate, setPreDate] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [statusFilter, debouncedSearch, dateRange, customFrom, customTo]);

  useCourierAutoSync(60000);

  const statuses = statusFilter === "all" ? WEB_STATUS_VALUES : [statusFilter];
  const fromISO = getDateRangeISO(dateRange, customFrom, customTo);
  const toISO = getDateRangeToISO(dateRange, customTo);

  const ordersQuery = useQuery({
    queryKey: ["web-orders", statuses, debouncedSearch, fromISO, toISO, page],
    queryFn: async () => {
      let q = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("is_deleted", false)
        .in("status", statuses)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (fromISO) q = q.gte("created_at", fromISO);
      if (toISO) q = q.lte("created_at", toISO);
      const s = debouncedSearch.trim();
      if (s) {
        q = q.or(
          `order_id.ilike.%${s}%,customer_facing_id.ilike.%${s}%,customer_name.ilike.%${s}%,phone.ilike.%${s}%`,
        );
      }
      const { data, error, count } = await q;
      if (error) throw error;
      return { orders: (data ?? []) as OrderRow[], count: count ?? 0 };
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 15,
  });

  const orders = ordersQuery.data?.orders ?? [];
  const totalCount = ordersQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const countsQuery = useQuery({
    queryKey: ["web-order-counts", debouncedSearch, fromISO],
    queryFn: async () => {
      const s = debouncedSearch.trim();
      const { data, error } = await supabase.rpc("get_order_status_counts", {
        p_statuses: WEB_STATUS_VALUES,
        ...(fromISO ? { p_date_from: fromISO } : {}),
        ...(s ? { p_search: s } : {}),
      });
      if (error) throw error;
      const rows = (data ?? []) as { status: string; cnt: number }[];
      const map: Record<string, number> = { all: 0 };
      for (const row of rows) {
        map[row.status] = (map[row.status] ?? 0) + Number(row.cnt);
        map["all"] = (map["all"] ?? 0) + Number(row.cnt);
      }
      return map;
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 15,
  });

  // Realtime Postgres subscription for order changes
  useEffect(() => {
    const channel = supabase
      .channel("realtime-web-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void ordersQuery.refetch();
          void countsQuery.refetch();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [ordersQuery, countsQuery]);
  const statusCounts = countsQuery.data;

  const orderIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const phones = useMemo(() => Array.from(new Set(orders.map((o) => o.phone))), [orders]);

  const itemsQuery = useQuery({
    queryKey: ["web-order-items", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      if (error) throw error;
      const map: Record<string, OrderItemRow[]> = {};
      for (const item of (data ?? []) as OrderItemRow[]) {
        (map[item.order_id] ??= []).push(item);
      }
      return map;
    },
  });
  const itemsByOrder = itemsQuery.data ?? {};

  const historyQuery = useQuery({
    queryKey: ["web-order-history", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .in("order_id", orderIds)
        .order("changed_at", { ascending: true });
      if (error) throw error;
      const map: Record<
        string,
        { id: string; status: string; changed_at: string; changed_by_name: string | null }[]
      > = {};
      for (const h of (data ?? []) as {
        id: string;
        order_id: string;
        status: string;
        changed_at: string;
        changed_by_name: string | null;
      }[]) {
        (map[h.order_id] ??= []).push(h);
      }
      return map;
    },
  });
  const historyMap = historyQuery.data ?? {};

  const repeatQuery = useQuery({
    queryKey: ["web-repeat-counts", phones],
    enabled: phones.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("phone")
        .in("phone", phones)
        .eq("status", "confirmed")
        .eq("is_deleted", false);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of (data ?? []) as { phone: string }[]) {
        counts[row.phone] = (counts[row.phone] ?? 0) + 1;
      }
      return counts;
    },
  });
  const repeatCounts = repeatQuery.data ?? {};

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["web-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["web-order-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["web-order-history"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-order-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
  };

  const statusMutation = useMutation({
    mutationFn: async ({
      ids,
      status,
      preDateValue,
    }: {
      ids: string[];
      status: string;
      preDateValue?: string | null;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const patch: {
        status: string;
        last_status_changed_by: string | null;
        pre_date?: string | null;
      } = {
        status,
        last_status_changed_by: userData.user?.id ?? null,
      };
      if (status === "pre") patch.pre_date = preDateValue ?? null;
      const { error } = await supabase.from("orders").update(patch).in("id", ids);
      if (error) throw error;
      const { error: histErr } = await supabase.from("order_status_history").insert(
        ids.map((id) => ({
          order_id: id,
          status,
          changed_by: userData.user?.id ?? null,
          changed_by_name: userData.user?.email ?? null,
        })),
      );
      if (histErr) throw histErr;
      if (status === "confirmed") {
        await trackConfirmed({ data: { orderIds: ids } }).catch(() => undefined);
      }
    },
    onSuccess: (_d, vars) => {
      toast.success(`${vars.ids.length} টি অর্ডারের স্ট্যাটাস আপডেট হয়েছে`);
      setSelectedIds(new Set());
      setPreDialog(null);
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "স্ট্যাটাস পরিবর্তন করা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("orders").update({ is_deleted: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("অর্ডার মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
      setSelectedIds(new Set());
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "অর্ডার মুছে ফেলা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  const applyStatus = (ids: string[], status: string) => {
    if (status === "pre") {
      setPreDate("");
      setPreDialog({ ids });
      return;
    }
    statusMutation.mutate({ ids, status });
  };

  const selectedArray = Array.from(selectedIds);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {WEB_STATUS_OPTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Badge
                key={s.value}
                className={`cursor-pointer border ${
                  statusFilter === s.value
                    ? s.color + " ring-2 ring-primary/30 ring-offset-1"
                    : "border-transparent bg-muted text-muted-foreground"
                }`}
                onClick={() => setStatusFilter(s.value)}
              >
                <Icon className="mr-1 h-3.5 w-3.5" /> {s.labelBn} ({statusCounts?.[s.value] ?? 0})
              </Badge>
            );
          })}
          <Badge
            className={`cursor-pointer border ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "border-transparent bg-muted text-muted-foreground"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            সব ({statusCounts?.["all"] ?? 0})
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="অর্ডার আইডি, নাম বা ফোন..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                customFrom={customFrom}
                customTo={customTo}
                onCustomChange={(from, to) => {
                  setCustomFrom(from);
                  setCustomTo(to);
                }}
              />
              <Select
                value=""
                disabled={selectedIds.size === 0 || statusMutation.isPending}
                onValueChange={(v) => applyStatus(selectedArray, v)}
              >
                <SelectTrigger className="h-9 w-[210px]">
                  <SelectValue placeholder={`বাল্ক স্ট্যাটাস (${selectedIds.size})`} />
                </SelectTrigger>
                <SelectContent>
                  {WEB_STATUS_WITH_CONFIRM.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.labelBn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedIds.size > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                  onClick={() => setDeleteTarget(selectedArray)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> ডিলিট ({selectedIds.size})
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {ordersQuery.isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : ordersQuery.isError ? (
              <p className="py-10 text-center text-sm text-destructive">
                অর্ডার লোড করা যায়নি। আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন আছে কি?
              </p>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="mb-3 h-12 w-12 opacity-40" />
                <p className="text-sm">এই ফিল্টারে কোনো অর্ডার নেই।</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={orders.length > 0 && selectedIds.size === orders.length}
                            onCheckedChange={(c) =>
                              setSelectedIds(c ? new Set(orders.map((o) => o.id)) : new Set())
                            }
                          />
                        </TableHead>
                        <TableHead>অর্ডার</TableHead>
                        <TableHead>কাস্টমার</TableHead>
                        <TableHead>নাম্বার</TableHead>
                        <TableHead>পণ্য</TableHead>
                        <TableHead>সোর্স</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead className="text-right">মোট</TableHead>
                        <TableHead>ট্যাগ</TableHead>
                        <TableHead className="text-center">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const meta = statusMeta(order.status);
                        const Icon = meta.icon;
                        const items = itemsByOrder[order.id] ?? [];
                        const history = historyMap[order.id] ?? [];
                        const changeCount = Math.max(0, history.length - 1);
                        const trigger = (
                          <SelectTrigger
                            className={`h-8 w-auto min-w-[130px] gap-1 border px-2 text-xs font-semibold ${meta.color}`}
                          >
                            <Icon className="h-3 w-3" />
                            <SelectValue />
                            {changeCount > 0 && (
                              <span className="ml-0.5 rounded-full bg-black/10 px-1 text-[10px]">
                                {changeCount}×
                              </span>
                            )}
                          </SelectTrigger>
                        );
                        return (
                          <TableRow
                            key={order.id}
                            className={selectedIds.has(order.id) ? "bg-muted/40" : ""}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(order.id)}
                                onCheckedChange={() =>
                                  setSelectedIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(order.id)) next.delete(order.id);
                                    else next.add(order.id);
                                    return next;
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell className="min-w-[110px]">
                              <button
                                className="text-left font-semibold text-primary hover:underline"
                                onClick={() => setSelectedOrder(order)}
                              >
                                {order.customer_facing_id || order.order_id}
                              </button>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {formatDistanceToNow(new Date(order.created_at), {
                                  addSuffix: true,
                                  locale: bn,
                                })}
                              </p>
                            </TableCell>
                            <TableCell className="min-w-[140px] max-w-[200px]">
                              <p className="text-sm font-medium">{order.customer_name}</p>
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                                {order.address}
                              </p>
                            </TableCell>
                            <TableCell className="min-w-[110px]">
                              <p className="text-sm">{order.phone}</p>
                              {order.alt_phone && (
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  {order.alt_phone}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="min-w-[70px]">
                              <div className="flex items-center gap-1.5">
                                {items.length === 0 && (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                                {items.slice(0, 3).map((item) => (
                                  <Tooltip key={item.id}>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedOrder(order)}
                                        className="h-8 w-8 shrink-0 rounded"
                                      >
                                        <img
                                          src={getProductImage(item)}
                                          alt={item.product_name}
                                          className="h-8 w-8 rounded border object-cover bg-white"
                                        />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                      {item.product_name} × {item.quantity}
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                                {items.length > 3 && (
                                  <span className="text-[11px] text-muted-foreground">
                                    +{items.length - 3}
                                  </span>
                                )}
                              </div>
                              {order.note && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="mt-1 line-clamp-1 max-w-[160px] cursor-help text-[11px] text-muted-foreground">
                                      {order.note}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[280px] whitespace-pre-wrap text-xs">
                                    {order.note}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className="gap-1 border bg-primary/10 text-[10px] text-primary-deep">
                                <Globe className="h-2.5 w-2.5" />
                                {order.traffic_source || "ওয়েবসাইট"}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[150px]">
                              <Select
                                value={order.status}
                                onValueChange={(v) => {
                                  if (v === order.status) return;
                                  applyStatus([order.id], v);
                                }}
                              >
                                {history.length > 0 ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-[260px] p-2">
                                      <p className="mb-1 text-[10px] font-semibold text-muted-foreground">
                                        স্ট্যাটাস হিস্ট্রি ({history.length})
                                      </p>
                                      <div className="space-y-1">
                                        {history.map((h) => (
                                          <div
                                            key={h.id}
                                            className="flex items-center justify-between gap-3 text-[11px]"
                                          >
                                            <span className="font-medium">
                                              {statusMeta(h.status).labelBn}
                                            </span>
                                            <span className="whitespace-nowrap text-muted-foreground">
                                              {format(new Date(h.changed_at), "dd/MM hh:mm a")}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  trigger
                                )}
                                <SelectContent>
                                  {WEB_STATUS_WITH_CONFIRM.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                      {s.labelBn}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {order.pre_date && (
                                <p className="mt-1 text-[10px] text-primary">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 inline shrink-0" />
                                    {format(new Date(order.pre_date), "dd/MM/yyyy")}
                                  </span>
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              ৳{Number(order.total_amount).toLocaleString("en-US")}
                            </TableCell>
                            <TableCell className="min-w-[90px]">
                              {(repeatCounts[order.phone] ?? 0) > 0 && (
                                <Badge className="gap-0.5 border border-emerald-200 bg-emerald-100 px-1.5 py-0 text-[10px] text-emerald-800">
                                  <Repeat className="h-2.5 w-2.5" /> রিপিট (
                                  {repeatCounts[order.phone]})
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteTarget([order.id])}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    মোট {totalCount} টি — পেজ {page + 1}/{totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <OrderDetailsDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />

        <Dialog open={!!preDialog} onOpenChange={() => setPreDialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>প্রি-অর্ডারের তারিখ দিন</DialogTitle>
            </DialogHeader>
            <Input type="date" value={preDate} onChange={(e) => setPreDate(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreDialog(null)}>
                বাতিল
              </Button>
              <Button
                disabled={!preDate || statusMutation.isPending}
                onClick={() =>
                  preDialog &&
                  statusMutation.mutate({
                    ids: preDialog.ids,
                    status: "pre",
                    preDateValue: preDate,
                  })
                }
              >
                {statusMutation.isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                সেভ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>অর্ডার মুছে ফেলবেন?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget?.length} টি অর্ডার "মুছে ফেলা" তালিকায় চলে যাবে, পরে চাইলে ফিরিয়ে আনতে
                পারবেন।
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>বাতিল</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>
                হ্যাঁ, মুছে ফেলুন
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
