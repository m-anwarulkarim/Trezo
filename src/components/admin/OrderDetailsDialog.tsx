import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage, statusMeta, type OrderItemRow, type OrderRow } from "@/lib/orders";

type Props = {
  order: OrderRow | null;
  onClose: () => void;
};

export function OrderDetailsDialog({ order, onClose }: Props) {
  const itemsQuery = useQuery({
    queryKey: ["admin-order-items", order?.id],
    enabled: !!order,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order!.id);
      if (error) throw error;
      return (data ?? []) as OrderItemRow[];
    },
  });

  const historyQuery = useQuery({
    queryKey: ["admin-order-history", order?.id],
    enabled: !!order,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", order!.id)
        .order("changed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        status: string;
        changed_at: string;
        changed_by_name: string | null;
      }[];
    },
  });

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            অর্ডার:{" "}
            <span className="text-primary">
              {order?.customer_facing_id || order?.order_id}
            </span>
          </DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">কাস্টমার</p>
                <p className="font-semibold">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ফোন</p>
                <p className="font-semibold">{order.phone}</p>
              </div>
              {order.alt_phone && (
                <div>
                  <p className="text-muted-foreground">বিকল্প নম্বর</p>
                  <p className="font-semibold">{order.alt_phone}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-muted-foreground">ঠিকানা</p>
                <p className="font-semibold">{order.address}</p>
              </div>
              {order.note && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">নোট</p>
                  <p className="font-semibold">{order.note}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">ডেলিভারি</p>
                <p className="font-semibold">
                  {order.delivery_area === "inside" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"} — ৳
                  {Number(order.delivery_charge)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">মোট</p>
                <p className="text-lg font-bold text-primary">
                  ৳{Number(order.total_amount).toLocaleString("en-US")}
                </p>
              </div>
              {order.pre_date && (
                <div>
                  <p className="text-muted-foreground">প্রি-অর্ডারের তারিখ</p>
                  <p className="font-semibold">
                    {format(new Date(order.pre_date), "dd/MM/yyyy")}
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-muted-foreground">তারিখ</p>
                <p className="font-semibold">
                  {format(new Date(order.created_at), "dd/MM/yyyy hh:mm a")}
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="mb-2 font-semibold">পণ্যসমূহ</p>
              {itemsQuery.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <div className="space-y-2">
                  {(itemsQuery.data ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg bg-muted/40 p-2"
                    >
                      <img
                        src={getProductImage(item)}
                        alt={item.product_name}
                        className="h-10 w-10 rounded border object-cover bg-white shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ৳{Number(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary">
                        ৳{Number(item.unit_price) * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <p className="mb-2 font-semibold">স্ট্যাটাস টাইমলাইন</p>
              <div className="space-y-1.5">
                {(historyQuery.data ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">কোনো পরিবর্তন নেই।</p>
                )}
                {(historyQuery.data ?? []).map((h) => (
                  <div key={h.id} className="flex items-center gap-2 text-xs">
                    <Badge className={`border ${statusMeta(h.status).color}`}>
                      {statusMeta(h.status).labelBn}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(new Date(h.changed_at), "dd/MM/yyyy hh:mm a")}
                    </span>
                    {h.changed_by_name && (
                      <span className="text-muted-foreground">— {h.changed_by_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
