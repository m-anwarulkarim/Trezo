import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRangePreset } from "@/lib/orders";

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "আজ" },
  { value: "yesterday", label: "গতকাল" },
  { value: "7days", label: "শেষ ৭ দিন" },
  { value: "30days", label: "শেষ ৩০ দিন" },
  { value: "all", label: "সব সময়" },
  { value: "custom", label: "কাস্টম" },
];

export function DateRangeFilter({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: {
  value: DateRangePreset;
  onChange: (v: DateRangePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomChange: (from: string, to: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => onChange(v as DateRangePreset)}>
        <SelectTrigger className="w-[140px]">
          <CalendarDays className="mr-1 h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {customFrom || "শুরু"} → {customTo || "শেষ"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">শুরুর তারিখ</Label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomChange(e.target.value, customTo)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">শেষ তারিখ</Label>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => onCustomChange(customFrom, e.target.value)}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
