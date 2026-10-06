import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: unknown; push?: unknown };
    _fbq?: unknown;
  }
}

let cachedPixelId: string | null = null;
let initPromise: Promise<string | null> | null = null;

/** Loads the pixel id from the database and boots the Meta Pixel once. Returns cachedPixelId on subsequent calls. */
export async function initMetaPixel(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (cachedPixelId) return cachedPixelId;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const { data, error } = await supabase.rpc("get_public_pixel_settings");
        if (error) return null;
        const row = Array.isArray(data) ? data[0] : data;
        const pixelId = row?.pixel_id?.trim();
        if (!pixelId || row?.pixel_enabled === false) return null;

        cachedPixelId = pixelId;

        if (!window.fbq) {
          const n = function (...args: unknown[]) {
            if (n.callMethod) (n.callMethod as (...a: unknown[]) => void)(...args);
            else (n.queue as unknown[]).push(args);
          } as NonNullable<Window["fbq"]>;
          n.queue = [];
          n.loaded = true;
          n.version = "2.0";
          n.push = n;
          window.fbq = n;
          window._fbq = n;

          const script = document.createElement("script");
          script.async = true;
          script.src = "https://connect.facebook.net/en_US/fbevents.js";
          document.head.appendChild(script);
        }

        window.fbq?.("init", pixelId);
        return pixelId;
      } catch (err) {
        console.error("[Pixel Init Error]", err);
        return null;
      }
    })();
  }

  return initPromise;
}

export function isPixelReady(): boolean {
  return typeof window !== "undefined" && (!!window.fbq || !!cachedPixelId);
}

/** Browser-side event. Pass the same eventId used for the server event to de-duplicate. */
export function pixelTrack(eventName: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined") return;

  const fire = () => {
    window.fbq?.("track", eventName, params ?? {}, eventId ? { eventID: eventId } : undefined);
  };

  if (window.fbq && cachedPixelId) {
    fire();
  } else {
    // If pixel is still initializing or script loading, wait then fire
    void initMetaPixel().then((pixelId) => {
      if (pixelId) fire();
    });
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function getFbCookies() {
  return { fbp: readCookie("_fbp"), fbc: readCookie("_fbc") };
}

export function newEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
