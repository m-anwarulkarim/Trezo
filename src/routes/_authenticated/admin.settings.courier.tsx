import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, RefreshCw, Settings2, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PathaoApiDialog } from "@/components/admin/PathaoApiDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { bnError } from "@/lib/bn-errors";
import {
  getPathaoSetupStatus,
  pathaoAutoEntry,
  pathaoSyncStatuses,
} from "@/lib/pathao.functions";

export const Route = createFileRoute("/_authenticated/admin/settings/courier")({
  head: () => ({
    meta: [
      { title: "কুরিয়ার সেটিংস — Trezo অ্যাডমিন" },
      {
        name: "description",
        content: "Pathao কুরিয়ার API সংযোগ ও ডেলিভারি স্ট্যাটাস সিঙ্ক ব্যবস্থাপনা।",
      },
      { property: "og:title", content: "কুরিয়ার সেটিংস — Trezo অ্যাডমিন" },
      {
        property: "og:description",
        content: "Pathao কুরিয়ার API সংযোগ ও ডেলিভারি স্ট্যাটাস সিঙ্ক ব্যবস্থাপনা।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CourierSettingsPage,
});

function CourierSettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const syncFn = useServerFn(pathaoSyncStatuses);
  const autoFn = useServerFn(pathaoAutoEntry);
  const statusFn = useServerFn(getPathaoSetupStatus);

  const setup = useQuery({
    queryKey: ["pathao-setup"],
    queryFn: async () => await statusFn({ data: undefined }),
  });

  const sync = useMutation({
    mutationFn: async () => await syncFn({ data: undefined }),
    onSuccess: (result) => {
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    },
    onError: (error: Error) => toast.error(bnError(error, "স্ট্যাটাস সিঙ্ক করা যায়নি।")),
  });

  const autoEntry = useMutation({
    mutationFn: async () => await autoFn({ data: undefined }),
    onSuccess: (result) => {
      if (result.success > 0) toast.success(result.message);
      else toast.info(result.message);
    },
    onError: (error: Error) => toast.error(bnError(error, "অটো এন্ট্রি চালানো যায়নি।")),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold">কুরিয়ার সেটিংস</h1>
        <p className="text-sm text-muted-foreground">
          Pathao দিয়ে সরাসরি অর্ডার এন্ট্রি ও ডেলিভারি স্ট্যাটাস আপডেট করুন।
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            সেটআপ অবস্থা
            {setup.isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          </CardTitle>
          <CardDescription>
            নিচের সবগুলো ✓ হলে কুরিয়ার এন্ট্রি ঠিকভাবে কাজ করবে।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            { ok: !!setup.data?.hasCreds, label: "API তথ্য (Client ID, Secret, Username, Password) সেভ করা আছে" },
            { ok: !!setup.data?.connected, label: "Pathao-র সাথে কানেকশন হচ্ছে" },
            { ok: !!setup.data?.hasStore, label: "স্টোর বেছে নেওয়া হয়েছে" },
            { ok: !!setup.data?.hasPlace, label: "ডিফল্ট সিটি ও জোন বেছে নেওয়া হয়েছে" },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-2">
              {row.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <span className={row.ok ? "" : "text-muted-foreground"}>{row.label}</span>
            </div>
          ))}
          {setup.data && (
            <p className="border-t pt-2 text-xs text-muted-foreground">
              পরিবেশ: {setup.data.environment === "sandbox" ? "Sandbox (পরীক্ষা)" : "Production (আসল)"}
              {" • "}অটো এন্ট্রি: {setup.data.autoEntry ? "চালু" : "বন্ধ"}
              {setup.data.connectionMessage ? ` • ${setup.data.connectionMessage}` : ""}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={setup.isFetching}
            onClick={() => void setup.refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" /> আবার যাচাই করুন
          </Button>
        </CardContent>
      </Card>



      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-primary" /> Pathao কুরিয়ার
          </CardTitle>
          <CardDescription>
            মার্চেন্ট তথ্য একবার সেভ করলেই অর্ডার লিস্ট থেকে এক ক্লিকে কুরিয়ার এন্ট্রি করা যাবে।
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <Settings2 className="h-4 w-4" /> API তথ্য সেট করুন
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
          >
            {sync.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            স্ট্যাটাস সিঙ্ক করুন
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={autoEntry.isPending}
            onClick={() => autoEntry.mutate()}
          >
            {autoEntry.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            কনফার্ম অর্ডার অটো পাঠান
          </Button>
        </CardContent>

      </Card>

      <PathaoApiDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
