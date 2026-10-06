import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createManualOrder } from "@/lib/admin-orders.functions";
import { bnError } from "@/lib/bn-errors";

export const Route = createFileRoute("/_authenticated/admin/orders/create")({
  head: () => ({
    meta: [
      { title: "নতুন অর্ডার তৈরি — Trezo অ্যাডমিন" },
      {
        name: "description",
        content: "ফোনে বা হাতে আসা অর্ডার অ্যাডমিন প্যানেল থেকে সরাসরি যোগ করুন।",
      },
      { property: "og:title", content: "নতুন অর্ডার তৈরি — Trezo অ্যাডমিন" },
      {
        property: "og:description",
        content: "ফোনে বা হাতে আসা অর্ডার অ্যাডমিন প্যানেল থেকে সরাসরি যোগ করুন।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreateOrderPage,
});

const STATUSES = [
  { value: "confirmed", label: "কনফার্ম" },
  { value: "pending", label: "পেন্ডিং" },
  { value: "pre", label: "প্রি-অর্ডার" },
  { value: "hold", label: "হোল্ড" },
];

function CreateOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createFn = useServerFn(createManualOrder);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    altPhone: "",
    address: "",
    note: "",
    productName: "",
    quantity: 1,
    unitPrice: 0,
    deliveryCharge: 0,
    discount: 0,
    advance: 0,
    status: "confirmed",
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const subtotal = form.unitPrice * form.quantity;
  const total = Math.max(0, subtotal + form.deliveryCharge - form.discount - form.advance);

  const create = useMutation({
    mutationFn: async () => await createFn({ data: form }),
    onSuccess: (result) => {
      toast.success(`অর্ডার তৈরি হয়েছে — ${result.orderId}`);
      void queryClient.invalidateQueries();
      navigate({ to: "/admin/orders/list" });
    },
    onError: (error: Error) => toast.error(bnError(error, "অর্ডারটি তৈরি করা যায়নি।")),
  });

  const num = (
    key: "quantity" | "unitPrice" | "deliveryCharge" | "discount" | "advance",
    label: string,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="text-xs">
        {label}
      </Label>
      <Input
        id={key}
        type="number"
        min={key === "quantity" ? 1 : 0}
        value={String(form[key])}
        onChange={(e) => set(key, Number(e.target.value) || 0)}
        className="h-9 text-sm"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold">নতুন অর্ডার তৈরি</h1>
        <p className="text-sm text-muted-foreground">
          ফোনে বা ম্যাসেঞ্জারে আসা অর্ডার এখান থেকে সরাসরি যোগ করুন।
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PlusCircle className="h-4 w-4 text-primary" /> অর্ডারের তথ্য
          </CardTitle>
          <CardDescription>তারকা ছাড়া ঘরগুলো ইচ্ছা করলে খালি রাখতে পারেন।</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-xs">
                  গ্রাহকের নাম *
                </Label>
                <Input
                  id="customerName"
                  required
                  value={form.customerName}
                  onChange={(e) => set("customerName", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">
                  মোবাইল নম্বর *
                </Label>
                <Input
                  id="phone"
                  required
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="altPhone" className="text-xs">
                  বিকল্প নম্বর
                </Label>
                <Input
                  id="altPhone"
                  inputMode="numeric"
                  value={form.altPhone}
                  onChange={(e) => set("altPhone", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">অর্ডারের অবস্থা</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">
                সম্পূর্ণ ঠিকানা *
              </Label>
              <Textarea
                id="address"
                required
                rows={3}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="productName" className="text-xs">
                প্রোডাক্টের নাম *
              </Label>
              <Input
                id="productName"
                required
                placeholder="যেমন: Aluminium ফয়েল জিপলক ব্যাগ — ৫০ পিস"
                value={form.productName}
                onChange={(e) => set("productName", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {num("quantity", "পরিমাণ")}
              {num("unitPrice", "একক দাম (৳)")}
              {num("deliveryCharge", "ডেলিভারি চার্জ (৳)")}
              {num("discount", "ডিসকাউন্ট (৳)")}
              {num("advance", "অগ্রিম (৳)")}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs">
                নোট
              </Label>
              <Textarea
                id="note"
                rows={2}
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">সাবটোটাল</span>
                <span>৳ {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                <span>৳ {form.deliveryCharge}</span>
              </div>
              <div className="flex justify-between border-t pt-1 text-base font-bold">
                <span>সর্বমোট</span>
                <span className="text-primary">৳ {total}</span>
              </div>
            </div>

            <Button type="submit" className="w-full gap-1.5" disabled={create.isPending}>
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              অর্ডার তৈরি করুন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
