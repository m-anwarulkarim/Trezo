import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sends the server-side Purchase event for a real order.
 * Value/currency are read from the database (never trusted from the browser).
 */
const sendOrderPurchase = async (orderId: string, eventId: string, sourceUrl?: string) => {
  const { loadTrackingSettings, buildUserData, postCapiEvent } = await import("./tracking.server");
  const settings = await loadTrackingSettings();
  if (!settings || !settings.capi_enabled) return { ok: false, skipped: true };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, order_id, total_amount, customer_name, phone, status, traffic_source")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!order || order.status !== "confirmed" || order.traffic_source !== "website") {
    return { ok: false, skipped: true };
  }

  const { data: existing } = await supabaseAdmin
    .from("tracking_events")
    .select("id")
    .eq("event_name", "Purchase")
    .eq("order_id", order.order_id)
    .eq("success", true)
    .eq("is_test", false)
    .maybeSingle();
  if (existing) return { ok: true, skipped: true };

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_name, quantity, unit_price")
    .eq("order_id", order.id);
  const userData = await buildUserData({
    phone: order.phone ?? undefined,
    name: order.customer_name ?? undefined,
    clientIp: getRequestIP({ xForwardedFor: true }),
    userAgent: getRequestHeader("user-agent"),
  });
  const result = await postCapiEvent({
    settings,
    eventName: "Purchase",
    eventId,
    eventSourceUrl: sourceUrl,
    orderId: order.order_id,
    userData,
    customData: {
      currency: "BDT",
      value: Number(order.total_amount ?? 0),
      order_id: order.order_id,
      num_items: (items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0) || 1,
      contents: (items ?? []).map((item) => ({
        id: item.product_name,
        quantity: Number(item.quantity ?? 1),
        item_price: Number(item.unit_price ?? 0),
      })),
    },
  });
  return { ok: result.ok, skipped: false };
};

/** Sends one Purchase only after an admin confirms a website order. */
export const trackConfirmedPurchases = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderIds: string[] }) => ({
    orderIds: Array.from(new Set(input?.orderIds ?? [])).slice(0, 100),
  }))
  .handler(async ({ context, data }) => {
    const { data: isStaff } = await context.supabase.rpc("is_order_staff", { _user_id: context.userId });
    if (!isStaff) throw new Error("এই কাজটি শুধু অ্যাডমিন বা স্টাফ করতে পারবেন।");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("order_id")
      .in("id", data.orderIds)
      .eq("status", "confirmed")
      .eq("traffic_source", "website");

    let sent = 0;
    for (const order of orders ?? []) {
      const result = await sendOrderPurchase(order.order_id, `purchase-${order.order_id}`);
      if (result.ok && !result.skipped) sent += 1;
    }
    return { ok: true, sent };
  });

/** Lightweight funnel events (ViewContent / AddToCart / InitiateCheckout). */
export const trackFunnelEvent = createServerFn({ method: "POST" })
  .inputValidator((input: { eventName: string; eventId: string; value?: number; fbp?: string; fbc?: string; sourceUrl?: string }) => {
    const allowed = ["ViewContent", "AddToCart", "InitiateCheckout"];
    if (!input?.eventName || !allowed.includes(input.eventName)) throw new Error("Invalid event");
    if (!input?.eventId) throw new Error("Invalid input");
    return {
      eventName: input.eventName,
      eventId: String(input.eventId).slice(0, 64),
      value: typeof input.value === "number" && Number.isFinite(input.value) ? Math.max(0, Math.min(1_000_000, input.value)) : undefined,
      fbp: input.fbp ? String(input.fbp).slice(0, 200) : undefined,
      fbc: input.fbc ? String(input.fbc).slice(0, 300) : undefined,
      sourceUrl: input.sourceUrl ? String(input.sourceUrl).slice(0, 500) : undefined,
    };
  })
  .handler(async ({ data }) => {
    const { loadTrackingSettings, buildUserData, postCapiEvent } = await import("./tracking.server");
    const settings = await loadTrackingSettings();
    if (!settings || !settings.capi_enabled) return { ok: false, skipped: true };

    const userData = await buildUserData({
      fbp: data.fbp,
      fbc: data.fbc,
      clientIp: getRequestIP({ xForwardedFor: true }),
      userAgent: getRequestHeader("user-agent"),
    });

    const result = await postCapiEvent({
      settings,
      eventName: data.eventName,
      eventId: data.eventId,
      eventSourceUrl: data.sourceUrl,
      userData,
      ...(data.value !== undefined ? { customData: { currency: "BDT", value: data.value } } : {}),
    });
    return { ok: result.ok, skipped: false };
  });

/** Admin-only: fires a test event so the setup can be verified in Events Manager. */
export const sendTestCapiEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) {
      return { ok: false, message: "এই কাজটি শুধু অ্যাডমিন করতে পারবেন।", details: null };
    }

    const { loadTrackingSettings, buildUserData, postCapiEvent } = await import("./tracking.server");
    const settings = await loadTrackingSettings();
    if (!settings) {
      return { ok: false, message: "সেটিংস পাওয়া যায়নি। আবার সেভ করে চেষ্টা করুন।", details: null };
    }
    if (!settings.pixel_id || !settings.access_token) {
      return {
        ok: false,
        message: "আগে পিক্সেল আইডি ও অ্যাক্সেস টোকেন সেভ করুন, তারপর টেস্ট করুন।",
        details: null,
      };
    }

    const userData = await buildUserData({
      phone: "01700000000",
      name: "Trezo Test",
      clientIp: getRequestIP({ xForwardedFor: true }),
      userAgent: getRequestHeader("user-agent"),
    });

    const result = await postCapiEvent({
      settings,
      eventName: "Purchase",
      eventId: `test-${crypto.randomUUID()}`,
      userData,
      isTest: true,
      customData: { currency: "BDT", value: 1 },
    });

    return {
      ok: result.ok,
      message: result.message,
      details: JSON.stringify(result.body ?? {}, null, 2),
    };
  });
