import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Layout,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  PlusCircle,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect } from "react";

import { Logo } from "@/components/trezo/Logo";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();

  // First signed-in user becomes admin; afterwards this is a no-op.
  useEffect(() => {
    void supabase.rpc("claim_first_admin");
  }, []);

  const countsQuery = useQuery({
    queryKey: ["sidebar-counts"],
    refetchInterval: 90_000,
    queryFn: async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate(),
      ).padStart(2, "0")}`;

      const [pending, confirmed, preToday, deleted] = await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("status", "pending"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("status", "confirmed"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("status", "pre")
          .lte("pre_date", todayStr),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", true),
      ]);

      return {
        pending: pending.count ?? 0,
        confirmed: confirmed.count ?? 0,
        preToday: preToday.count ?? 0,
        deleted: deleted.count ?? 0,
      };
    },
  });
  const counts = countsQuery.data;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/auth", replace: true });
  };

  const orderItems = [
    {
      to: "/admin",
      label: "ওভারভিউ",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      to: "/admin/orders/web",
      label: "অর্ডারসমূহ",
      icon: ShoppingCart,
      badge: counts?.pending,
    },
    {
      to: "/admin/orders/list",
      label: "অর্ডার লিস্ট",
      icon: ListOrdered,
      badge: counts?.confirmed,
    },
    {
      to: "/admin/orders/create",
      label: "নতুন অর্ডার",
      icon: PlusCircle,
      badge: undefined,
    },
    {
      to: "/admin/orders/deleted",
      label: "মুছে ফেলা",
      icon: Trash2,
      badge: counts?.deleted,
    },
  ] as const;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <div className="px-3 py-4">
              <Link to="/" className="text-primary">
                <Logo size={26} textClassName="text-base" />
              </Link>
            </div>
            <SidebarGroup>

              <SidebarGroupLabel>অর্ডার ম্যানেজমেন্ট</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {orderItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link to={item.to} className="justify-between">
                          <span className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </span>
                          {!!item.badge && (
                            <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>সেটিংস</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="পিক্সেল ও কনভার্সন API">
                      <Link to="/admin/settings/tracking">
                        <span className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span>পিক্সেল ও ট্র্যাকিং</span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="কুরিয়ার (Pathao API)">
                      <Link to="/admin/settings/courier">
                        <span className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span>কুরিয়ার সেটিংস</span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="ল্যান্ডিং পেজসমূহ">
                      <Link to="/admin/landing-pages">
                        <span className="flex items-center gap-2">
                          <Layout className="h-4 w-4" />
                          <span>ল্যান্ডিং পেজসমূহ</span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>


        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger />
            <p className="text-sm font-semibold">অ্যাডমিন প্যানেল</p>
            <div className="ml-auto">
              <Button variant="outline" size="sm" className="gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" /> লগআউট
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
