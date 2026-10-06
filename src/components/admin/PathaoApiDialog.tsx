import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, PlugZap, Save, Truck } from "lucide-react";
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
    queryFn: async () => await loadSettings({ data: undefined }),
  });

  useEffect(() => {
    const saved = settingsQuery.data?.settings;
    if (!saved) return;
    const next = { ...EMPTY } as Form;
    for (const key of KEYS) next[key] = saved[key] ?? "";
    if (!next.pathao_base_url) next.pathao_base_url = PRODUCTION_URL;
    if (!next.pathao_default_item_weight) next.pathao_default_item_weight = "0.5";
    setForm(next);
  }, [settingsQuery.data]);

  const hasCreds =
    !!form.pathao_client_id &&
    !!form.pathao_client_secret &&
    !!form.pathao_username &&
    !!form.pathao_password;

  const savedHasCreds = !!settingsQuery.data?.settings?.["pathao_client_id"];

  const citiesQuery = useQuery({
    queryKey: ["pathao-cities"],
    enabled: open && savedHasCreds,
    queryFn: async () => await loadCities({ data: undefined }),
  });

  const zonesQuery = useQuery({
    queryKey: ["pathao-zones", form.pathao_default_city_id],
    enabled: open && savedHasCreds && !!form.pathao_default_city_id,
    queryFn: async () =>
      await loadZones({ data: { cityId: Number(form.pathao_default_city_id) } }),
  });

  const areasQuery = useQuery({
    queryKey: ["pathao-areas", form.pathao_default_zone_id],
    enabled: open && savedHasCreds && !!form.pathao_default_zone_id,
    queryFn: async () =>
      await loadAreas({ data: { zoneId: Number(form.pathao_default_zone_id) } }),
  });

  const update = (key: keyof Form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const saveMutation = useMutation({
    mutationFn: async () => await saveSettings({ data: { settings: form } }),
    onSuccess: () => {
      toast.success("Pathao সেটিংস সেভ হয়েছে।");
      void queryClient.invalidateQueries({ queryKey: ["pathao-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["pathao-setup"] });
      void queryClient.invalidateQueries({ queryKey: ["pathao-cities"] });
    },
    onError: (error: Error) => toast.error(bnError(error, "সেটিংস সেভ করা যায়নি।")),
  });

  const testMutation = useMutation({
    mutationFn: async () => await testConnection({ data: undefined }),
    onSuccess: (result) => {
      const extra = result.storeCount ? ` — ${result.storeCount} টি স্টোর পাওয়া গেছে` : "";
      setTestResult(result.message + extra);
      setStores(result.stores ?? []);
      if (result.ok) {
        toast.success(result.message);
        // Only one store? Select it automatically so nothing is left blank.
        const only = (result.stores ?? [])[0];
        if (result.stores?.length === 1 && only?.store_id && !form.pathao_store_id) {
          update("pathao_store_id", String(only.store_id));
        }
      } else toast.error(result.message);
    },
    onError: (error: Error) => {
      setTestResult(bnError(error, "কানেকশন যাচাই করা যায়নি।"));
      toast.error(bnError(error, "কানেকশন যাচাই করা যায়নি।"));
    },
  });

  const field = (
    key: keyof Form,
    label: string,
    opts?: { type?: string; placeholder?: string },
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="text-xs">
        {label}
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
      <Label className="text-xs">{label}</Label>
      <Select
        value={form[key] || ""}
        disabled={disabled}
        onValueChange={(value) => {
          update(key, value);
          onPick?.();
        }}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={query.isFetching ? "লোড হচ্ছে..." : "বেছে নিন"} />
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
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Pathao কুরিয়ার API
          </DialogTitle>
          <DialogDescription>
            Pathao মার্চেন্ট প্যানেল থেকে পাওয়া তথ্য এখানে দিন। ১) তথ্য দিয়ে সেভ করুন ২) “কানেকশন
            টেস্ট” চাপুন ৩) স্টোর ও ডিফল্ট এলাকা বেছে আবার সেভ করুন।
          </DialogDescription>
        </DialogHeader>

        {settingsQuery.isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="pathao_base_url" className="text-xs">
                Base URL
              </Label>
              <Input
                id="pathao_base_url"
                value={form.pathao_base_url}
                placeholder={PRODUCTION_URL}
                onChange={(e) => update("pathao_base_url", e.target.value)}
                className="h-9 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update("pathao_base_url", PRODUCTION_URL)}
                >
                  Production
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update("pathao_base_url", SANDBOX_URL)}
                >
                  Sandbox
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                আসল অর্ডারের জন্য Production, পরীক্ষার জন্য Sandbox বেছে নিন।
              </p>
            </div>

            {field("pathao_client_id", "Client ID (API Key)")}
            {field("pathao_client_secret", "Client Secret", { type: "password" })}
            {field("pathao_username", "Username")}
            {field("pathao_password", "Password", { type: "password" })}

            {stores.length > 0 ? (
              <div className="space-y-1.5">
                <Label className="text-xs">স্টোর</Label>
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
              field("pathao_store_id", "Store ID", { type: "number" })
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
            <p className="text-xs text-muted-foreground">
              ঠিকানা থেকে সিটি/জোন নিজে থেকেই খুঁজে নেওয়া হয়; না মিললে এই ডিফল্টগুলো ব্যবহার হবে।
              {!savedHasCreds && " তালিকা দেখতে আগে API তথ্য সেভ করুন।"}
            </p>
            {citiesQuery.data && !citiesQuery.data.ok && (
              <p className="text-xs text-destructive">{citiesQuery.data.message}</p>
            )}

            {field("pathao_default_item_weight", "ডিফল্ট ওজন (কেজি)", { placeholder: "0.5" })}
            {field("pathao_default_note", "রাইডারের জন্য নোট", { placeholder: "যেমন: আগে ফোন দিন" })}

            <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">অটোমেটিক কুরিয়ার এন্ট্রি</Label>
                <p className="text-xs text-muted-foreground">
                  চালু থাকলে কোনো অর্ডার “কনফার্ম” হলেই সেটি নিজে থেকেই Pathao-তে চলে যাবে।
                </p>
              </div>
              <Switch
                checked={form.pathao_auto_entry === "1"}
                onCheckedChange={(v: boolean) => update("pathao_auto_entry", v ? "1" : "0")}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <Button
                className="gap-1.5"
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
              {testResult && (
                <Badge variant="outline" className="ml-auto max-w-full truncate text-[11px]">
                  {testResult}
                </Badge>
              )}
            </div>
            {!canSave && (
              <p className="text-xs text-destructive">
                Client ID, Secret, Username ও Password — চারটিই দিতে হবে।
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
