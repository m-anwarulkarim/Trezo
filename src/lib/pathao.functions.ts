import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: { rpc: Function }; userId: string }) {
  const { data: isAdmin } = await (context.supabase.rpc as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: boolean | null }>)("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("এই কাজটি শুধু অ্যাডমিন করতে পারবেন।");
}

/** Reads all Pathao settings (secrets included — admin only). */
export const getPathaoSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { loadPathaoSettings } = await import("./pathao.server");
    const settings = await loadPathaoSettings();
    return { settings };
  });

export const savePathaoSettingsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { settings: Record<string, string> }) => {
    if (!input?.settings || typeof input.settings !== "object") throw new Error("Invalid input");
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(input.settings)) {
      out[String(k).slice(0, 64)] = String(v ?? "").slice(0, 500);
    }
    return { settings: out };
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { savePathaoSettings } = await import("./pathao.server");
    await savePathaoSettings(data.settings);
    return { ok: true };
  });

export const testPathaoConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listStores } = await import("./pathao.server");
    try {
      const result = await listStores();
      return {
        ok: result.success,
        message: result.message,
        storeCount: result.stores.length,
        stores: result.stores as { store_id?: number; store_name?: string }[],
        storeId: result.storeId,
      };
    } catch (error) {
      return {
        ok: false,
        message: (error as Error).message,
        storeCount: 0,
        stores: [] as { store_id?: number; store_name?: string }[],
        storeId: "",
      };
    }
  });

/** Creates one Pathao consignment for an order. */
export const pathaoEntryOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => {
    if (!input?.orderId) throw new Error("Invalid input");
    return { orderId: String(input.orderId).slice(0, 64) };
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { createPathaoOrder } = await import("./pathao.server");
    try {
      return await createPathaoOrder(data.orderId);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

/** Pulls the latest delivery status from Pathao for entered orders. */
export const pathaoSyncStatuses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { syncPathaoStatuses } = await import("./pathao.server");
    try {
      const result = await syncPathaoStatuses(100);
      return { ok: true, message: `${result.synced} টি অর্ডারের স্ট্যাটাস আপডেট হয়েছে।`, ...result };
    } catch (error) {
      return { ok: false, message: (error as Error).message, synced: 0, total: 0 };
    }
  });

/** Auto-sends confirmed orders to Pathao (only when auto entry is on). */
export const pathaoAutoEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { autoEntryConfirmedOrders } = await import("./pathao.server");
    try {
      const result = await autoEntryConfirmedOrders(25);
      if (!result.enabled) return { ...result, message: "অটো এন্ট্রি বন্ধ আছে।" };
      if (result.attempted === 0)
        return { ...result, message: "নতুন কোনো কনফার্ম অর্ডার পাওয়া যায়নি।" };
      const failNote = result.failed ? ` • ${result.failed} টি ব্যর্থ` : "";
      return {
        ...result,
        message: `${result.success} টি অর্ডার Pathao-তে পাঠানো হয়েছে${failNote}।`,
      };
    } catch (error) {
      return {
        enabled: true,
        attempted: 0,
        success: 0,
        failed: 0,
        errors: [] as string[],
        message: (error as Error).message,
      };
    }
  });

/** Pathao city list (admin only). */
export const getPathaoCities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { listCities } = await import("./pathao.server");
    try {
      return { ok: true, message: "", places: await listCities() };
    } catch (error) {
      return { ok: false, message: (error as Error).message, places: [] };
    }
  });

export const getPathaoZones = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { cityId: number }) => ({ cityId: Number(input?.cityId) || 0 }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (!data.cityId) return { ok: false, message: "সিটি বেছে নিন।", places: [] };
    const { listZones } = await import("./pathao.server");
    try {
      return { ok: true, message: "", places: await listZones(data.cityId) };
    } catch (error) {
      return { ok: false, message: (error as Error).message, places: [] };
    }
  });

export const getPathaoAreas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { zoneId: number }) => ({ zoneId: Number(input?.zoneId) || 0 }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (!data.zoneId) return { ok: false, message: "জোন বেছে নিন।", places: [] };
    const { listAreas } = await import("./pathao.server");
    try {
      return { ok: true, message: "", places: await listAreas(data.zoneId) };
    } catch (error) {
      return { ok: false, message: (error as Error).message, places: [] };
    }
  });

/** Step-by-step setup health check for the courier settings page. */
export const getPathaoSetupStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { loadPathaoSettings, listStores } = await import("./pathao.server");
    const s = await loadPathaoSettings();
    const hasCreds = !!(
      s["pathao_client_id"] &&
      s["pathao_client_secret"] &&
      s["pathao_username"] &&
      s["pathao_password"]
    );
    const status = {
      hasCreds,
      environment: (s["pathao_base_url"] || "").includes("sandbox") ? "sandbox" : "production",
      hasStore: !!s["pathao_store_id"],
      hasPlace: !!(s["pathao_default_city_id"] && s["pathao_default_zone_id"]),
      connected: false,
      connectionMessage: hasCreds ? "" : "আগে API তথ্য সেভ করুন।",
      autoEntry: s["pathao_auto_entry"] === "1",
    };
    if (hasCreds) {
      try {
        const result = await listStores();
        status.connected = result.success;
        status.connectionMessage = result.message;
      } catch (error) {
        status.connectionMessage = (error as Error).message;
      }
    }
    return status;
  });
