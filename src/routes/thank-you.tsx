import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Home, Phone } from "lucide-react";
import { useEffect, useRef } from "react";

import { Logo } from "@/components/trezo/Logo";
import { initMetaPixel, pixelTrack } from "@/lib/pixel";

type ThankYouSearch = { order: string; total: number };

export const Route = createFileRoute("/thank-you")({
  validateSearch: (search: Record<string, unknown>): ThankYouSearch => {
    const rawOrder = search["order"];
    const rawTotal = Number(search["total"]);
    return {
      order: typeof rawOrder === "string" ? rawOrder : "",
      total: Number.isFinite(rawTotal) ? rawTotal : 0,
    };
  },
  head: () => ({
    meta: [
      { title: "ধন্যবাদ — আপনার অর্ডার পেয়েছি | Trezo" },
      {
        name: "description",
        content: "আপনার অর্ডারটি সফলভাবে জমা হয়েছে। আমরা শীঘ্রই ফোনে যোগাযোগ করব।",
      },
      { property: "og:title", content: "ধন্যবাদ — আপনার অর্ডার পেয়েছি | Trezo" },
      {
        property: "og:description",
        content: "আপনার অর্ডারটি সফলভাবে জমা হয়েছে।",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { order, total } = Route.useSearch();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    void initMetaPixel().then((pixelId) => {
      if (!pixelId) return;

      // Track PageView on Thank You page
      pixelTrack("PageView", {}, `pv-thankyou-${order || Date.now()}`);

      // Track Purchase event if order is present
      if (order) {
        pixelTrack(
          "Purchase",
          {
            currency: "BDT",
            value: total > 0 ? total : undefined,
            order_id: order,
          },
          `purchase-${order}`
        );
      }
    });
  }, [order, total]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-14 text-slate-800"
      style={{
        fontFamily: "'Anek Bangla', 'Hind Siliguri', system-ui, sans-serif",
        background: "linear-gradient(180deg, #eaf6ff 0%, #f7fbff 45%, #ffffff 100%)",
      }}
    >
      <Link to="/" className="mb-8 text-sky-700">
        <Logo size={30} textClassName="text-lg" />
      </Link>

      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-sky-100">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-11 w-11 text-emerald-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-emerald-600">ধন্যবাদ!</h1>
        <p className="mt-2 text-lg font-semibold">আপনার অর্ডারটি আমরা পেয়েছি</p>

        {order && (
          <div className="mt-5 rounded-2xl bg-sky-50 px-4 py-3">
            <p className="text-sm text-slate-600">আপনার অর্ডার আইডি</p>
            <p className="font-mono text-lg font-bold text-sky-800">{order}</p>
          </div>
        )}

        {typeof total === "number" && total > 0 && (
          <p className="mt-3 text-sm text-slate-600">
            মোট মূল্য (ডেলিভারি চার্জসহ):{" "}
            <span className="font-bold text-slate-800">৳{total.toLocaleString("en-US")}</span>
          </p>
        )}

        <p className="mt-4 text-slate-600">
          আমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনার মোবাইল নম্বরে ফোন দিয়ে অর্ডারটি নিশ্চিত করবেন। পণ্য হাতে পেয়ে
          টাকা দিবেন।
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <Home className="h-4 w-4" /> হোমপেজে ফিরে যান
          </Link>
          <a
            href="tel:+8801794821159"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-sky-200 px-6 py-3 font-semibold text-sky-700 transition-colors hover:bg-sky-50"
          >
            <Phone className="h-4 w-4" /> ফোনে যোগাযোগ
          </a>
        </div>
      </div>
    </div>
  );
}
