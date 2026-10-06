import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { makeOrderId } from "@/lib/orders";
import { bnOrderError } from "@/lib/bn-errors";
import { getFbCookies, initMetaPixel, newEventId, pixelTrack } from "@/lib/pixel";
import { trackFunnelEvent } from "@/lib/tracking.functions";

import {
  Droplets,
  ShieldCheck,
  Wrench,
  Sparkles,
  Phone,
  MessageCircle,
  Gift,
  CheckCircle2,
  Flame,
  Package,
  Loader2,
  PartyPopper,
  Star,
  Truck,
  RotateCcw,
  Headphones,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Frown,
  Smile,
  BadgeCheck,
  HelpCircle,
  ChevronDown,
  X,
  Play,
} from "lucide-react";

import { Logo } from "@/components/trezo/Logo";
import { LpDeveloperFooter } from "@/components/landing/LpDeveloperFooter";

const imgBefore = { url: "/images/before-water.webp", w: 1000, h: 1000 };
const imgAfter = { url: "/images/after-water.webp", w: 1000, h: 1000 };
const pack50 = { url: "/images/pack-50.webp", w: 1000, h: 1000 };
const pack100 = { url: "/images/pack-100.webp", w: 1000, h: 1000 };


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Water faucet tap filter — পরিস্কার ও বিশুদ্ধ পানি | Trezo" },
      {
        name: "description",
        content:
          "ফসেট ট্যাপ ওয়াটার ফিল্টার — পরিস্কার ও স্বাস্থ্যসম্মত পানির নিশ্চয়তা। সহজে ইনস্টল, দীর্ঘস্থায়ী। এখনই অর্ডার করুন।",
      },
      { property: "og:title", content: "Water faucet tap filter — পরিস্কার ও বিশুদ্ধ পানি | Trezo" },
      {
        property: "og:description",
        content:
          "ফসেট ট্যাপ ওয়াটার ফিল্টার — পরিস্কার ও স্বাস্থ্যসম্মত পানির নিশ্চয়তা। ক্যাশ অন ডেলিভারি, ৭ দিনের রিটার্ন।",
      },
    ],
  }),
  component: TapFilterLanding,
});

type Tier = {
  pieces: number;
  price: number;
  freebies: string[];
  badge?: string;
  highlight?: boolean;
  ribbon?: string;
  image?: string;
  alt?: string;
};

const tiers: Tier[] = [
  {
    pieces: 50,
    price: 360,
    freebies: ["ভেলক্রো ব্যান্ড ১০ পিস"],
    badge: "জনপ্রিয়",
    image: pack50.url,
    alt: "৫০ পিস Water faucet tap filter প্যাকেজ",
  },
  {
    pieces: 100,
    price: 690,
    freebies: ["ভেলক্রো ব্যান্ড ২০ পিস"],
    badge: "সবচেয়ে জনপ্রিয়",
    highlight: true,
    ribbon: "BEST VALUE",
    image: pack100.url,
    alt: "১০০ পিস Water faucet tap filter বেস্ট ভ্যালু কম্বো",
  },
];

const DHAKA = { enabled: true, inside: 60, outside: 120 };

const trustItems = [
  { icon: Droplets, label: "পরিস্কার ও বিশুদ্ধ পানি" },
  { icon: ShieldCheck, label: "অন্তদ্ধতা অপসারণে কার্যকর" },
  { icon: Wrench, label: "সহজে ইনস্টল করা যায়" },
];

const reviews = [
  {
    name: "ফারহানা আক্তার",
    city: "ঢাকা",
    rating: 5,
    text: "পানি অনেক পরিস্কার আসে এখন। ইনস্টল করাও অনেক সহজ ছিল। পরিবারের সবাই খুশি।",
  },
  {
    name: "মোঃ আল-আমিন",
    city: "চট্টগ্রাম",
    rating: 5,
    text: "দাম অনুযায়ী প্রোডাক্টের কোয়ালিটি অসাধারণ। ট্যাপের ময়লা একদম আটকে ফেলে।",
  },
  {
    name: "নাজমা বেগম",
    city: "সিলেট",
    rating: 4,
    text: "ডেলিভারি দ্রুত পেয়েছি, প্যাকেজিং ভালো ছিল। কাজ করছে ভালোভাবেই, রেকমেন্ড করব।",
  },
  {
    name: "তানভীর হোসেন",
    city: "খুলনা",
    rating: 5,
    text: "কম্বো প্যাকেজ নিয়েছিলাম — পুরো ফ্যামিলিতে বিলিয়ে দিয়েছি। সবাই পজিটিভ ফিডব্যাক দিয়েছে।",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "মজবুত ও টেকসই",
    desc: "উন্নত মানের ম্যাটেরিয়ালে তৈরি, দীর্ঘদিন ব্যবহারের জন্য উপযোগী।",
  },
  {
    icon: Wrench,
    title: "সহজে লাগানো ও খুলে ফেলা যায়",
    desc: "কোনো টুলস ছাড়াই ঘরের যেকোনো ট্যাপে সহজে সংযোগ করা যায়।",
  },
  {
    icon: Sparkles,
    title: "দীর্ঘস্থায়ী ব্যবহার উপযোগী",
    desc: "বার বার পরিষ্কার করে ব্যবহার করা যায়, খরচ সাশ্রয়ী।",
  },
];

const faqs = [
  {
    q: "ইনস্টল করতে কি টেকনিশিয়ান লাগবে?",
    a: "না, একদমই না! Water faucet tap filter ইনস্টল করতে কোনো টুলস বা টেকনিশিয়ান লাগে না। পুরনো অ্যারেটর হাত দিয়ে খুলে নতুন ফিল্টারটি ঘুরিয়ে লাগিয়ে দিলেই কাজ শেষ — মাত্র ১ মিনিটে।",
  },
  {
    q: "সব ধরনের ট্যাপে কি ফিট হবে?",
    a: "বাংলাদেশের প্রায় ৯৫% স্ট্যান্ডার্ড কিচেন ও বাথরুম ট্যাপে সরাসরি ফিট হয়। প্যাকেজের সাথে বিভিন্ন সাইজের অ্যাডাপ্টার/রাবার রিং দেওয়া থাকে, ফলে থ্রেডেড ও নন-থ্রেডেড দুই ধরনের ট্যাপেই লাগানো যায়।",
  },
  {
    q: "ওয়ারেন্টি ও রিটার্ন পলিসি কী?",
    a: "প্রতিটি Water faucet tap filterে ১০০% মানি ব্যাক গ্যারান্টি রয়েছে। পণ্য পছন্দ না হলে বা কোনো সমস্যা থাকলে ৭ দিনের মধ্যে সম্পূর্ণ টাকা ফেরত পাবেন। কোনো প্রশ্ন ছাড়াই।",
  },
  {
    q: "ডেলিভারি কত দিনে পাবো?",
    a: "ঢাকার মধ্যে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে পণ্য পৌঁছে যাবে। পুরো বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে — পণ্য হাতে পেয়ে টাকা দিন।",
  },
  {
    q: "একটি ফিল্টার কতদিন ব্যবহার করা যায়?",
    a: "সাধারণ ব্যবহারে প্রতিটি ফিল্টার ৩-৬ মাস কার্যকর থাকে (পানির মানের উপর নির্ভর করে)। তাই কম্বো প্যাকেজ নিলে অনেকদিন নিশ্চিন্তে ব্যবহার করতে পারবেন — বারবার অর্ডার করার ঝামেলা নেই।",
  },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("tf-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const phone = "+8801794821159";
const waHref = "https://wa.me/8801794821159";

function BengaliNum(n: number | string) {
  const map: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };
  return String(n)
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

function ReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const w = card?.offsetWidth ?? 300;
    el.scrollBy({ left: dir * (w + 16), behavior: "smooth" });
  };
  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-primary-light/40 via-white to-primary-light/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8" data-reveal>
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
            <Award className="w-3.5 h-3.5" /> কাস্টমার রিভিউ
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-primary-deep">আমাদের গ্রাহকরা কী বলছেন</h2>
          <p className="mt-2 text-slate-600 text-sm md:text-base">হাজারো সন্তুষ্ট পরিবারের ভরসার নাম</p>
        </div>

        <div className="relative" data-reveal>
          <button
            type="button"
            aria-label="আগের রিভিউ"
            onClick={() => scrollBy(-1)}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md ring-1 ring-primary-light items-center justify-center text-primary hover:bg-primary-light/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="পরবর্তী রিভিউ"
            onClick={() => scrollBy(1)}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md ring-1 ring-primary-light items-center justify-center text-primary hover:bg-primary-light/30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-4 px-4 tf-review-track"
          >
            {reviews.map((r, i) => (
              <article
                key={i}
                data-review-card
                className="tf-card rounded-2xl p-5 snap-start flex-shrink-0 w-[85%] sm:w-[46%] md:w-[31%] lg:w-[24%] flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold flex items-center justify-center text-lg shadow">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-primary-deep text-sm leading-tight">{r.name}</div>
                    <div className="text-xs text-slate-500">{r.city}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      className={`w-4 h-4 ${k < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">"{r.text}"</p>
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ভেরিফায়েড ক্রেতা
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const PHONE_RE = /^01[3-9]\d{8}$/;

function TapFilterLanding() {
  useReveal();
  const [droplets] = useState(() => Array.from({ length: 14 }, (_, i) => i));

  const navigate = useNavigate();
  const sendFunnel = useServerFn(trackFunnelEvent);
  const formRef = useRef<HTMLDivElement>(null);
  const tierScrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef(false);
  const [activeTierIdx, setActiveTierIdx] = useState(0);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [tierPieces, setTierPieces] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">("outside");
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; address?: string; submit?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const [success, setSuccess] = useState<null | { orderId: string }>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const checkoutFiredRef = useRef(false);

  // Boot the Meta Pixel from the admin-saved settings and send ViewContent
  // on both the browser and the server (same event id = no double counting).
  useEffect(() => {
    let cancelled = false;
    void initMetaPixel().then((pixelId) => {
      if (cancelled || !pixelId) return;
      const eventId = newEventId();
      pixelTrack("PageView", {}, `pv-${eventId}`);
      pixelTrack("ViewContent", { content_name: "Trezo ট্যাপ ফিল্টার", currency: "BDT" }, eventId);
      const { fbp, fbc } = getFbCookies();
      void sendFunnel({
        data: {
          eventName: "ViewContent",
          eventId,
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
          sourceUrl: window.location.href,
        },
      }).catch(() => undefined);
    });
    return () => {
      cancelled = true;
    };
  }, [sendFunnel]);

  useEffect(() => {
    const el = tierScrollRef.current;
    if (!el) return;
    let hoverPaused = false;
    let interactUntil = 0;
    const IDLE_MS = 7000;
    const bumpIdle = () => {
      interactUntil = Date.now() + IDLE_MS;
    };
    const getStep = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return 0;
      const style = window.getComputedStyle(el);
      const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return first.offsetWidth + gap;
    };
    const updateActiveIdx = () => {
      const step = getStep();
      if (!step) return;
      const idx = Math.round(el.scrollLeft / step);
      setActiveTierIdx(Math.max(0, Math.min(tiers.length - 1, idx)));
    };
    const onUserScroll = () => {
      if (!isAutoScrollingRef.current) bumpIdle();
      updateActiveIdx();
    };
    const onEnter = () => {
      hoverPaused = true;
    };
    const onLeave = () => {
      hoverPaused = false;
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("pointerdown", bumpIdle);
    el.addEventListener("pointerup", bumpIdle);
    el.addEventListener("touchstart", bumpIdle, { passive: true });
    el.addEventListener("touchmove", bumpIdle, { passive: true });
    el.addEventListener("touchend", bumpIdle, { passive: true });
    el.addEventListener("wheel", bumpIdle, { passive: true });
    el.addEventListener("scroll", onUserScroll, { passive: true });

    const id = window.setInterval(() => {
      if (hoverPaused) return;
      if (Date.now() < interactUntil) return;
      const step = getStep();
      if (!step) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + step;
      const target = next > maxScroll - 4 ? 0 : next;
      isAutoScrollingRef.current = true;
      el.scrollTo({ left: target, behavior: "smooth" });
      window.setTimeout(() => {
        isAutoScrollingRef.current = false;
        updateActiveIdx();
      }, 700);
    }, 3600);

    updateActiveIdx();

    // Start the carousel at the default-selected tier so the view matches the order form.
    const defaultIdx = Math.max(0, tiers.findIndex((t) => t.pieces === tierPieces));
    if (defaultIdx > 0) {
      scrollTierTo(defaultIdx);
    }

    return () => {
      window.clearInterval(id);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("pointerdown", bumpIdle);
      el.removeEventListener("pointerup", bumpIdle);
      el.removeEventListener("touchstart", bumpIdle);
      el.removeEventListener("touchmove", bumpIdle);
      el.removeEventListener("touchend", bumpIdle);
      el.removeEventListener("wheel", bumpIdle);
      el.removeEventListener("scroll", onUserScroll);
    };
  }, []);

  const scrollTierTo = (idx: number) => {
    const el = tierScrollRef.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;
    const style = window.getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const step = first.offsetWidth + gap;
    isAutoScrollingRef.current = true;
    el.scrollTo({ left: step * idx, behavior: "smooth" });
    window.setTimeout(() => {
      isAutoScrollingRef.current = false;
      setActiveTierIdx(idx);
    }, 700);
  };

  const selectedTier = (tiers.find((t) => t.pieces === tierPieces) ?? tiers[1])!;
  const subtotal = selectedTier.price * Math.max(1, quantity);
  const deliveryCharge = deliveryArea === "inside" ? DHAKA.inside : DHAKA.outside;
  const grandTotal = subtotal + deliveryCharge;

  // Fires one funnel event on both browser pixel and server CAPI with the same id.
  const fireFunnel = (eventName: "AddToCart" | "InitiateCheckout", value?: number) => {
    const eventId = newEventId();
    pixelTrack(eventName, { currency: "BDT", ...(value !== undefined ? { value } : {}) }, eventId);
    const { fbp, fbc } = getFbCookies();
    void sendFunnel({
      data: {
        eventName,
        eventId,
        ...(value !== undefined ? { value } : {}),
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
        ...(typeof window !== "undefined" ? { sourceUrl: window.location.href } : {}),
      },
    }).catch(() => undefined);
  };

  const selectPackage = (pieces: number) => {
    if (pieces === tierPieces) return;
    setTierPieces(pieces);
    const tier = tiers.find((t) => t.pieces === pieces);
    fireFunnel("AddToCart", tier ? tier.price * Math.max(1, quantity) : undefined);
  };

  const maybeFireCheckout = () => {
    if (checkoutFiredRef.current) return;
    checkoutFiredRef.current = true;
    fireFunnel("InitiateCheckout", grandTotal);
  };

  const scrollToForm = (pieces?: number) => {
    if (pieces) selectPackage(pieces);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  const validate = () => {
    const e: { name?: string; mobile?: string; address?: string } = {};
    if (!name.trim()) e.name = "আপনার নামটি লিখুন";
    else if (name.trim().length < 2) e.name = "নামটি অন্তত ২ অক্ষরের হতে হবে";
    const m = mobile.replace(/\D/g, "");
    if (!m) e.mobile = "মোবাইল নম্বরটি লিখুন";
    else if (!PHONE_RE.test(m)) e.mobile = "১১ ডিজিটের সঠিক নম্বর দিন, যেমন: ০১৭XXXXXXXX";
    if (!address.trim()) e.address = "ডেলিভারির ঠিকানাটি লিখুন";
    else if (address.trim().length < 5) e.address = "সম্পূর্ণ ঠিকানা লিখুন — গ্রাম/এলাকা, থানা ও জেলা";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isFormFilled = () => {
    const m = mobile.replace(/\D/g, "");
    return name.trim().length >= 2 && PHONE_RE.test(m) && address.trim().length >= 5;
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (submitLockRef.current || submitting) return;
    if (!validate()) return;
    submitLockRef.current = true;
    setSubmitting(true);
    if (!checkoutFiredRef.current) {
      checkoutFiredRef.current = true;
      const coEventId = newEventId();
      pixelTrack("InitiateCheckout", { currency: "BDT", value: grandTotal }, coEventId);
      const co = getFbCookies();
      void sendFunnel({
        data: {
          eventName: "InitiateCheckout",
          eventId: coEventId,
          value: grandTotal,
          ...(co.fbp ? { fbp: co.fbp } : {}),
          ...(co.fbc ? { fbc: co.fbc } : {}),
          sourceUrl: window.location.href,
        },
      }).catch(() => undefined);
    }
    try {
      const orderId = makeOrderId();
      const rowId = crypto.randomUUID();
      const { error } = await supabase.from("orders").insert({
        id: rowId,
        order_id: orderId,
        customer_facing_id: orderId,
        customer_name: name.trim(),
        phone: mobile.replace(/\D/g, ""),
        address: address.trim(),
        status: "pending",
        traffic_source: "website",
        delivery_area: deliveryArea,
        delivery_charge: deliveryCharge,
        subtotal,
        total_amount: grandTotal,
      });
      if (error) throw error;

      await supabase.from("order_items").insert({
        order_id: rowId,
        product_name: `Trezo ট্যাপ ফিল্টার — ${selectedTier.pieces} পিস প্যাকেজ`,
        quantity: Math.max(1, quantity),
        unit_price: selectedTier.price,
      });

      setSuccess({ orderId });
      setName("");
      setMobile("");
      setAddress("");
      setQuantity(1);
      void navigate({ to: "/thank-you", search: { order: orderId, total: grandTotal } });
    } catch (err) {
      console.error(err);
      setErrors({ submit: bnOrderError(err) });
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const handleFloatingCta = () => {
    if (isFormFilled() && !submitting) {
      handleSubmit();
    } else {
      scrollToForm();
    }
  };

  return (
    <div className="tf-root min-h-screen text-slate-800">
      <style>{`
        .tf-root { background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 40%, #ffffff 100%); font-family: 'Anek Bangla', 'Hind Siliguri', system-ui, sans-serif; }
        .tf-root, .tf-root * { font-family: 'Anek Bangla', 'Hind Siliguri', system-ui, sans-serif; }
        .tf-hero { position: relative; overflow: hidden; background: radial-gradient(1200px 500px at 50% -10%, #eff6ff 0%, #93c5fd 30%, #2563eb 80%); color: #fff; }
        .tf-hero::before { content:""; position:absolute; inset:0; background: radial-gradient(600px 300px at 80% 20%, rgba(255,255,255,.25), transparent 60%); }
        .tf-drop { position: absolute; top: -20px; width: 10px; height: 14px; background: rgba(255,255,255,.7); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(.3px); animation: tf-fall linear infinite; }
        @keyframes tf-fall { 0%{ transform: translateY(-40px) scale(.8); opacity:0; } 10%{opacity:1;} 100% { transform: translateY(110vh) scale(1); opacity:0; } }
        @keyframes tf-bounce { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-6px);} }
        .tf-bounce { animation: tf-bounce 1.6s ease-in-out infinite; }
        @keyframes tf-pulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(37,99,235,.6);} 50%{ box-shadow: 0 0 0 14px rgba(96,165,250,0);} }
        .tf-pulse { animation: tf-pulse 2s ease-out infinite; }
        [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
        [data-reveal].tf-in { opacity:1; transform: translateY(0); }
        .tf-card { background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(239,246,255,.9)); backdrop-filter: blur(6px); border: 1px solid rgba(59,130,246,.25); box-shadow: 0 10px 30px -12px rgba(37,99,235,.25); transition: transform .3s ease, box-shadow .3s ease; }
        .tf-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px -12px rgba(37,99,235,.4); }
        .tf-card-best { background: linear-gradient(180deg, #eff6ff, #fff); border: 2px solid #3b82f6; box-shadow: 0 20px 40px -10px rgba(37,99,235,.35); }
        .tf-cta { position: relative; overflow: hidden; background: linear-gradient(90deg, #f97316, #ef4444, #f59e0b, #ef4444, #f97316); background-size: 300% 100%; color: #fff; box-shadow: 0 8px 20px -6px rgba(239,68,68,.45); border: none; cursor: pointer; animation: tf-cta-glow 3.6s ease-in-out infinite, tf-cta-shift 6s linear infinite, tf-cta-zoom 1.6s ease-in-out infinite; transition: filter .25s ease, box-shadow .25s ease; transform-origin: center; }
        .tf-cta::after { content:""; position:absolute; inset:0; border-radius:inherit; background: radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,.35), transparent 60%); pointer-events:none; opacity:.55; }
        .tf-cta > * { position: relative; z-index: 1; }
        .tf-cta:hover { filter: brightness(1.08); box-shadow: 0 14px 28px -8px rgba(239,68,68,.6); }
        .tf-cta:active { animation-play-state: paused; filter: brightness(.95); }
        .tf-cta:disabled { opacity: .7; cursor: not-allowed; animation: none; }
        @keyframes tf-cta-shift { 0%{ background-position: 0% 50%;} 100%{ background-position: 300% 50%;} }
        @keyframes tf-cta-glow { 0%,100%{ box-shadow: 0 8px 20px -6px rgba(239,68,68,.45), 0 0 0 0 rgba(249,115,22,.45);} 50%{ box-shadow: 0 12px 26px -6px rgba(239,68,68,.55), 0 0 0 12px rgba(249,115,22,0);} }
        @keyframes tf-cta-zoom { 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.06);} }
        @media (prefers-reduced-motion: reduce) { .tf-cta { animation: none !important; } }
        .tf-ribbon { position:absolute; top:10px; right:10px; background:linear-gradient(135deg,#3b82f6,#3b82f6); color:#fff; font-weight:800; font-size:10px; padding: 4px 10px; letter-spacing: .5px; border-radius: 999px; box-shadow: 0 4px 12px -2px rgba(37,99,235,.5); z-index: 2; }
        .tf-tier-scroll { scrollbar-width: none; -ms-overflow-style: none; touch-action: pan-x pan-y; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; scroll-padding-left: 16px; padding-top: 26px; padding-bottom: 12px; padding-left: 4px; padding-right: 4px; }
        .tf-tier-scroll::-webkit-scrollbar { display: none; }
        .tf-tier-card { width: 82vw; max-width: 360px; scroll-snap-align: start; }
        .tf-tier-image { height: 240px; }
        @media (min-width: 640px) { .tf-tier-card { width: 58vw; max-width: 380px; } .tf-tier-image { height: 270px; } }
        @media (min-width: 768px) { .tf-tier-card { width: calc((100% - 48px) / 1.9); max-width: 360px; scroll-snap-align: start; } .tf-tier-image { height: 280px; } }
        @media (min-width: 1024px) { .tf-tier-card { width: calc((100% - 96px) / 3.3); max-width: 320px; } .tf-tier-image { height: 260px; } }
        .tf-tier-dot { width: 8px; height: 8px; border-radius: 999px; background: #cbd5e1; transition: all .25s ease; }
        .tf-tier-dot.active { background: linear-gradient(135deg,#2563eb,#fb7185); width: 24px; }
        .tf-tier-arrow { width:44px; height:44px; border-radius:999px; background:#fff; border:1px solid #bfdbfe; color:#1e40af; display:inline-flex; align-items:center; justify-content:center; box-shadow: 0 8px 20px -8px rgba(225,29,72,.35); transition: all .2s; }
        .tf-tier-arrow:hover { background:#eff6ff; transform: scale(1.06); }
        .tf-tier-arrow:disabled { opacity:.4; cursor:not-allowed; }
        .tf-input { width:100%; border:1.5px solid #bfdbfe; background:#fff; border-radius:12px; padding:12px 14px; font-size:15px; transition: border-color .2s, box-shadow .2s; }
        .tf-input:focus { outline:none; border-color:#2563eb; box-shadow: 0 0 0 3px rgba(225,29,72,.15); }
        .tf-input-err { border-color:#ef4444 !important; }
        .tf-label { display:block; font-size:13px; font-weight:600; color:#1e3a8a; margin-bottom:6px; }
        .tf-err { color:#dc2626; font-size:12px; margin-top:4px; font-weight:500; }
        @keyframes tf-pop { 0% { transform: scale(.4); opacity:0;} 60% { transform: scale(1.08);} 100% { transform: scale(1); opacity:1;} }
        .tf-pop { animation: tf-pop .5s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes tf-check-draw { to { stroke-dashoffset: 0; } }
        .tf-review-track { scrollbar-width: none; -ms-overflow-style: none; }
        .tf-review-track::-webkit-scrollbar { display: none; }
        .tf-guarantee-pulse { animation: tf-guarantee-pulse 2.4s ease-in-out infinite; }
        @keyframes tf-guarantee-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.55), 0 10px 30px -8px rgba(30,58,138,0.35); } 50% { box-shadow: 0 0 0 14px rgba(255,255,255,0), 0 10px 30px -8px rgba(30,58,138,0.35); } }
      `}</style>

      {/* BRAND BAR */}
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size={30} textClassName="text-xl text-primary-deep" />
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep"
          >
            <Phone className="w-4 h-4" /> {phone}
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="tf-hero pt-14 pb-20 md:pt-20 md:pb-28">
        {droplets.map((i) => (
          <span
            key={i}
            className="tf-drop"
            style={{
              left: `${(i * 7 + 5) % 100}%`,
              animationDuration: `${3 + (i % 5)}s`,
              animationDelay: `${(i % 6) * 0.4}s`,
            }}
          />
        ))}
        <div className="relative max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> নতুন কালেকশন
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight drop-shadow">
              ওয়াটার ফসেট ট্যাপ <span className="text-white/90">ফিল্টার</span>
            </h1>
            <p className="mt-3 text-lg md:text-xl text-white/95 font-medium">
              পরিস্কার ও স্বাস্থ্যসম্মত পানির নিশ্চয়তা
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {trustItems.map((t) => (
                <div
                  key={t.label}
                  className="bg-white/15 backdrop-blur rounded-xl p-3 text-center border border-white/20"
                >
                  <t.icon className="w-6 h-6 mx-auto mb-1.5 text-white/90" />
                  <div className="text-[11px] md:text-xs font-semibold leading-tight">{t.label}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="tf-cta tf-pulse mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base"
            >
              <Flame className="w-5 h-5" /> এখনই অর্ডার করুন
            </button>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px]">
              <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl" aria-hidden />
              <div
                className="relative w-full rounded-2xl overflow-hidden ring-1 ring-white/30 shadow-2xl bg-black"
                style={{ aspectRatio: "9 / 16" }}
              >
                <HeroVideo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setVideoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Water faucet tap filter — লাইভ ডেমো ভিডিও"
        >
          <button
            type="button"
            onClick={() => setVideoOpen(false)}
            aria-label="বন্ধ করুন"
            className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg hover:scale-105 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 bg-black w-full"
            style={{ maxWidth: 450, aspectRatio: "9 / 16" }}
          >
            <iframe
              src="https://www.youtube.com/embed/IrC1J9ad_fg?rel=0&modestbranding=1&playsinline=1&autoplay=1&loop=1&playlist=IrC1J9ad_fg"
              title="Water faucet tap filter — লাইভ ডেমো"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}

      {/* BEFORE / AFTER */}
      <section className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-deep">পার্থক্য দেখুন নিজেই</h2>
            <p className="mt-2 text-slate-600">সাধারণ ট্যাপের পানি বনাম Water faucet tap filter লাগানোর পরের পানি</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 items-stretch relative">
            <div
              data-reveal
              className="rounded-2xl overflow-hidden bg-gradient-to-b from-amber-50 to-white ring-1 ring-amber-200 shadow-sm"
            >
              <div className="bg-amber-500/90 text-white px-5 py-3 flex items-center justify-between">
                <span className="font-bold text-sm">সাধারণ ট্যাপ (Before)</span>
                <Frown className="w-5 h-5" />
              </div>
              <div className="p-6">
                <div className="relative aspect-square rounded-xl ring-1 ring-amber-300 overflow-hidden mb-5 group bg-white">
                  <img
                    src={imgBefore.url}
                    alt="ফিল্টার ছাড়া কলের ঘোলা ও ময়লা পানি"
                    width={imgBefore.w}
                    height={imgBefore.h}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-amber-600/90 px-2 py-1 rounded-md backdrop-blur">
                    ঘোলা ও ময়লা পানি
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {[
                    "দৃশ্যমান ময়লা, বালু ও মরিচা",
                    "দুর্গন্ধ ও অস্বাস্থ্যকর স্বাদ",
                    "চামড়া ও চুলের ক্ষতি",
                    "রান্নার পাত্রে দাগ পড়ে",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white shadow-lg ring-4 ring-primary/20 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div
              data-reveal
              style={{ transitionDelay: "120ms" }}
              className="rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-white ring-1 ring-primary/20 shadow-sm"
            >
              <div className="bg-gradient-to-r from-primary/50 to-primary-light text-white px-5 py-3 flex items-center justify-between">
                <span className="font-bold text-sm">Water faucet tap filter (After)</span>
                <Smile className="w-5 h-5" />
              </div>
              <div className="p-6">
                <div className="relative aspect-square rounded-xl ring-1 ring-primary/30 overflow-hidden mb-5 group bg-white">
                  <img
                    src={imgAfter.url}
                    alt="ওয়াটার ট্যাপ ফিল্টার ব্যবহারে বিশুদ্ধ ও নিরাপদ পানি"
                    width={imgAfter.w}
                    height={imgAfter.h}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/30 via-transparent to-transparent" />
                  <Sparkles className="absolute top-3 right-3 w-5 h-5 text-white drop-shadow animate-pulse" />
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-primary-deep/90 px-2 py-1 rounded-md backdrop-blur">
                    স্বচ্ছ ও বিশুদ্ধ পানি
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {[
                    "সম্পূর্ণ পরিষ্কার ও স্বচ্ছ পানি",
                    "কোনো দুর্গন্ধ বা বাজে স্বাদ নেই",
                    "চামড়া ও চুলের জন্য নিরাপদ",
                    "রান্না ও পান — সবকিছুতেই ভালো",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center" data-reveal>
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="tf-cta inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-base"
            >
              <Flame className="w-5 h-5" /> এখনই অর্ডার করুন
            </button>
          </div>

          {/* GUARANTEE BADGE */}
          <div className="mt-12" data-reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-deep via-primary to-primary-light text-white p-6 md:p-8 shadow-xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-light/20 blur-2xl" />
              <div className="relative flex flex-col md:flex-row items-center gap-5 md:gap-7">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white text-primary flex items-center justify-center shadow-lg ring-4 ring-white/40 tf-guarantee-pulse">
                    <ShieldCheck className="w-12 h-12 md:w-14 md:h-14" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    100%
                  </span>
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">
                    <BadgeCheck className="w-3.5 h-3.5" /> আমাদের প্রতিশ্রুতি
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold">১০০% মানি ব্যাক গ্যারান্টি</h3>
                  <p className="mt-1.5 text-sm md:text-base text-primary-foreground/90">
                    পণ্য পছন্দ না হলে বা কোনো সমস্যা থাকলে ৭ দিনের মধ্যে সম্পূর্ণ টাকা ফেরত। মান ও বিশুদ্ধতার নিশ্চয়তা
                    আমাদের।
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 text-[11px] font-bold">
                    <span className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">✓ ৭ দিন রিটার্ন</span>
                    <span className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">✓ ক্যাশ অন ডেলিভারি</span>
                    <span className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">✓ বিশ্বস্ত ব্র্যান্ড</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection />

      {/* PRICING */}
      <section id="pricing" className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-deep">প্যাকেজ ও কম্বো অফার</h2>
            <p className="mt-2 text-slate-600">যত বেশি নিবেন — তত বেশি ফ্রি গিফট! সীমিত সময়ের অফার।</p>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="আগের প্যাকেজ"
              onClick={() => scrollTierTo(Math.max(0, activeTierIdx - 1))}
              disabled={activeTierIdx === 0}
              className="tf-tier-arrow hidden md:inline-flex absolute -left-2 lg:-left-5 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="পরের প্যাকেজ"
              onClick={() => scrollTierTo(Math.min(tiers.length - 1, activeTierIdx + 1))}
              disabled={activeTierIdx >= tiers.length - 1}
              className="tf-tier-arrow hidden md:inline-flex absolute -right-2 lg:-right-5 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={tierScrollRef}
              className="tf-tier-scroll flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth"
            >
              {tiers.map((t) => (
                <div
                  key={t.pieces}
                  className={`tf-tier-card relative rounded-2xl p-6 pt-9 flex flex-col snap-start flex-shrink-0 ${t.highlight ? "tf-card-best" : "tf-card"}`}
                >
                  {t.highlight && <div className="tf-ribbon">{t.ribbon}</div>}

                  <div className="absolute -top-3 -left-3 tf-bounce z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-extrabold text-base shadow-lg border-4 border-white">
                      ফ্রি!
                    </div>
                  </div>

                  {t.badge && !t.highlight && (
                    <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {t.badge}
                    </span>
                  )}

                  {t.image && (
                    <div className="tf-tier-image rounded-xl overflow-hidden bg-white ring-1 ring-primary/20 mb-4 flex items-center justify-center">
                      <img
                        src={t.image}
                        alt={t.alt || ""}
                        width={1000}
                        height={1000}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />

                    </div>
                  )}

                  <div className="mt-5 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 mb-2">
                      <Gift className="w-4 h-4" /> ফ্রি গিফট
                    </div>
                    <ul className="space-y-2">
                      {t.freebies.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm md:text-base text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToForm(t.pieces)}
                    className="tf-cta mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-base w-full"
                  >
                    এখনই অর্ডার করুন
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-center items-center gap-2">
            {tiers.map((t, i) => (
              <button
                key={t.pieces}
                type="button"
                aria-label={`প্যাকেজ ${i + 1}`}
                onClick={() => scrollTierTo(i)}
                className={`tf-tier-dot ${i === activeTierIdx ? "active" : ""}`}
              />
            ))}
          </div>

          <div className="mt-3 flex justify-center gap-1.5 text-xs text-primary md:hidden">
            <span className="inline-flex items-center gap-1 bg-primary/5 border border-primary/20 px-3 py-1 rounded-full">
              ← স্লাইড করুন →
            </span>
          </div>

          <div className="mt-8 text-center" data-reveal>
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary-deep border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold">
              <Flame className="w-4 h-4" /> সীমিত সময়ের অফার — স্টক শেষ হওয়ার আগেই অর্ডার করুন!
            </span>
          </div>
        </div>
      </section>

      {/* ORDER FORM */}
      <section id="order" ref={formRef} className="py-14 md:py-20 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8" data-reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-deep">অর্ডার ফর্ম</h2>
            <p className="mt-2 text-slate-600">নিচের ফর্মটি পূরণ করে সাবমিট করুন — আমরা দ্রুত যোগাযোগ করব।</p>
          </div>

          <div className="tf-card rounded-3xl p-6 md:p-8" data-reveal>
            {success ? (
              <div className="tf-pop text-center py-8">
                <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 52 52" className="w-12 h-12">
                    <circle cx="26" cy="26" r="24" fill="none" stroke="#10b981" strokeWidth="3" />
                    <path
                      d="M14 27 L23 36 L39 18"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 50,
                        strokeDashoffset: 50,
                        animation: "tf-check-draw .6s .2s ease-out forwards",
                      }}
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                  <PartyPopper className="w-6 h-6" />
                  <h3 className="text-2xl md:text-3xl font-extrabold">ধন্যবাদ!</h3>
                </div>
                <p className="text-lg font-semibold text-slate-800">আপনার অর্ডার পাওয়া গেছে ✅</p>
                <p className="mt-2 text-sm text-slate-600">
                  অর্ডার আইডি: <span className="font-mono font-bold text-primary">{success.orderId}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">আমরা শীঘ্রই আপনার নম্বরে যোগাযোগ করব ইনশাআল্লাহ।</p>
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-primary border-2 border-primary/20 hover:bg-primary/5"
                >
                  আরেকটি অর্ডার দিন
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5">
                  <label className="tf-label mb-2 block">প্যাকেজ নির্বাচন করুন</label>
                  <div className="grid grid-cols-2 gap-3">
                    {tiers.map((t) => {
                      const selected = t.pieces === tierPieces;
                      const regular = Math.round(t.price * 1.35);
                      return (
                        <button
                          type="button"
                          key={t.pieces}
                          onClick={() => selectPackage(t.pieces)}
                          className={`relative text-left rounded-xl border-2 p-2.5 sm:p-3 transition-all ${
                            selected
                              ? "border-orange-500 bg-orange-50 shadow-md"
                              : "border-slate-200 bg-white hover:border-orange-300"
                          }`}
                          aria-pressed={selected}
                        >
                          {t.badge && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white whitespace-nowrap">
                              {t.badge}
                            </span>
                          )}
                          <div className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
                            {t.pieces} পিস প্যাকেজ
                          </div>
                          <div className="mt-1.5 flex items-baseline gap-1 flex-wrap">
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                              ৳{regular.toLocaleString("en-US")}
                            </span>
                            <span className="text-sm sm:text-base font-extrabold text-orange-600">
                              ৳{t.price.toLocaleString("en-US")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="tf-label">
                      নাম <span className="text-primary-deep">*</span>
                    </label>
                    <input
                      type="text"
                      className={`tf-input ${errors.name ? "tf-input-err" : ""}`}
                      placeholder="আপনার পূর্ণ নাম"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        maybeFireCheckout();
                      }}
                      maxLength={80}
                    />
                    {errors.name && <div className="tf-err">{errors.name}</div>}
                  </div>
                  <div>
                    <label className="tf-label">
                      মোবাইল নম্বর <span className="text-primary-deep">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      className={`tf-input ${errors.mobile ? "tf-input-err" : ""}`}
                      placeholder="০১XXXXXXXXX"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        maybeFireCheckout();
                      }}
                      maxLength={14}
                    />
                    {errors.mobile && <div className="tf-err">{errors.mobile}</div>}
                  </div>
                  <div>
                    <label className="tf-label">
                      সম্পূর্ণ ঠিকানা <span className="text-primary-deep">*</span>
                    </label>
                    <textarea
                      className={`tf-input ${errors.address ? "tf-input-err" : ""}`}
                      rows={2}
                      placeholder="বাসা, রোড, থানা, জেলা"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        maybeFireCheckout();
                      }}
                      maxLength={300}
                    />
                    {errors.address && <div className="tf-err">{errors.address}</div>}
                  </div>
                </div>

                {DHAKA.enabled && (
                  <div className="mt-5">
                    <label className="tf-label mb-2 block">ডেলিভারি এরিয়া</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {[
                        { value: "inside" as const, label: "ঢাকার মধ্যে", charge: DHAKA.inside },
                        { value: "outside" as const, label: "ঢাকার বাইরে", charge: DHAKA.outside },
                      ].map((opt) => {
                        const sel = deliveryArea === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setDeliveryArea(opt.value)}
                            className={`rounded-xl border-2 p-3 text-left transition-all ${
                              sel
                                ? "border-orange-500 bg-orange-50 shadow-md"
                                : "border-slate-200 bg-white hover:border-orange-300"
                            }`}
                            aria-pressed={sel}
                          >
                            <div className="text-sm font-semibold text-slate-800">{opt.label}</div>
                            <div className="text-xs text-orange-600 font-bold mt-0.5">ডেলিভারি চার্জ ৳{opt.charge}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border-2 border-primary/20 bg-white p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">পরিমাণ (কতটি প্যাকেজ)</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {selectedTier.pieces} পিস প্যাকেজ × {BengaliNum(quantity)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="পরিমাণ কমান"
                      className="w-10 h-10 rounded-full bg-primary/10 text-primary-deep font-bold text-xl flex items-center justify-center hover:bg-primary/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="min-w-[2.5rem] text-center text-lg font-extrabold text-primary-deep">
                      {BengaliNum(quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      disabled={quantity >= 99}
                      aria-label="পরিমাণ বাড়ান"
                      className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/20 p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">প্যাকেজ:</span>
                    <span className="font-semibold text-primary-deep">
                      {selectedTier.pieces} পিস × {quantity}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-start justify-between text-xs text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" /> ফ্রি গিফট:
                    </span>
                    <span className="text-right font-medium">{selectedTier.freebies.join(", ")}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-slate-700">সাবটোটাল:</span>
                    <span className="font-semibold text-primary-deep">৳ {subtotal.toLocaleString("en-US")}</span>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-sm">
                    <span className="text-slate-700">
                      ডেলিভারি চার্জ ({deliveryArea === "inside" ? "ঢাকার মধ্যে" : "ঢাকার বাইরে"}):
                    </span>
                    <span className="font-semibold text-primary-deep">৳ {deliveryCharge.toLocaleString("en-US")}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-primary/20 flex justify-between items-center">
                    <span className="font-bold text-slate-800">সর্বমোট:</span>
                    <span className="text-2xl font-extrabold text-orange-600">
                      ৳ {grandTotal.toLocaleString("en-US")}
                    </span>
                  </div>
                </div>

                {errors.submit && (
                  <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="tf-cta mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5" /> অর্ডার কনফার্ম করুন
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  সাবমিট করার সাথে সাথে আপনার অর্ডার সেভ হবে এবং আমরা যোগাযোগ করব।
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-deep">কেন Water faucet tap filter?</h2>
            <p className="mt-2 text-slate-600">দৈনন্দিন ব্যবহারের জন্য সেরা সমাধান</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                data-reveal
                className="tf-card rounded-2xl p-6 text-center"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4 shadow-md">
                  <b.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-primary-deep">{b.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
              সহজ ইনস্টলেশন
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-primary-deep">কীভাবে ব্যবহার করবেন?</h2>
            <p className="mt-2 text-slate-600">মাত্র ৩টি সহজ ধাপে ইনস্টল করুন — কোনো টুলস বা টেকনিশিয়ান লাগবে না!</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative">
            {[
              {
                icon: Wrench,
                title: "পুরনো ফিল্টার/অ্যারেটর খুলুন",
                desc: "আপনার ট্যাপের সামনের অংশ (aerator) হাত দিয়েই ঘুরিয়ে সহজে খুলে ফেলুন।",
                step: "১",
              },
              {
                icon: Droplets,
                title: "Water faucet tap filter লাগান",
                desc: "নতুন Water faucet tap filterটি ট্যাপের মুখে বসিয়ে হালকাভাবে ঘুরিয়ে টাইট করে নিন।",
                step: "২",
              },
              {
                icon: Sparkles,
                title: "বিশুদ্ধ পানি উপভোগ করুন",
                desc: "ট্যাপ চালু করুন — ময়লা, বালু ও অপদ্রব্য মুক্ত পরিষ্কার পানি সরাসরি!",
                step: "৩",
              },
            ].map((s, i) => (
              <div
                key={i}
                data-reveal
                style={{ transitionDelay: `${i * 100}ms` }}
                className="relative rounded-2xl bg-white ring-1 ring-primary/20 shadow-sm p-6 pt-10 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="absolute -top-5 left-6 w-11 h-11 rounded-full bg-gradient-to-br from-primary/50 to-primary-light text-white flex items-center justify-center font-extrabold text-lg shadow-lg ring-4 ring-white">
                  {s.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary-deep">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-500" data-reveal>
            <Clock className="inline w-4 h-4 mr-1 -mt-0.5" />
            মোট সময়: <span className="font-bold text-primary">১ মিনিটেরও কম!</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" /> সাধারণ প্রশ্ন
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-primary-deep">আপনার যা জানা দরকার</h2>
            <p className="mt-2 text-slate-600">অর্ডার করার আগে কমন প্রশ্নগুলোর উত্তর দেখে নিন</p>
          </div>

          <div className="space-y-3">
            {faqs.map((item, i) => (
              <details
                key={i}
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
                className="group rounded-2xl bg-white ring-1 ring-primary/20 hover:ring-primary/30 shadow-sm hover:shadow-md transition-all open:ring-primary open:shadow-md"
              >
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-5 select-none">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary-light text-white font-bold text-sm flex items-center justify-center shadow">
                      {BengaliNum(i + 1)}
                    </span>
                    <span className="font-bold text-primary-deep text-sm md:text-base pt-1">{item.q}</span>
                  </div>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center group-open:bg-primary/50 group-open:text-white transition-all group-open:rotate-180">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </summary>
                <div className="px-5 pb-5 pl-16 -mt-1">
                  <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed border-l-2 border-primary/20 pl-4">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-600" data-reveal>
            আরও প্রশ্ন?{" "}
            <a href="tel:01794821159" className="font-bold text-primary hover:underline">
              কল করুন — 01794821159
            </a>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4" data-reveal>
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-deep via-primary-light to-primary-deep text-white p-8 md:p-10 text-center shadow-2xl">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 60%, #fff 0, transparent 40%)",
              }}
            />
            <Droplets className="w-10 h-10 mx-auto mb-3" />
            <h3 className="text-2xl md:text-3xl font-extrabold">স্বাস্থ্যকর জীবন শুরু হোক বিশুদ্ধ পানি দিয়ে</h3>
            <p className="mt-2 text-primary-foreground/90 text-sm md:text-base">
              প্রতিদিনের রান্না, পান আর ব্যবহার — সব কিছুতে নিরাপদ পানি নিশ্চিত করুন।
            </p>
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="tf-cta mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold"
            >
              <Package className="w-5 h-5" /> এখনই অর্ডার করুন
            </button>
          </div>
        </div>
      </section>

      <div className="pb-32 md:pb-28 text-center text-xs">
        <Logo size={34} textClassName="text-lg text-primary-deep" className="mb-3" />
        <div className="mb-2" />
        <LpDeveloperFooter />
      </div>

      {/* STICKY BOTTOM CTA */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:bottom-4">
        <div className="mx-auto max-w-2xl md:rounded-2xl bg-white/95 backdrop-blur border-t md:border border-primary/20 shadow-2xl px-3 py-2.5 flex items-center gap-2">
          <a
            href={`tel:${phone}`}
            aria-label="Call"
            className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"
          >
            <Phone className="w-5 h-5" />
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={handleFloatingCta}
            disabled={submitting}
            className="tf-cta flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-bold text-sm disabled:opacity-70"
          >
            <Flame className="w-4 h-4" />{" "}
            {submitting ? "অর্ডার হচ্ছে..." : isFormFilled() ? "অর্ডার কনফার্ম করুন" : "এখনই অর্ডার করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroVideo() {
  const [play, setPlay] = useState(false);

  if (play) {
    return (
      <iframe
        src="https://www.youtube.com/embed/IrC1J9ad_fg?rel=0&modestbranding=1&playsinline=1&autoplay=1&mute=1&loop=1&playlist=IrC1J9ad_fg&controls=1"
        title="Water faucet tap filter — লাইভ ডেমো"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="absolute inset-0 h-full w-full"
      aria-label="ডেমো ভিডিও চালু করুন"
    >
      <img
        src="https://i.ytimg.com/vi/IrC1J9ad_fg/maxresdefault.jpg"
        alt="Trezo ট্যাপ ফিল্টার ডেমো ভিডিও"
        width={480}
        height={360}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl">
          <Play className="ml-1 h-7 w-7 text-primary-deep" />
        </span>
      </span>
    </button>
  );
}
