import { Calendar, LayoutDashboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DateRangePreset } from "@/lib/orders";

type Props = {
  datePreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  onRefresh: () => void;
  isFetching?: boolean | undefined;
};

export function OverviewHeader({
  datePreset,
  onPresetChange,
  onRefresh,
  isFetching,
}: Props) {
  const presets: { value: DateRangePreset; label: string }[] = [
    { value: "today", label: "আজ" },
    { value: "yesterday", label: "গতকাল" },
    { value: "7days", label: "গত ৭ দিন" },
    { value: "30days", label: "গত ৩০ দিন" },
    { value: "all", label: "সব সময়" },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          অ্যাডমিন ওভারভিউ
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          ব্যবসার রিয়েল-টাইম পারফরম্যান্স এবং অর্ডারের সারসংক্ষেপ
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border bg-background p-1 shadow-xs">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPresetChange(p.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                datePreset === p.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          রিফ্রেশ
        </Button>
      </div>
    </div>
  );
}
