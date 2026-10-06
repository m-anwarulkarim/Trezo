import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/trezo/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { bnAuthError } from "@/lib/bn-errors";

export const Route = createFileRoute("/admin/auth")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন — Trezo" },
      { name: "description", content: "Trezo অর্ডার ড্যাশবোর্ডে প্রবেশ করুন।" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "অ্যাডমিন লগইন — Trezo" },
      { property: "og:description", content: "Trezo অর্ডার ড্যাশবোর্ডে প্রবেশ করুন।" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) throw error;
      navigate({ to: "/admin/orders", replace: true });
    } catch (err) {
      setMessage(bnAuthError(err));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo size={44} showText={false} className="mx-auto mb-2" />
          <CardTitle>Trezo অ্যাডমিন</CardTitle>
          <CardDescription>অর্ডার ম্যানেজমেন্ট ড্যাশবোর্ড</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {message && <p className="text-sm text-destructive">{message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              লগইন
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
