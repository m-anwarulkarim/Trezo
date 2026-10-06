import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StaffContext = { supabase: { rpc: Function }; userId: string };

async function assertStaff(context: StaffContext) {
  const { data: ok } = await (context.supabase.rpc as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: boolean | null }>)("is_order_staff", { _user_id: context.userId });
  if (!ok) throw new Error("এই কাজটি শুধু অ্যাডমিন বা স্টাফ করতে পারবেন।");
}

function makeOrderId() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TRZ-${stamp}-${rand}`;
}

type ManualOrderInput = {
  customerName: string;
  phone: string;
  altPhone?: string;
  address: string;
  note?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  deliveryCharge: number;
  discount: number;
  advance: number;
  status: string;
};

const ALLOWED_STATUS = ["pending", "confirmed", "pre", "hold"];

/** Creates an order by hand from the admin panel. */
export const createManualOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ManualOrderInput) => {
    const name = String(input?.customerName ?? "").trim();
    const phone = String(input?.phone ?? "").replace(/\D/g, "");
    const address = String(input?.address ?? "").trim();
    const productName = String(input?.productName ?? "").trim();
    if (name.length < 2) throw new Error("গ্রাহকের নামটি অন্তত ২ অক্ষরের হতে হবে।");
    if (phone.length < 6) throw new Error("সঠিক মোবাইল নম্বর দিন।");
    if (address.length < 5) throw new Error("সম্পূর্ণ ঠিকানা লিখুন।");
    if (!productName) throw new Error("প্রোডাক্টের নাম লিখুন।");
    const num = (v: unknown, max: number) => Math.min(Math.max(Number(v) || 0, 0), max);
    return {
      customerName: name.slice(0, 120),
      phone: phone.slice(0, 20),
      altPhone: String(input?.altPhone ?? "").replace(/\D/g, "").slice(0, 20),
      address: address.slice(0, 500),
      note: String(input?.note ?? "").slice(0, 500),
      productName: productName.slice(0, 200),
      quantity: Math.min(Math.max(Math.round(Number(input?.quantity) || 1), 1), 1000),
      unitPrice: num(input?.unitPrice, 1000000),
      deliveryCharge: num(input?.deliveryCharge, 500),
      discount: num(input?.discount, 1000000),
      advance: num(input?.advance, 1000000),
      status: ALLOWED_STATUS.includes(String(input?.status)) ? String(input?.status) : "confirmed",
    };
  })
  .handler(async ({ context, data }) => {
    await assertStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const subtotal = data.unitPrice * data.quantity;
    const total = Math.max(0, subtotal + data.deliveryCharge - data.discount - data.advance);
    const orderId = makeOrderId();
    const rowId = crypto.randomUUID();

    const { error } = await supabaseAdmin.from("orders").insert({
      id: rowId,
      order_id: orderId,
      customer_facing_id: orderId,
      customer_name: data.customerName,
      phone: data.phone,
      alt_phone: data.altPhone || null,
      address: data.address,
      note: data.note || null,
      status: data.status,
      traffic_source: "manual",
      delivery_charge: data.deliveryCharge,
      discount: data.discount,
      advance: data.advance,
      subtotal,
      total_amount: total,
      last_status_changed_by: context.userId,
    });
    if (error) throw new Error("অর্ডারটি সেভ করা যায়নি। আবার চেষ্টা করুন।");

    const { error: itemError } = await supabaseAdmin.from("order_items").insert({
      order_id: rowId,
      product_name: data.productName,
      quantity: data.quantity,
      unit_price: data.unitPrice,
    });
    if (itemError) throw new Error("প্রোডাক্টের তথ্য সেভ করা যায়নি।");

    return { ok: true, orderId, total };
  });
