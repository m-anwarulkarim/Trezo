import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
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
import { PAGE_SIZE, statusMeta, type OrderRow } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/admin/orders/deleted")({
  head: () => ({
    meta: [
      { title: "মুছে ফেলা অর্ডার — Trezo অ্যাডমিন" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeletedOrders,
});

function DeletedOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<string[] | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [debounced]);

  const ordersQuery = useQuery({
    queryKey: ["deleted-orders", debounced, page],
    queryFn: async () => {
      let q = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      const s = debounced.trim();
      if (s) {
        q = q.or(
          `order_id.ilike.%${s}%,customer_facing_id.ilike.%${s}%,customer_name.ilike.%${s}%,phone.ilike.%${s}%`,
        );
      }
      const { data, error, count } = await q;
      if (error) throw error;
      return { orders: (data ?? []) as OrderRow[], count: count ?? 0 };
    },
  });

  const orders = ordersQuery.data?.orders ?? [];
  const totalCount = ordersQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["deleted-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["web-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["web-order-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-order-counts"] });
    void queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
  };

  const restoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("orders").update({ is_deleted: false }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      toast.success(`${ids.length} টি অর্ডার ফিরিয়ে আনা হয়েছে`);
      setSelectedIds(new Set());
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "অর্ডার ফিরিয়ে আনা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  const purgeMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error: itemErr } = await supabase.from("order_items").delete().in("order_id", ids);
      if (itemErr) throw itemErr;
      const { error } = await supabase.from("orders").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      toast.success(`${ids.length} টি অর্ডার সম্পূর্ণভাবে মুছে ফেলা হয়েছে`);
      setPurgeTarget(null);
      setSelectedIds(new Set());
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(bnError(e, "অর্ডার একেবারে মুছে ফেলা যায়নি। একটু পরে আবার চেষ্টা করুন।")),
  });

  const selectedArray = Array.from(selectedIds);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="অর্ডার আইডি, নাম বা ফোন..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {selectedIds.size > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate(selectedArray)}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> ফিরিয়ে আনুন ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                  onClick={() => setPurgeTarget(selectedArray)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> একেবারে মুছুন
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersQuery.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Trash2 className="mb-3 h-12 w-12 opacity-40" />
              <p className="text-sm">মুছে ফেলা কোনো অর্ডার নেই।</p>
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
                      <TableHead>শেষ স্ট্যাটাস</TableHead>
                      <TableHead className="text-right">মোট</TableHead>
                      <TableHead>মুছে ফেলার সময়</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => {
                      const meta = statusMeta(o.status);
                      return (
                        <TableRow key={o.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(o.id)}
                              onCheckedChange={() =>
                                setSelectedIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(o.id)) next.delete(o.id);
                                  else next.add(o.id);
                                  return next;
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              className="font-semibold text-primary hover:underline"
                              onClick={() => setSelectedOrder(o)}
                            >
                              {o.customer_facing_id || o.order_id}
                            </button>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm font-medium">{o.customer_name}</p>
                            <p className="line-clamp-1 text-[11px] text-muted-foreground">
                              {o.address}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">{o.phone}</TableCell>
                          <TableCell>
                            <Badge className={`border ${meta.color}`}>{meta.labelBn}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-semibold">
                            ৳{Number(o.total_amount).toLocaleString("en-US")}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {format(new Date(o.updated_at), "dd/MM/yyyy hh:mm a")}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={restoreMutation.isPending}
                                onClick={() => restoreMutation.mutate([o.id])}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => setPurgeTarget([o.id])}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                    আগের
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    পরের
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailsDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <AlertDialog open={!!purgeTarget} onOpenChange={() => setPurgeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>একেবারে মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {purgeTarget?.length} টি অর্ডার স্থায়ীভাবে মুছে যাবে, আর ফিরিয়ে আনা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => purgeTarget && purgeMutation.mutate(purgeTarget)}>
              হ্যাঁ, মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
