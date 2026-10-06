import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { getDateRangeISO, getDateRangeToISO, type DateRangePreset } from "@/lib/orders";

export type DailyTrendItem = {
  dateKey: string;
  dateLabel: string;
  revenue: number;
  orders: number;
  confirmedOrders: number;
};

export type StatusBreakdownItem = {
  status: string;
  label: string;
  count: number;
  revenue: number;
  color: string;
};

export type TrafficSourceItem = {
  key: string;
  label: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
};

export type ProductCategoryItem = {
  key: string;
  name: string;
  image: string;
  unitsSold: number;
  revenue: number;
  percentage: number;
  color: string;
};

export type PackageTierItem = {
  packageName: string;
  category: string;
  image: string;
  unitsSold: number;
  revenue: number;
  percentage: number;
};

export type AreaDistributionItem = {
  areaKey: string;
  name: string;
  ordersCount: number;
  revenue: number;
  deliveryChargeCollected: number;
  percentage: number;
  color: string;
};

export type CourierStatusMetrics = {
  enteredCount: number;
  pendingCount: number;
  enteredPercentage: number;
};

export type RecentOrderItem = {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  status: string;
  trafficSource: string;
  createdAt: string;
};

export type OverviewMetrics = {
  totalRevenue: number;
  totalOrders: number;
  confirmedCount: number;
  confirmedRate: number;
  confirmedRevenue: number;
  deliveredCount: number;
  deliveredRate: number;
  deliveredRevenue: number;
  cancelledCount: number;
  cancelledRate: number;
  returnedCount: number;
  aov: number;
  pendingCount: number;
  todayOrdersCount: number;
  todayRevenue: number;
  yesterdayOrdersCount: number;
  yesterdayRevenue: number;
  dailyTrends: DailyTrendItem[];
  statusBreakdown: StatusBreakdownItem[];
  trafficSources: TrafficSourceItem[];
  productCategories: ProductCategoryItem[];
  packageTiers: PackageTierItem[];
  areaDistribution: AreaDistributionItem[];
  courierStatus: CourierStatusMetrics;
  recentOrders: RecentOrderItem[];
};

export async function fetchOverviewMetrics(
  preset: DateRangePreset = "all",
  customFrom?: string,
  customTo?: string,
): Promise<OverviewMetrics> {
  const fromISO = getDateRangeISO(preset, customFrom, customTo);
  const toISO = getDateRangeToISO(preset, customTo);

  let q = supabase
    .from("orders")
    .select("id, order_id, customer_facing_id, customer_name, phone, total_amount, status, created_at, traffic_source, delivery_area, delivery_charge, is_courier_entered")
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (fromISO) q = q.gte("created_at", fromISO);
  if (toISO) q = q.lte("created_at", toISO);

  const { data, error } = await q;
  if (error) throw error;

  const orders = data ?? [];
  const totalOrders = orders.length;

  let totalRevenue = 0;
  let confirmedCount = 0;
  let confirmedRevenue = 0;
  let deliveredCount = 0;
  let deliveredRevenue = 0;
  let cancelledCount = 0;
  let returnedCount = 0;
  let pendingCount = 0;

  // Calculate today vs yesterday bounds
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const endOfYesterday = startOfToday;

  let todayOrdersCount = 0;
  let todayRevenue = 0;
  let yesterdayOrdersCount = 0;
  let yesterdayRevenue = 0;

  // Maps for aggregation
  const trendMap: Record<string, DailyTrendItem> = {};
  const sourceMap: Record<string, { count: number; revenue: number }> = {};

  let insideDhakaCount = 0;
  let insideDhakaRevenue = 0;
  let insideDhakaCharge = 0;

  let outsideDhakaCount = 0;
  let outsideDhakaRevenue = 0;
  let outsideDhakaCharge = 0;

  let courierEnteredCount = 0;
  let courierPendingCount = 0;

  for (const o of orders) {
    const amount = Number(o.total_amount || 0);
    const charge = Number(o.delivery_charge || 0);
    const st = (o.status || "").toLowerCase();
    const createdAt = o.created_at;
    const rawSource = (o.traffic_source || "website").toLowerCase().trim();
    const area = (o.delivery_area || "").toLowerCase();

    totalRevenue += amount;

    if (createdAt >= startOfToday) {
      todayOrdersCount++;
      todayRevenue += amount;
    } else if (createdAt >= startOfYesterday && createdAt < endOfYesterday) {
      yesterdayOrdersCount++;
      yesterdayRevenue += amount;
    }

    // Courier status tracking
    if (o.is_courier_entered) {
      courierEnteredCount++;
    } else {
      courierPendingCount++;
    }

    // Area distribution grouping
    if (area.includes("inside") || area.includes("dhaka")) {
      insideDhakaCount++;
      insideDhakaRevenue += amount;
      insideDhakaCharge += charge;
    } else {
      outsideDhakaCount++;
      outsideDhakaRevenue += amount;
      outsideDhakaCharge += charge;
    }

    // Traffic Source grouping
    let sourceKey = "website";
    if (rawSource.includes("facebook") || rawSource.includes("fb") || rawSource.includes("ig") || rawSource.includes("instagram")) {
      sourceKey = "facebook";
    } else if (rawSource.includes("google") || rawSource.includes("gads")) {
      sourceKey = "google";
    } else if (rawSource.includes("tiktok")) {
      sourceKey = "tiktok";
    } else if (rawSource.includes("manual")) {
      sourceKey = "manual";
    } else if (rawSource.includes("youtube")) {
      sourceKey = "youtube";
    } else {
      sourceKey = rawSource || "website";
    }

    if (!sourceMap[sourceKey]) {
      sourceMap[sourceKey] = { count: 0, revenue: 0 };
    }
    const srcEntry = sourceMap[sourceKey];
    if (srcEntry) {
      srcEntry.count += 1;
      srcEntry.revenue += amount;
    }

    // Daily trends grouping
    if (createdAt) {
      const d = new Date(createdAt);
      const dateKey = format(d, "yyyy-MM-dd");
      const dateLabel = format(d, "d MMM", { locale: bn });

      if (!trendMap[dateKey]) {
        trendMap[dateKey] = {
          dateKey,
          dateLabel,
          revenue: 0,
          orders: 0,
          confirmedOrders: 0,
        };
      }

      const trItem = trendMap[dateKey];
      if (trItem) {
        trItem.orders += 1;
        trItem.revenue += amount;
      }
    }

    if (st === "pending") {
      pendingCount++;
    } else if (
      st === "confirmed" ||
      st === "delivered" ||
      st === "shipped" ||
      st === "in_transit" ||
      st === "on_the_way"
    ) {
      confirmedCount++;
      confirmedRevenue += amount;
      if (createdAt) {
        const trendItem = trendMap[format(new Date(createdAt), "yyyy-MM-dd")];
        if (trendItem) trendItem.confirmedOrders += 1;
      }

      if (st === "delivered") {
        deliveredCount++;
        deliveredRevenue += amount;
      }
    } else if (st === "cancelled" || st === "cancel") {
      cancelledCount++;
    } else if (st === "returned" || st === "return") {
      returnedCount++;
    }
  }

  const confirmedRate = totalOrders > 0 ? (confirmedCount / totalOrders) * 100 : 0;
  const deliveredRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;
  const cancelledRate = totalOrders > 0 ? ((cancelledCount + returnedCount) / totalOrders) * 100 : 0;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const dailyTrends = Object.values(trendMap).sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey),
  );

  const statusBreakdown: StatusBreakdownItem[] = [
    {
      status: "pending",
      label: "পেন্ডিং (Pending)",
      count: pendingCount,
      revenue: 0,
      color: "#f59e0b",
    },
    {
      status: "confirmed",
      label: "কনফার্মড (Confirmed)",
      count: confirmedCount - deliveredCount,
      revenue: confirmedRevenue - deliveredRevenue,
      color: "#6366f1",
    },
    {
      status: "delivered",
      label: "ডেলিভার্ড (Delivered)",
      count: deliveredCount,
      revenue: deliveredRevenue,
      color: "#10b981",
    },
    {
      status: "cancelled",
      label: "বাতিল/রিটার্ন (Cancelled)",
      count: cancelledCount + returnedCount,
      revenue: 0,
      color: "#f43f5e",
    },
  ].filter((item) => item.count > 0);

  const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
    facebook: { label: "Facebook Ads", color: "#1877f2" },
    google: { label: "Google Search/Ads", color: "#ea4335" },
    website: { label: "Direct Website", color: "#2563eb" },
    tiktok: { label: "TikTok", color: "#000000" },
    youtube: { label: "YouTube", color: "#ff0000" },
    manual: { label: "Manual Admin", color: "#8b5cf6" },
  };

  const trafficSources: TrafficSourceItem[] = Object.entries(sourceMap)
    .map(([key, data]) => {
      const cfg = SOURCE_CONFIG[key] ?? {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: "#64748b",
      };
      return {
        key,
        label: cfg.label,
        count: data.count,
        revenue: data.revenue,
        percentage: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0,
        color: cfg.color,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Product Categories & Package Tiers aggregation
  const orderIds = orders.map((o) => o.id);
  let productCategories: ProductCategoryItem[] = [];
  let packageTiers: PackageTierItem[] = [];

  if (orderIds.length > 0) {
    const CHUNK_SIZE = 500;
    const allItems: { product_name: string; product_image: string | null; quantity: number; unit_price: number }[] = [];

    for (let i = 0; i < orderIds.length; i += CHUNK_SIZE) {
      const chunk = orderIds.slice(i, i + CHUNK_SIZE);
      const { data: itemData } = await supabase
        .from("order_items")
        .select("product_name, product_image, quantity, unit_price")
        .in("order_id", chunk);
      if (itemData) allItems.push(...itemData);
    }

    const catMap: Record<string, { unitsSold: number; revenue: number }> = {
      foil_bag: { unitsSold: 0, revenue: 0 },
      tap_filter: { unitsSold: 0, revenue: 0 },
    };

    const pkgMap: Record<
      string,
      { packageName: string; category: string; image: string; unitsSold: number; revenue: number }
    > = {};
    let totalUnits = 0;

    for (const item of allItems) {
      const pName = (item.product_name || "").toLowerCase();
      const qty = Number(item.quantity || 1);
      const price = Number(item.unit_price || 0);
      const itemRev = qty * price;
      totalUnits += qty;

      let catKey = "tap_filter";
      if (pName.includes("ফয়েল") || pName.includes("foil") || pName.includes("aluminium") || pName.includes("aluminum")) {
        catKey = "foil_bag";
      }

      const catEntry = catMap[catKey];
      if (catEntry) {
        catEntry.unitsSold += qty;
        catEntry.revenue += itemRev;
      }

      let pkgName = item.product_name;
      let img = item.product_image || (catKey === "foil_bag" ? "/images/foil-hero-v2.webp" : "/images/pack-50.webp");

      if (catKey === "foil_bag") {
        if (pName.includes("10") || pName.includes("১০")) {
          pkgName = "ফয়েল ব্যাগ (১০ পিস)";
        } else if (pName.includes("20") || pName.includes("২০")) {
          pkgName = "ফয়েল ব্যাগ (২০ পিস)";
        } else if (pName.includes("30") || pName.includes("৩০")) {
          pkgName = "ফয়েল ব্যাগ (৩০ পিস)";
        } else {
          pkgName = "ফয়েল ব্যাগ (প্যাকেজ)";
        }
      } else {
        if (pName.includes("100") || pName.includes("১০০")) {
          pkgName = "ট্যাপ ফিল্টার (১০০ পিস)";
          img = "/images/pack-100.webp";
        } else if (pName.includes("50") || pName.includes("৫০")) {
          pkgName = "ট্যাপ ফিল্টার (৫০ পিস)";
          img = "/images/pack-50.webp";
        } else {
          pkgName = "ট্যাপ ফিল্টার (প্যাকেজ)";
        }
      }

      if (!pkgMap[pkgName]) {
        pkgMap[pkgName] = {
          packageName: pkgName,
          category: catKey,
          image: img,
          unitsSold: 0,
          revenue: 0,
        };
      }
      const pkgEntry = pkgMap[pkgName];
      if (pkgEntry) {
        pkgEntry.unitsSold += qty;
        pkgEntry.revenue += itemRev;
      }
    }

    const foilEntry = catMap["foil_bag"];
    const filterEntry = catMap["tap_filter"];

    const foilUnits = foilEntry?.unitsSold ?? 0;
    const filterUnits = filterEntry?.unitsSold ?? 0;

    productCategories = [
      {
        key: "foil_bag",
        name: "Aluminium ফয়েল ব্যাগ",
        image: "/images/foil-hero-v2.webp",
        unitsSold: foilUnits,
        revenue: foilEntry?.revenue ?? 0,
        percentage: totalUnits > 0 ? (foilUnits / totalUnits) * 100 : 0,
        color: "#2563eb",
      },
      {
        key: "tap_filter",
        name: "Water Faucet ট্যাপ ফিল্টার",
        image: "/images/pack-50.webp",
        unitsSold: filterUnits,
        revenue: filterEntry?.revenue ?? 0,
        percentage: totalUnits > 0 ? (filterUnits / totalUnits) * 100 : 0,
        color: "#0284c7",
      },
    ].filter((c) => c.unitsSold > 0 || totalUnits === 0);

    packageTiers = Object.values(pkgMap)
      .map((pkg) => ({
        ...pkg,
        percentage: totalUnits > 0 ? (pkg.unitsSold / totalUnits) * 100 : 0,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold);
  }

  const areaDistribution: AreaDistributionItem[] = [
    {
      areaKey: "inside_dhaka",
      name: "ঢাকার ভেতরে (Inside Dhaka)",
      ordersCount: insideDhakaCount,
      revenue: insideDhakaRevenue,
      deliveryChargeCollected: insideDhakaCharge,
      percentage: totalOrders > 0 ? (insideDhakaCount / totalOrders) * 100 : 0,
      color: "#2563eb",
    },
    {
      areaKey: "outside_dhaka",
      name: "ঢাকার বাইরে (Outside Dhaka)",
      ordersCount: outsideDhakaCount,
      revenue: outsideDhakaRevenue,
      deliveryChargeCollected: outsideDhakaCharge,
      percentage: totalOrders > 0 ? (outsideDhakaCount / totalOrders) * 100 : 0,
      color: "#0284c7",
    },
  ];

  const courierStatus: CourierStatusMetrics = {
    enteredCount: courierEnteredCount,
    pendingCount: courierPendingCount,
    enteredPercentage: totalOrders > 0 ? (courierEnteredCount / totalOrders) * 100 : 0,
  };

  const recentOrders: RecentOrderItem[] = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((o) => ({
      id: o.id,
      orderId: o.customer_facing_id || o.order_id,
      customerName: o.customer_name,
      phone: o.phone,
      totalAmount: Number(o.total_amount || 0),
      status: o.status || "pending",
      trafficSource: o.traffic_source || "website",
      createdAt: o.created_at,
    }));

  return {
    totalRevenue,
    totalOrders,
    confirmedCount,
    confirmedRate,
    confirmedRevenue,
    deliveredCount,
    deliveredRate,
    deliveredRevenue,
    cancelledCount,
    cancelledRate,
    returnedCount,
    aov,
    pendingCount,
    todayOrdersCount,
    todayRevenue,
    yesterdayOrdersCount,
    yesterdayRevenue,
    dailyTrends,
    statusBreakdown,
    trafficSources,
    productCategories,
    packageTiers,
    areaDistribution,
    courierStatus,
    recentOrders,
  };
}
