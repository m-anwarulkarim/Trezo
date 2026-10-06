import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { bnError } from "@/lib/bn-errors";
import { sendTestCapiEvent } from "@/lib/tracking.functions";

export const Route = createFileRoute("/_authenticated/admin/settings/tracking")({
  head: () => ({
    meta: [
      { title: "পিক্সেল ও কনভার্সন API সেটিংস | Trezo অ্যাডমিন" },
      {
        name: "description",
        content: "Trezo অ্যাডমিন প্যানেল থেকে Meta পিক্সেল আইডি ও Conversions API টোকেন সেভ করুন ও টেস্ট করুন।",
      },
      { property: "og:title", content: "পিক্সেল ও কনভার্সন API সেটিংস | Trezo অ্যাডমিন" },
      { property: "og:description", content: "Meta পিক্সেল ও Conversions API সেটআপ ও যাচাই।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackingSettingsPage,
});

function TrackingSettingsPage() {
  const queryClient = useQueryClient();
  const runTest = useServerFn(sendTestCapiEvent);

  const settingsQuery = useQuery({
    queryKey: ["tracking-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracking_settings")
        .select("pixel_id, access_token, test_event_code, pixel_enabled, capi_enabled, updated_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["tracking-events"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracking_events")
        .select("id, event_name, order_id, value, success, is_test, created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
  });

  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testCode, setTestCode] = useState("");
  const [pixelEnabled, setPixelEnabled] = useState(true);
  const [capiEnabled, setCapiEnabled] = useState(true);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  useEffect(() => {
    const s = settingsQuery.data;
    if (!s) return;
    setPixelId(s.pixel_id ?? "");
    setAccessToken(s.access_token ?? "");
    setTestCode(s.test_event_code ?? "");
    setPixelEnabled(s.pixel_enabled ?? true);
    setCapiEnabled(s.capi_enabled ?? true);
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: true,
        pixel_id: pixelId.trim() || null,
        access_token: accessToken.trim() || null,
        test_event_code: testCode.trim() || null,
        pixel_enabled: pixelEnabled,
        capi_enabled: capiEnabled,
      };
      const { error } = await supabase.from("tracking_settings").upsert(payload, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সেটিংস সেভ হয়েছে।");
      void queryClient.invalidateQueries({ queryKey: ["tracking-settings"] });
    },
    onError: (error) => toast.error(bnError(error)),
  });

  const testMutation = useMutation({
    mutationFn: async () => await runTest({ data: undefined }),
    onSuccess: (result) => {
      setTestOutput(result.details ?? null);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      void queryClient.invalidateQueries({ queryKey: ["tracking-events"] });
    },
    onError: (error) => toast.error(bnError(error)),
  });

  const pixelIdValid = /^\d{6,20}$/.test(pixelId.trim());

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">পিক্সেল ও কনভার্সন API</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          এখানে Meta পিক্সেল আইডি ও Conversions API টোকেন সেভ করুন। সেভ করার সাথে সাথেই ওয়েবসাইটে ইভেন্ট
          পাঠানো শুরু হবে — কোনো কোড বদলাতে হবে না।
        </p>
      </header>

      <section className="space-y-5 rounded-xl border bg-card p-4 shadow-sm md:p-6">
        <div className="space-y-2">
          <Label htmlFor="pixel-id">পিক্সেল আইডি</Label>
          <Input
            id="pixel-id"
            inputMode="numeric"
            placeholder="যেমন: 1234567890123456"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
          />
          {pixelId.trim() !== "" && !pixelIdValid && (
            <p className="text-xs text-destructive">পিক্সেল আইডি শুধু সংখ্যায় হয় (৬–২০ ডিজিট)। আবার দেখে দিন।</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-token">Conversions API অ্যাক্সেস টোকেন</Label>
          <Input
            id="access-token"
            type="password"
            autoComplete="off"
            placeholder="Events Manager থেকে নেওয়া টোকেন"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            টোকেনটি নিরাপদে সংরক্ষণ থাকে এবং শুধু সার্ভার থেকে ব্যবহার হয় — ভিজিটরের ব্রাউজারে কখনো যায় না।
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-code">টেস্ট ইভেন্ট কোড (ঐচ্ছিক)</Label>
          <Input
            id="test-code"
            placeholder="যেমন: TEST12345"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            যাচাই শেষ হলে এই কোডটি মুছে দিন, নাহলে ইভেন্টগুলো শুধু টেস্ট হিসেবেই গোনা হবে।
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-sm font-medium">ব্রাউজার পিক্সেল চালু</span>
            <Switch checked={pixelEnabled} onCheckedChange={setPixelEnabled} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-sm font-medium">সার্ভার ইভেন্ট (CAPI) চালু</span>
            <Switch checked={capiEnabled} onCheckedChange={setCapiEnabled} />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || (pixelId.trim() !== "" && !pixelIdValid)}
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
            সেভ করুন
          </Button>
          <Button variant="outline" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
            {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            টেস্ট ইভেন্ট পাঠান
          </Button>
        </div>

        {testOutput && (
          <pre className="max-h-56 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            {testOutput}
          </pre>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-base font-semibold text-foreground">সাম্প্রতিক ইভেন্ট</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          এখানে দেখা যাচ্ছে সার্ভার থেকে Meta-তে কোন ইভেন্ট গেছে ও সফল হয়েছে কি না।
        </p>
        <div className="mt-3 divide-y">
          {(eventsQuery.data ?? []).length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">এখনো কোনো ইভেন্ট পাঠানো হয়নি।</p>
          )}
          {(eventsQuery.data ?? []).map((ev) => (
            <div key={ev.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div>
                <span className="font-medium">{ev.event_name}</span>
                {ev.is_test && <span className="ml-2 rounded bg-muted px-1.5 text-[10px]">টেস্ট</span>}
                {ev.order_id && <span className="ml-2 text-xs text-muted-foreground">{ev.order_id}</span>}
              </div>
              <div className="flex items-center gap-3">
                {ev.value != null && <span className="text-xs text-muted-foreground">৳ {Number(ev.value)}</span>}
                <span
                  className={
                    ev.success
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                      : "rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive"
                  }
                >
                  {ev.success ? "সফল" : "ব্যর্থ"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
