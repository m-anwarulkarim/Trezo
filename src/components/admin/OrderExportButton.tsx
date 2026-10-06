import { ChevronDown, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { bnError } from "@/lib/bn-errors";

type Props = {
  statuses: string[];
  search: string;
  fromISO?: string | undefined;
  toISO?: string | undefined;
  filterLabel: string;
};

const COLUMNS: { key: string; header: string }[] = [
  { key: "customer_facing_id", header: "Order ID" },
  { key: "order_id", header: "Internal ID" },
  { key: "created_at", header: "Created At" },
  { key: "status", header: "Status" },
  { key: "customer_name", header: "Customer Name" },
  { key: "phone", header: "Phone" },
  { key: "alt_phone", header: "Alt Phone" },
  { key: "address", header: "Address" },
  { key: "products_summary", header: "Products" },
  { key: "subtotal", header: "Subtotal" },
  { key: "delivery_charge", header: "Delivery Charge" },
  { key: "discount", header: "Discount" },
  { key: "total_amount", header: "Total" },
  { key: "consignment_id", header: "Consignment ID" },
  { key: "tracking_code", header: "Tracking Code" },
  { key: "note", header: "Notes" },
  { key: "traffic_source", header: "Traffic Source" },
];

const esc = (v: unknown) => {
  if (v === null || v === undefined) return "";
  return `"${String(v).replace(/"/g, '""')}"`;
};

export function OrderExportButton({ statuses, search, fromISO, toISO, filterLabel }: Props) {
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    const PAGE = 1000;
    let start = 0;
    const all: Record<string, unknown>[] = [];
    for (;;) {
      let q = supabase
        .from("orders")
        .select("*")
        .eq("is_deleted", false)
        .in("status", statuses)
        .order("created_at", { ascending: false })
        .range(start, start + PAGE - 1);
      if (search) {
        q = q.or(
          `order_id.ilike.%${search}%,customer_facing_id.ilike.%${search}%,customer_name.ilike.%${search}%,phone.ilike.%${search}%`,
        );
      }
      if (fromISO) q = q.gte("created_at", fromISO);
      if (toISO) q = q.lte("created_at", toISO);
      const { data, error } = await q;
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...(data as Record<string, unknown>[]));
      if (data.length < PAGE) break;
      start += PAGE;
    }

    const ids = all.map((o) => o["id"] as string);
    const itemsByOrder: Record<string, string[]> = {};
    for (let i = 0; i < ids.length; i += 200) {
      const slice = ids.slice(i, i + 200);
      const { data: items } = await supabase
        .from("order_items")
        .select("order_id, product_name, quantity")
        .in("order_id", slice);
      for (const it of (items ?? []) as {
        order_id: string;
        product_name: string;
        quantity: number;
      }[]) {
        (itemsByOrder[it.order_id] ??= []).push(`${it.product_name} x${it.quantity}`);
      }
    }

    return all.map((o) => {
      const row: Record<string, unknown> = {};
      for (const c of COLUMNS) {
        if (c.key === "products_summary") {
          row[c.header] = (itemsByOrder[o["id"] as string] ?? []).join(" | ");
        } else if (c.key === "created_at") {
          row[c.header] = o["created_at"]
            ? new Date(o["created_at"] as string).toLocaleString("en-GB")
            : "";
        } else {
          row[c.header] = o[c.key] ?? "";
        }
      }
      return row;
    });
  };

  const download = (content: string, type: string, ext: string) => {
    const ts = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${filterLabel}_${ts}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (fmt: "csv" | "json") => {
    setLoading(true);
    try {
      const rows = await fetchAll();
      if (rows.length === 0) {
        toast.warning("এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।");
        return;
      }
      if (fmt === "json") {
        download(JSON.stringify(rows, null, 2), "application/json", "json");
      } else {
        const headers = COLUMNS.map((c) => c.header);
        const lines = [
          headers.join(","),
          ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
        ];
        download(`\uFEFF${lines.join("\n")}`, "text/csv;charset=utf-8", "csv");
      }
      toast.success(`${rows.length} টি অর্ডার ডাউনলোড হয়েছে।`);
    } catch (e) {
      toast.error(bnError(e as Error, "ফাইল তৈরি করা যায়নি। একটু পরে আবার চেষ্টা করুন।"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} className="gap-1.5">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          এক্সপোর্ট
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void handleExport("csv")}>CSV (.csv)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleExport("json")}>JSON (.json)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
