import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Info, Loader2, PlugZap, Save, Trash2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { bnError } from "@/lib/bn-errors";
import {
  clearPathaoSettingsFn,
  getPathaoAreas,
  getPathaoCities,
  getPathaoSettings,
  getPathaoZones,
  savePathaoSettingsFn,
  testPathaoConnection,
} from "@/lib/pathao.functions";

const PRODUCTION_URL = "https://api-hermes.pathao.com";
const SANDBOX_URL = "https://courier-api-sandbox.pathao.com";

const KEYS = [
  "pathao_base_url",
  "pathao_client_id",
  "pathao_client_secret",
  "pathao_username",
  "pathao_password",
  "pathao_store_id",
  "pathao_default_city_id",
  "pathao_default_zone_id",
  "pathao_default_area_id",
  "pathao_default_item_weight",
  "pathao_default_note",
  "pathao_auto_entry",
] as const;

type Form = Record<(typeof KEYS)[number], string>;

const EMPTY = KEYS.reduce((acc, k) => ({ ...acc, [k]: "" }), {} as Form);

type Store = { store_id?: number; store_name?: string };

export function PathaoApiDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const loadSettings = useServerFn(getPathaoSettings);
  const saveSettings = useServerFn(savePathaoSettingsFn);
  const testConnection = useServerFn(testPathaoConnection);
  const loadCities = useServerFn(getPathaoCities);
  const loadZones = useServerFn(getPathaoZones);
  const loadAreas = useServerFn(getPathaoAreas);

  const [form, setForm] = useState<Form>(EMPTY);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);

  const settingsQuery = useQuery({
    queryKey: ["pathao-settings"],
    enabled: open,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => await loadSettings({ data: undefined }),
  });

  useEffect(() => {
    const saved = settingsQuery.data?.settings;
    if (!saved) return;
    const next = { ...EMPTY } as Form;
    for (const key of KEYS) next[key] = saved[key] ?? "";
    if (!next.pathao_base_url) next.pathao_base_url = PRODUCTION_URL;
    if (!next.pathao_default_item_weight) next.pathao_default_item_weight = "0.5";
    if (!next.pathao_default_city_id) next.pathao_default_city_id = "1";
    if (!next.pathao_default_zone_id) next.pathao_default_zone_id = "1";
    setForm(next);
  }, [settingsQuery.data]);

  const hasCreds =
    !!form.pathao_client_id &&
    !!form.pathao_client_secret &&
    !!form.pathao_username &&
    !!form.pathao_password;

  const savedHasCreds = !!settingsQuery.data?.settings?.["pathao_client_id"] || hasCreds;

  const citiesQuery = useQuery({
    queryKey: ["pathao-cities"],
    enabled: open && savedHasCreds,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => await loadCities({ data: undefined }),
  });

  const zonesQuery = useQuery({
    queryKey: ["pathao-zones", form.pathao_default_city_id],
    enabled: open && savedHasCreds && !!form.pathao_default_city_id,
    staleTime: 30 * 60 * 1000,
    queryFn: async () =>
      await loadZones({ data: { cityId: Number(form.pathao_default_city_id) } }),
  });

  const areasQuery = useQuery({
    queryKey: ["pathao-areas", form.pathao_default_zone_id],
    enabled: open && savedHasCreds && !!form.pathao_default_zone_id,
    staleTime: 30 * 60 * 1000,
    queryFn: async () =>
      await loadAreas({ data: { zoneId: Number(form.pathao_default_zone_id) } }),
  });

  const update = (key: keyof Form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const prepareFormForSave = (): Form => {
    const next = { ...form };
    if (!next.pathao_base_url) next.pathao_base_url = PRODUCTION_URL;
    if (!next.pathao_default_item_weight) next.pathao_default_item_weight = "0.5";
    if (!next.pathao_default_city_id) next.pathao_default_city_id = "1";
    if (!next.pathao_default_zone_id) next.pathao_default_zone_id = "1";
    return next;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = prepareFormForSave();
      return await saveSettings({ data: { settings: payload } });
    },
    onSuccess: () => {
      toast.success("Pathao সেটিংস সেভ হয়েছে।");
      void queryClient.invalidateQueries({ queryKey: ["pathao-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["pathao-setup"] });
      void queryClient.invalidateQueries({ queryKey: ["pathao-cities"] });
    },
    onError: (error: Error) => toast.error(bnError(error, "সেটিংস সেভ করা যায়নি।")),
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      if (hasCreds) {
        const payload = prepareFormForSave();
        await saveSettings({ data: { settings: payload } });
      }
      return await testConnection({ data: undefined });
    },
    onSuccess: (result) => {
      const extra = result.storeCount ? ` — ${result.storeCount} টি স্টোর পাওয়া গেছে` : "";
      const msg = bnError(result.message, result.message);
      setTestResult(msg + extra);
      setStores(result.stores ?? []);
      if (result.ok) {
        toast.success(msg);
        const only = (result.stores ?? [])[0];
        if (result.stores?.length === 1 && only?.store_id && !form.pathao_store_id) {
          update("pathao_store_id", String(only.store_id));
        }
      } else toast.error(msg);
    },
    onError: (error: Error) => {
      const msg = bnError(error, "কানেকশন যাচাই করা যায়নি।");
      setTestResult(msg);
      toast.error(msg);
    },
  });

  const clearSettings = useServerFn(clearPathaoSettingsFn);

  const clearMutation = useMutation({
    mutationFn: async () => {
      return await clearSettings({ data: undefined });
    },
    onSuccess: () => {
      toast.success("Pathao API তথ্য সম্পূর্ণ ক্লিয়ার করা হয়েছে।");
      const cleared = { ...EMPTY } as Form;
      cleared.pathao_base_url = PRODUCTION_URL;
      cleared.pathao_default_item_weight = "0.5";
      cleared.pathao_default_city_id = "1";
      cleared.pathao_default_zone_id = "1";
      setForm(cleared);
      setStores([]);
      setTestResult(null);
      void queryClient.invalidateQueries({ queryKey: ["pathao-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["pathao-setup"] });
      void queryClient.invalidateQueries({ queryKey: ["pathao-cities"] });
    },
    onError: (error: Error) => toast.error(bnError(error, "তথ্য ক্লিয়ার করা যায়নি।")),
  });

  const field = (
    key: keyof Form,
    label: string,
    opts?: { type?: string; placeholder?: string; required?: boolean },
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="text-xs font-semibold">
        {label} {opts?.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={key}
        type={opts?.type ?? "text"}
        value={form[key] || ""}
        placeholder={opts?.placeholder}
        autoComplete={opts?.type === "password" ? "new-password" : "off"}
        onChange={(e) => update(key, e.target.value)}
        className="h-9 text-sm"
      />
    </div>
  );

  const placeSelect = (
    key: "pathao_default_city_id" | "pathao_default_zone_id" | "pathao_default_area_id",
    label: string,
    query: {
      data: { ok: boolean; message: string; places: { id: number; name: string }[] } | undefined;
      isFetching: boolean;
    },
    disabled: boolean,
    onPick?: () => void,
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label} (ঐচ্ছিক)</Label>
      <Select
        value={form[key] || ""}
        disabled={disabled}
        onValueChange={(value) => {
          update(key, value);
          onPick?.();
        }}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={query.isFetching ? "লোড হচ্ছে..." : "অটো / বেছে নিন"} />
        </SelectTrigger>
        <SelectContent>
          {(query.data?.places ?? []).map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const canSave = hasCreds;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <Truck className="h-5 w-5 text-primary" /> Pathao কুরিয়ার API সেটিংস
            {settingsQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            নিচের ৪টি তথ্য দিয়ে <strong>“কানেকশন টেস্ট”</strong> দিলেই আপনার স্টোর ও এপিআই কানেক্ট হয়ে যাবে।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Step 1 */}
          <div className="space-y-3 rounded-xl border p-3.5 bg-muted/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              ধাপ ১: মার্চেন্ট API তথ্য (Pathao Portal)
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="pathao_base_url" className="text-xs font-semibold">
                পরিবেশ (Base URL)
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={form.pathao_base_url !== SANDBOX_URL ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("pathao_base_url", PRODUCTION_URL)}
                  className="h-8 text-xs"
                >
                  Production (আসল ডেলিভারি)
                </Button>
                <Button
                  type="button"
                  variant={form.pathao_base_url === SANDBOX_URL ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("pathao_base_url", SANDBOX_URL)}
                  className="h-8 text-xs"
                >
                  Sandbox (টেস্টিং)
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {field("pathao_client_id", "Client ID", { required: true, placeholder: "যেমন: X7axlvJayv" })}
              {field("pathao_client_secret", "Client Secret", { type: "password", required: true })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {field("pathao_username", "Username (Email)", { required: true, placeholder: "পাঠাও মার্চেন্ট ইমেইল" })}
              {field("pathao_password", "Password", { type: "password", required: true })}
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 rounded-xl border p-3.5 bg-muted/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              ধাপ ২: স্টোর ও ডিফল্ট কনফিগারেশন (অটোমেটিক)
            </h4>

            {stores.length > 0 ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">স্টোর (Store)</Label>
                <Select
                  value={form.pathao_store_id || ""}
                  onValueChange={(value) => update("pathao_store_id", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="স্টোর বেছে নিন" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores
                      .filter((s) => !!s.store_id)
                      .map((s) => (
                        <SelectItem key={s.store_id} value={String(s.store_id)}>
                          {s.store_name || `Store ${s.store_id}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              field("pathao_store_id", "Store ID (কানেকশন টেস্ট দিলে অটো আসবে)", { type: "number", placeholder: "যেমন: 12345" })
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              {placeSelect("pathao_default_city_id", "ডিফল্ট সিটি", citiesQuery, !savedHasCreds, () => {
                update("pathao_default_zone_id", "");
                update("pathao_default_area_id", "");
              })}
              {placeSelect(
                "pathao_default_zone_id",
                "ডিফল্ট জোন",
                zonesQuery,
                !form.pathao_default_city_id,
                () => update("pathao_default_area_id", ""),
              )}
              {placeSelect(
                "pathao_default_area_id",
                "ডিফল্ট এরিয়া",
                areasQuery,
                !form.pathao_default_zone_id,
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span><strong>নোট:</strong> কাস্টমারের অর্ডার থেকে সিটি/জোন নিজেই সিস্টেম চিনে নেয়। ডিফল্ট এলাকা শুধু অসম্পূর্ণ ঠিকানার জন্য ব্যাকআপ হিসেবে থাকে।</span>
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {field("pathao_default_item_weight", "ডিফল্ট ওজন (কেজি)", { placeholder: "0.5" })}
              {field("pathao_default_note", "রাইডারের নোট", { placeholder: "যেমন: আগে ফোন দিন" })}
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-xl border bg-primary/5 p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-primary">অটোমেটিক কুরিয়ার এন্ট্রি</Label>
              <p className="text-xs text-muted-foreground">
                চালু থাকলে কোনো অর্ডার “কনফার্ম” হওয়ামাত্রই সেটি নিজে থেকেই Pathao-তে চলে যাবে।
              </p>
            </div>
            <Switch
              checked={form.pathao_auto_entry === "1"}
              onCheckedChange={(v: boolean) => update("pathao_auto_entry", v ? "1" : "0")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Button
              className="gap-1.5 min-w-[110px]"
              disabled={!canSave || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              সেভ করুন
            </Button>
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={testMutation.isPending}
              onClick={() => testMutation.mutate()}
            >
              {testMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlugZap className="h-4 w-4" />
              )}
              কানেকশন টেস্ট
            </Button>
            <Button
              variant="outline"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={clearMutation.isPending}
              onClick={() => {
                if (window.confirm("আপনি কি নিশ্চিত যে সংরক্ষিত সকল Pathao API তথ্য মুছে ফেলতে চান?")) {
                  clearMutation.mutate();
                }
              }}
            >
              {clearMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
              ক্লিয়ার করুন
            </Button>
            {testResult && (
              <Badge variant="outline" className="ml-auto max-w-full truncate text-[11px]">
                {testResult}
              </Badge>
            )}
          </div>
          {!canSave && (
            <p className="text-xs text-destructive">
              * Client ID, Secret, Username ও Password — ৪টিই দেওয়া আবশ্যক।
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
