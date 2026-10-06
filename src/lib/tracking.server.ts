// Server-only helpers for Meta Pixel + Conversions API.

export type TrackingSettings = {
  pixel_id: string | null;
  access_token: string | null;
  test_event_code: string | null;
  pixel_enabled: boolean;
  capi_enabled: boolean;
};

export async function loadTrackingSettings(): Promise<TrackingSettings | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("tracking_settings")
    .select("pixel_id, access_token, test_event_code, pixel_enabled, capi_enabled")
    .limit(1)
    .maybeSingle();
  return (data as TrackingSettings | null) ?? null;
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  return digits;
}

export type CapiUserData = {
  phone?: string | undefined;
  name?: string | undefined;
  fbp?: string | undefined;
  fbc?: string | undefined;
  clientIp?: string | undefined;
  userAgent?: string | undefined;
};

export async function buildUserData(input: CapiUserData) {
  const user_data: Record<string, unknown> = {};
  if (input.phone) user_data["ph"] = [await sha256(normalizePhone(input.phone))];
  if (input.name) {
    const parts = input.name.trim().toLowerCase().split(/\s+/);
    const first = parts[0];
    if (first) user_data["fn"] = [await sha256(first)];
    if (parts.length > 1) user_data["ln"] = [await sha256(parts[parts.length - 1]!)];
  }
  if (input.fbp) user_data["fbp"] = input.fbp;
  if (input.fbc) user_data["fbc"] = input.fbc;
  if (input.clientIp) user_data["client_ip_address"] = input.clientIp;
  if (input.userAgent) user_data["client_user_agent"] = input.userAgent;
  return user_data;
}

export type CapiSendResult = {
  ok: boolean;
  status: number;
  body: unknown;
  message: string;
};

/** POSTs one event to the Meta Conversions API and logs the outcome. */
export async function postCapiEvent(opts: {
  settings: TrackingSettings;
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string | undefined;
  actionSource?: string;
  customData?: Record<string, unknown>;
  userData: Record<string, unknown>;
  isTest?: boolean;
  orderId?: string | undefined;
}): Promise<CapiSendResult> {
  const { settings } = opts;
  if (!settings.pixel_id || !settings.access_token) {
    return {
      ok: false,
      status: 0,
      body: null,
      message: "পিক্সেল আইডি বা অ্যাক্সেস টোকেন সেভ করা নেই। আগে সেটিংসে সেভ করুন।",
    };
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: opts.eventName,
        event_time: opts.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        action_source: opts.actionSource ?? "website",
        ...(opts.eventSourceUrl ? { event_source_url: opts.eventSourceUrl } : {}),
        user_data: opts.userData,
        ...(opts.customData ? { custom_data: opts.customData } : {}),
      },
    ],
  };
  if (settings.test_event_code) payload["test_event_code"] = settings.test_event_code;

  let status = 0;
  let body: unknown = null;
  let ok = false;
  let message = "";

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${settings.pixel_id}/events?access_token=${encodeURIComponent(
        settings.access_token,
      )}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    status = res.status;
    const text = await res.text();
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
    ok = res.ok;
    message = ok
      ? "ইভেন্টটি Meta-তে সফলভাবে পাঠানো হয়েছে।"
      : extractMetaMessage(body) || "Meta ইভেন্টটি গ্রহণ করেনি। পিক্সেল আইডি ও টোকেন আবার দেখুন।";
  } catch (error) {
    console.error("CAPI request failed", error);
    message = "Meta সার্ভারে সংযোগ করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("tracking_events").insert({
      event_name: opts.eventName,
      event_id: opts.eventId,
      order_id: opts.orderId ?? null,
      value: (opts.customData?.["value"] as number | undefined) ?? null,
      currency: (opts.customData?.["currency"] as string | undefined) ?? null,
      success: ok,
      is_test: opts.isTest ?? false,
      response: { status, body } as never,
    });
  } catch (error) {
    console.error("tracking_events log failed", error);
  }

  return { ok, status, body, message };
}

function extractMetaMessage(body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    const err = (body as { error?: { message?: string } }).error;
    if (err?.message) return `Meta বলছে: ${err.message}`;
  }
  return "";
}
