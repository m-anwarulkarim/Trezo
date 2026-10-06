import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  PackageCheck,
  PauseCircle,
  PhoneOff,
  
  RotateCcw,
  ThumbsUp,
  Truck,
  Undo2,
  type LucideIcon,
} from "lucide-react";

export type OrderRow = {
  id: string;
  order_id: string;
  customer_facing_id: string | null;
  customer_name: string;
  phone: string;
  alt_phone: string | null;
  address: string;
  note: string | null;
  status: string;
  delivery_area: string | null;
  delivery_charge: number;
  discount: number;
  advance: number;
  subtotal: number;
  total_amount: number;
  is_printed: boolean;
  is_courier_entered: boolean;
  is_deleted: boolean;
  consignment_id: string | null;
  tracking_code: string | null;
  traffic_source: string | null;
  pre_date: string | null;
  last_status_changed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
};

export type StatusOption = {
  value: string;
  labelBn: string;
  labelEn: string;
  color: string;
  icon: LucideIcon;
};

export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "confirmed",
    labelBn: "কনফার্ম",
    labelEn: "Confirmed",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    icon: CheckCircle2,
  },
  {
    value: "entry_done",
    labelBn: "এন্ট্রি ডান",
    labelEn: "Entry Done",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    icon: PackageCheck,
  },
  {
    value: "shipped",
    labelBn: "শিপড",
    labelEn: "Shipped",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Truck,
  },
  {
    value: "delivered",
    labelBn: "ডেলিভারড",
    labelEn: "Delivered",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  {
    value: "partial",
    labelBn: "পার্শিয়াল",
    labelEn: "Partial",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: Clock,
  },
  {
    value: "pending_return",
    labelBn: "পেন্ডিং রিটার্ন",
    labelEn: "Pending Return",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Undo2,
  },
  {
    value: "return",
    labelBn: "রিটার্ন",
    labelEn: "Return",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    icon: RotateCcw,
  },
  {
    value: "cancelled",
    labelBn: "ক্যান্সেল",
    labelEn: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Ban,
  },
  {
    value: "missing",
    labelBn: "মিসিং",
    labelEn: "Missing",
    color: "bg-slate-200 text-slate-800 border-slate-300",
    icon: AlertTriangle,
  },
];

/** Web (site) order pipeline statuses — before an order is confirmed. */
export const WEB_STATUS_OPTIONS: StatusOption[] = [
  {
    value: "pending",
    labelBn: "পেন্ডিং",
    labelEn: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  {
    value: "no_response",
    labelBn: "রেসপন্স নেই",
    labelEn: "No Response",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: PhoneOff,
  },
  {
    value: "good_but_no_response",
    labelBn: "ভালো কিন্তু রেসপন্স নেই",
    labelEn: "Good But No Response",
    color: "bg-lime-100 text-lime-800 border-lime-200",
    icon: ThumbsUp,
  },
  {
    value: "busy",
    labelBn: "ব্যস্ত",
    labelEn: "Busy",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: PhoneOff,
  },
  {
    value: "hold",
    labelBn: "হোল্ড",
    labelEn: "Hold",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: PauseCircle,
  },
  {
    value: "pre",
    labelBn: "প্রি-অর্ডার",
    labelEn: "Pre Order",
    color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    icon: CalendarClock,
  },
  {
    value: "confirmed",
    labelBn: "কনফার্ম",
    labelEn: "Confirmed",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    icon: CheckCircle2,
  },
  {
    value: "delivered",
    labelBn: "ডেলিভারড",
    labelEn: "Delivered",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  {
    value: "cancelled",
    labelBn: "ক্যান্সেল",
    labelEn: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Ban,
  },
];


/** Web page dropdown offers the same statuses, including "confirmed". */
export const WEB_STATUS_WITH_CONFIRM: StatusOption[] = [...WEB_STATUS_OPTIONS];


export const WEB_STATUS_VALUES = WEB_STATUS_OPTIONS.map((s) => s.value);

/** Some UI tabs cover several stored statuses. */
export const FILTER_GROUPS: Record<string, string[]> = {
  shipped: ["shipped", "on_the_way"],
  return: ["return", "returned"],
};

export const ALL_STATUS_VALUES = Array.from(
  new Set(STATUS_OPTIONS.flatMap((s) => FILTER_GROUPS[s.value] ?? [s.value])),
);

const ALL_META = [...STATUS_OPTIONS, ...WEB_STATUS_OPTIONS];

export function statusMeta(status: string): StatusOption {
  const direct = ALL_META.find((s) => s.value === status);
  if (direct) return direct;
  const grouped = ALL_META.find((s) => (FILTER_GROUPS[s.value] ?? []).includes(status));
  return grouped ?? STATUS_OPTIONS[STATUS_OPTIONS.length - 1]!;
}

export const PAGE_SIZE = 25;

export type DateRangePreset = "today" | "yesterday" | "7days" | "30days" | "all" | "custom";

export function getDateRangeISO(
  preset: DateRangePreset,
  customFrom?: string,
  customTo?: string,
): string | null {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (preset) {
    case "today":
      return startOfToday.toISOString();
    case "yesterday": {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - 1);
      return d.toISOString();
    }
    case "7days": {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - 6);
      return d.toISOString();
    }
    case "30days": {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - 29);
      return d.toISOString();
    }
    case "custom":
      return customFrom ? new Date(customFrom).toISOString() : null;
    case "all":
    default:
      return null;
  }
}

export function getDateRangeToISO(
  preset: DateRangePreset,
  customTo?: string,
): string | null {
  if (preset === "yesterday") {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setMilliseconds(-1);
    return d.toISOString();
  }
  if (preset === "custom" && customTo) {
    const d = new Date(customTo);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
  return null;
}

export function makeOrderId(): string {
  const rand = Math.floor(Math.random() * 900 + 100);
  return `TZ-${Date.now().toString().slice(-6)}${rand}`;
}
