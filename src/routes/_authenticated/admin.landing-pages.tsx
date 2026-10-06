import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { landingPages } from "@/lib/landing-pages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/landing-pages")({
  component: LandingPagesList,
});

function LandingPagesList() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (path: string, id: string) => {
    const url = `${window.location.origin}${path}`;
    void navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("লিঙ্ক কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ল্যান্ডিং পেজসমূহ</h1>
        <p className="text-muted-foreground">
          আপনার ওয়েবসাইটের সকল সক্রিয় ল্যান্ডিং পেজগুলোর তালিকা এখানে দেখা যাবে।
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {landingPages.map((page) => (
          <Card key={page.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-4">
              <div className="rounded-md bg-muted p-2 text-xs font-mono break-all">
                {page.path}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => copyToClipboard(page.path, page.id)}
                >
                  {copiedId === page.id ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  লিঙ্ক কপি
                </Button>
                <Button asChild size="sm" className="flex-1 gap-2">
                  <a href={page.path} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    দেখুন
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
