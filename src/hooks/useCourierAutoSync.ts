import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { pathaoSyncStatuses, pathaoAutoEntry } from "@/lib/pathao.functions";

/**
 * Custom hook to automatically sync Pathao courier delivery statuses and
 * auto-entry confirmed orders in the background at regular intervals.
 * 
 * @param intervalMs Sync interval in milliseconds (default: 60000 = 1 minute)
 */
export function useCourierAutoSync(intervalMs = 60000) {
  const queryClient = useQueryClient();
  const syncFn = useServerFn(pathaoSyncStatuses);
  const autoFn = useServerFn(pathaoAutoEntry);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const runSync = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try {
        // 1. Sync delivery statuses from Pathao for entered orders
        const syncRes = await syncFn({ data: undefined });

        // 2. Auto-entry confirmed orders if enabled
        const autoRes = await autoFn({ data: undefined });

        // If any status changed or new orders were entered, refresh dashboard and order lists
        if ((syncRes.ok && syncRes.synced > 0) || (autoRes.enabled && autoRes.success > 0)) {
          void queryClient.invalidateQueries({ queryKey: ["admin-overview-metrics"] });
          void queryClient.invalidateQueries({ queryKey: ["order-list"] });
          void queryClient.invalidateQueries({ queryKey: ["order-list-counts"] });
          void queryClient.invalidateQueries({ queryKey: ["web-orders"] });
          void queryClient.invalidateQueries({ queryKey: ["web-order-counts"] });
        }
      } catch (error) {
        // Silent catch for background auto-sync so UI is never blocked
        console.debug("Background courier auto-sync skipped:", error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Run initial sync after a short delay (3s) to not block initial page render
    const initialTimer = setTimeout(() => {
      void runSync();
    }, 3000);

    // Set up recurring interval
    timer = setInterval(() => {
      void runSync();
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      if (timer) clearInterval(timer);
    };
  }, [syncFn, autoFn, queryClient, intervalMs]);
}
