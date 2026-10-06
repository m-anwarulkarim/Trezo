// Server-only helpers for the Pathao Merchant (Aladdin) API.

export const PATHAO_PRODUCTION_URL = "https://api-hermes.pathao.com";
export const PATHAO_SANDBOX_URL = "https://courier-api-sandbox.pathao.com";

const MAX_ITEM_DESC = 500;

export const PATHAO_SETTING_KEYS = [
  "pathao_base_url",
  "pathao_client_id",
  "pathao_client_secret",
  "pathao_username",
  "pathao_password",
  "pathao_store_id",
  "pathao_default_item_weight",
  "pathao_default_delivery_type",
  "pathao_default_item_type",
  "pathao_default_note",
  "pathao_default_city_id",
  "pathao_default_zone_id",
  "pathao_default_area_id",
  "pathao_auto_entry",
] as const;

export type PathaoSettings = Record<string, string>;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function loadPathaoSettings(): Promise<PathaoSettings> {
  const db = await admin();
  const { data } = await db.from("app_settings").select("key, value").like("key", "pathao_%");
  const map: PathaoSettings = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  return map;
}

export async function savePathaoSettings(settings: Record<string, string>) {
  const db = await admin();
  const rows = Object.entries(settings)
    .filter(([key]) => (PATHAO_SETTING_KEYS as readonly string[]).includes(key))
    .map(([key, value]) => ({ key, value: String(value ?? ""), updated_at: new Date().toISOString() }));

  // Credentials changed → drop the cached access token.
  const credKeys = [
    "pathao_base_url",
    "pathao_client_id",
    "pathao_client_secret",
    "pathao_username",
    "pathao_password",
  ];
  if (rows.some((r) => credKeys.includes(r.key))) {
    rows.push(
      { key: "pathao_access_token", value: "", updated_at: new Date().toISOString() },
      { key: "pathao_token_expiry", value: "0", updated_at: new Date().toISOString() },
    );
  }
  if (!rows.length) return;
  const { error } = await db.from("app_settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export function formatPathaoError(data: unknown): string {
  if (!data) return "Pathao থেকে কোনো উত্তর পাওয়া যায়নি।";
  if (typeof data === "string") return data;
  const obj = data as { message?: string; errors?: Record<string, unknown> };
  if (obj.errors && typeof obj.errors === "object") {
    const parts: string[] = [];
    for (const [field, msgs] of Object.entries(obj.errors)) {
      parts.push(`${field}: ${Array.isArray(msgs) ? msgs.join(", ") : String(msgs)}`);
    }
    if (parts.length) return parts.join(" • ");
  }
  return String(obj.message || "Pathao এন্ট্রি করা যায়নি।");
}

function withAuthHint(message: string, baseUrl: string): string {
  if (!/credentials were incorrect|invalid credentials|unauthorized/i.test(message)) return message;
  const mode = baseUrl.includes("sandbox") ? "Sandbox" : "Production";
  const other = baseUrl.includes("sandbox") ? "Production" : "Sandbox";
  return `${message} — এখন ${mode} লিংক সেট আছে। ${other} তথ্য হলে Base URL বদলান, নাহলে Client ID/Secret/Username/Password আবার কপি করুন।`;
}

export function normalizeBdPhone(raw: unknown): string {
  if (raw == null) return "";
  let d = String(raw).replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("88") && d.length === 13) d = d.slice(2);
  else if (d.startsWith("1") && d.length === 10) d = `0${d}`;
  return /^01[3-9]\d{8}$/.test(d) ? d : "";
}

function buildItemDescription(items: { product_name: string; quantity: number }[]): string {
  if (!items.length) return "Parcel";
  const full = items.map((i) => `${i.product_name}(${i.quantity})`).join(", ");
  return full.length <= MAX_ITEM_DESC ? full : `${full.slice(0, MAX_ITEM_DESC - 3)}...`;
}

export async function getAccessToken(
  settings: PathaoSettings,
): Promise<{ token: string; baseUrl: string; storeId: string }> {
  const baseUrl = settings["pathao_base_url"] || PATHAO_PRODUCTION_URL;
  const storeId = settings["pathao_store_id"] || "";
  const cachedToken = settings["pathao_access_token"] || "";
  const cachedExpiry = parseInt(settings["pathao_token_expiry"] || "0", 10);
  if (cachedToken && cachedExpiry - Date.now() > 120_000) {
    return { token: cachedToken, baseUrl, storeId };
  }

  const client_id = settings["pathao_client_id"];
  const client_secret = settings["pathao_client_secret"];
  const username = settings["pathao_username"];
  const password = settings["pathao_password"];
  if (!client_id || !client_secret || !username || !password) {
    throw new Error(
      "Pathao তথ্য সম্পূর্ণ নয় — অ্যাডমিন প্যানেল → কুরিয়ার (Pathao API) থেকে সেট করুন।",
    );
  }

  const res = await fetch(`${baseUrl}/aladdin/api/v1/issue-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id, client_secret, username, password, grant_type: "password" }),
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!res.ok || !data?.access_token) {
    throw new Error(`Pathao টোকেন আনা যায়নি: ${withAuthHint(formatPathaoError(data) || res.statusText, baseUrl)}`);
  }

  const newExpiry = Date.now() + Number(data.expires_in || 18000) * 1000;
  const db = await admin();
  const now = new Date().toISOString();
  await db.from("app_settings").upsert(
    [
      { key: "pathao_access_token", value: String(data.access_token), updated_at: now },
      { key: "pathao_refresh_token", value: String(data.refresh_token ?? ""), updated_at: now },
      { key: "pathao_token_expiry", value: String(newExpiry), updated_at: now },
    ],
    { onConflict: "key" },
  );

  return { token: String(data.access_token), baseUrl, storeId };
}

export async function listStores(): Promise<{ success: boolean; message: string; stores: unknown[]; storeId: string }> {
  const settings = await loadPathaoSettings();
  const { token, baseUrl, storeId } = await getAccessToken(settings);
  const res = await fetch(`${baseUrl}/aladdin/api/v1/stores`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = (await res.json().catch(() => ({}))) as { data?: { data?: unknown[] } };
  return {
    success: res.ok,
    message: res.ok ? "Pathao কানেকশন সফল হয়েছে।" : formatPathaoError(data),
    stores: data?.data?.data ?? [],
    storeId,
  };
}

export type PathaoPlace = { id: number; name: string };

async function pathaoGetList(path: string): Promise<PathaoPlace[]> {
  const settings = await loadPathaoSettings();
  const { token, baseUrl } = await getAccessToken(settings);
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const json = (await res.json().catch(() => ({}))) as { data?: { data?: Record<string, unknown>[] } };
  if (!res.ok) throw new Error(formatPathaoError(json));
  return (json?.data?.data ?? []).map((row) => ({
    id: Number(row["city_id"] ?? row["zone_id"] ?? row["area_id"] ?? 0),
    name: String(row["city_name"] ?? row["zone_name"] ?? row["area_name"] ?? ""),
  })).filter((p) => p.id > 0);
}

/** City list (Pathao "cities" = districts). */
export function listCities() {
  return pathaoGetList("/aladdin/api/v1/city-list");
}

export function listZones(cityId: number) {
  return pathaoGetList(`/aladdin/api/v1/cities/${cityId}/zone-list`);
}

export function listAreas(zoneId: number) {
  return pathaoGetList(`/aladdin/api/v1/zones/${zoneId}/area-list`);
}

function matchPlace(places: PathaoPlace[], address: string): PathaoPlace | null {
  const text = address.toLowerCase();
  const hits = places
    .filter((p) => p.name && text.includes(p.name.toLowerCase()))
    .sort((a, b) => b.name.length - a.name.length);
  return hits[0] ?? null;
}

/**
 * Works out recipient_city / recipient_zone from the address text, falling back
 * to the saved defaults. Pathao rejects an order without a valid city + zone.
 */
async function resolveDestination(
  address: string,
  settings: PathaoSettings,
): Promise<{ city: number; zone: number; area: number | null; note: string }> {
  const defCity = parseInt(settings["pathao_default_city_id"] || "0", 10) || 0;
  const defZone = parseInt(settings["pathao_default_zone_id"] || "0", 10) || 0;
  const defArea = parseInt(settings["pathao_default_area_id"] || "0", 10) || 0;

  let city = defCity;
  let zone = defZone;
  let area = defArea;
  let note = "ডিফল্ট এলাকা ব্যবহার হয়েছে";

  try {
    const cities = await listCities();
    const cityHit = matchPlace(cities, address);
    if (cityHit) {
      city = cityHit.id;
      const zones = await listZones(cityHit.id);
      const zoneHit = matchPlace(zones, address);
      if (zoneHit) {
        zone = zoneHit.id;
        note = `${cityHit.name} / ${zoneHit.name}`;
        try {
          const areas = await listAreas(zoneHit.id);
          const areaHit = matchPlace(areas, address);
          area = areaHit ? areaHit.id : 0;
        } catch {
          area = 0;
        }
      } else if (city !== defCity) {
        // City matched but zone did not — keep the city and drop a stale default zone.
        zone = 0;
        area = 0;
        note = `${cityHit.name} (জোন মেলেনি)`;
      }
    }
  } catch {
    // Location lookup failed — fall back to defaults below.
  }

  return { city, zone, area: area || null, note };
}

const PATHAO_STATUS_MAP: Record<string, string> = {
  pickup_requested: "entry_done",
  assigned_for_pickup: "entry_done",
  picked: "shipped",
  pickup_failed: "hold",
  pickup_cancelled: "cancelled",
  at_the_sorting_hub: "shipped",
  in_transit: "shipped",
  received_at_last_mile_hub: "shipped",
  assigned_for_delivery: "shipped",
  delivered: "delivered",
  partial_delivery: "partial",
  returned: "return",
  return: "return",
  delivery_failed: "hold",
  on_hold: "hold",
  payment_invoice: "delivered",
  exchanged: "delivered",
};

export function mapPathaoStatus(raw: unknown): string | null {
  if (!raw) return null;
  const key = String(raw).trim().replace(/\s+/g, "_").toLowerCase();
  return PATHAO_STATUS_MAP[key] ?? null;
}

export async function fetchPathaoOrderInfo(
  baseUrl: string,
  token: string,
  consignmentId: string,
): Promise<{ order_status?: string } | null> {
  const res = await fetch(`${baseUrl}/aladdin/api/v1/orders/${consignmentId}/info`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as { data?: { order_status?: string } } | null;
  return data?.data ?? null;
}

export type PathaoEntryResult = {
  success: boolean;
  consignmentId?: string;
  error?: string;
};

/** Creates one Pathao consignment for an order and stores the result. */
export async function createPathaoOrder(orderId: string): Promise<PathaoEntryResult> {
  const db = await admin();
  const settings = await loadPathaoSettings();
  const { token, baseUrl, storeId } = await getAccessToken(settings);
  if (!storeId) {
    return { success: false, error: "Pathao Store ID সেট করা নেই — কুরিয়ার সেটিংসে গিয়ে দিন।" };
  }

  const { data: order } = await db
    .from("orders")
    .select(
      "id, order_id, customer_facing_id, customer_name, phone, address, total_amount, courier_note",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { success: false, error: "অর্ডারটি খুঁজে পাওয়া যায়নি।" };

  const { data: items } = await db
    .from("order_items")
    .select("product_name, quantity")
    .eq("order_id", order.id);

  const phone = normalizeBdPhone(order.phone);
  if (!phone) {
    return { success: false, error: `ফোন নম্বরটি সঠিক নয় (${order.phone || "খালি"})।` };
  }
  const address = String(order.address ?? "").trim();
  if (address.length < 10) {
    return { success: false, error: "ঠিকানা কমপক্ষে ১০ অক্ষরের হতে হবে।" };
  }

  const list = (items ?? []).map((i) => ({
    product_name: String(i.product_name),
    quantity: Number(i.quantity) || 1,
  }));

  const payload: Record<string, unknown> = {
    store_id: parseInt(storeId, 10),
    merchant_order_id: String(order.customer_facing_id || order.order_id).toLowerCase(),
    recipient_name: order.customer_name,
    recipient_phone: phone,
    recipient_address: address,
    delivery_type: parseInt(settings["pathao_default_delivery_type"] || "48", 10),
    item_type: parseInt(settings["pathao_default_item_type"] || "2", 10),
    special_instruction: order.courier_note ?? settings["pathao_default_note"] ?? "",
    item_quantity: list.reduce((s, i) => s + i.quantity, 0) || 1,
    item_weight: parseFloat(settings["pathao_default_item_weight"] || "0.5"),
    item_description: buildItemDescription(list),
    amount_to_collect: Math.round(Number(order.total_amount) || 0),
  };
  const place = await resolveDestination(address, settings);
  if (!place.city || !place.zone) {
    return {
      success: false,
      error:
        "ঠিকানা থেকে Pathao-র সিটি/জোন বের করা যায়নি। কুরিয়ার সেটিংসে গিয়ে ডিফল্ট সিটি ও জোন বেছে দিন, তারপর আবার চেষ্টা করুন।",
    };
  }
  payload["recipient_city"] = place.city;
  payload["recipient_zone"] = place.zone;
  if (place.area) payload["recipient_area"] = place.area;

  const res = await fetch(`${baseUrl}/aladdin/api/v1/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    data?: { consignment_id?: string; order_id?: string };
  };
  const consignment = data?.data?.consignment_id || data?.data?.order_id;

  if (res.ok && consignment) {
    await db
      .from("orders")
      .update({
        is_courier_entered: true,
        consignment_id: String(consignment),
        tracking_code: String(consignment),
        courier_provider: "pathao",
        status: "entry_done",
      })
      .eq("id", order.id);
    return { success: true, consignmentId: String(consignment) };
  }

  return { success: false, error: formatPathaoError(data) };
}

/** Pulls the latest Pathao status for every entered order and syncs it back. */
export async function syncPathaoStatuses(limit = 100) {
  const db = await admin();
  const settings = await loadPathaoSettings();
  const { token, baseUrl } = await getAccessToken(settings);

  const SYNC_STATUSES = ["entry_done", "shipped", "hold", "pending", "confirmed", "partial"];
  const { data: orders } = await db
    .from("orders")
    .select("id, consignment_id, status")
    .eq("courier_provider", "pathao")
    .eq("is_courier_entered", true)
    .eq("is_deleted", false)
    .in("status", SYNC_STATUSES)
    .not("consignment_id", "is", null)
    .limit(limit);

  let updated = 0;
  for (const order of orders ?? []) {
    if (!order.consignment_id) continue;
    const info = await fetchPathaoOrderInfo(baseUrl, token, order.consignment_id);
    const mapped = mapPathaoStatus(info?.order_status);
    if (!mapped || mapped === order.status) continue;
    await db
      .from("orders")
      .update({ status: mapped, delivery_status: mapped })
      .eq("id", order.id);
    updated += 1;
  }

  return { synced: updated, total: (orders ?? []).length };
}

/**
 * Auto-sends confirmed orders to Pathao when auto entry is switched on.
 * Safe to call repeatedly — already entered orders are skipped.
 */
export async function autoEntryConfirmedOrders(limit = 25): Promise<{
  enabled: boolean;
  attempted: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  const settings = await loadPathaoSettings();
  if (settings["pathao_auto_entry"] !== "1") {
    return { enabled: false, attempted: 0, success: 0, failed: 0, errors: [] };
  }

  const db = await admin();
  const { data: orders } = await db
    .from("orders")
    .select("id")
    .eq("status", "confirmed")
    .eq("is_courier_entered", false)
    .eq("is_deleted", false)
    .is("consignment_id", null)
    .limit(limit);

  let success = 0;
  const errors: string[] = [];
  for (const order of orders ?? []) {
    try {
      const result = await createPathaoOrder(order.id);
      if (result.success) success += 1;
      else if (result.error) errors.push(result.error);
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  const attempted = (orders ?? []).length;
  return {
    enabled: true,
    attempted,
    success,
    failed: attempted - success,
    errors: errors.slice(0, 3),
  };
}
