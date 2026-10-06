import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { makeOrderId } from "@/lib/orders";
import { bnOrderError } from "@/lib/bn-errors";
import { getFbCookies, initMetaPixel, newEventId, pixelTrack } from "@/lib/pixel";
import { trackFunnelEvent } from "@/lib/tracking.functions";
import { Logo } from "@/components/trezo/Logo";
import { LpDeveloperFooter } from "@/components/landing/LpDeveloperFooter";

import {
  Snowflake,
  ShieldCheck,
  Refrigerator,
  Sparkles,
  Phone,
  MessageCircle,
  Gift,
  CheckCircle2,
  Flame,
  Package,
  Loader2,
  Star,
  Truck,
  RotateCcw,
  Headphones,
  Award,
  Clock,
  ArrowRight,
  Droplets,
  Recycle,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";


const imgHero = "/images/foil-hero-v2.webp";
const imgBefore = "/images/foil-before-v2.webp";
const imgFeatures = "/images/foil-after-v2.webp";
const pack10 = imgHero;
const pack20 = imgHero;
const pack30 = imgHero;

export const Route = createFileRoute("/lp/foil-bag")({
  head: () => ({
    meta: [
      { title: "অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ — খাবার থাকবে ফ্রেশ | Trezo" },
      {
        name: "description",
        content:
          "প্রিমিয়াম অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ — এয়ারটাইট, ১০০% লিকপ্রুফ, ফ্রিজার সেফ ও রিইউজেবল। ১০ পিস ৳৩৯০ থেকে শুরু, ক্যাশ অন ডেলিভারি।",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ — খাবার থাকবে ফ্রেশ | Trezo" },
      {
        property: "og:description",
        content:
          "এয়ারটাইট জিপ লক, ১০০% লিকপ্রুফ, ফ্রিজার সেফ, বারবার ব্যবহারযোগ্য। ২-২.৫ কেজি পর্যন্ত ধারণক্ষমতা। এখনই অর্ডার করুন।",
      },
    ],
  }),
  component: FoilBagLanding,
});

type Tier = {
  pieces: number;
  price: number;
  original: number;
  saving: number;
  image: string;
  badge?: string;
  highlight?: boolean;
  ribbon?: string;
  perks: string[];
};

const tiers: Tier[] = [
  {
    pieces: 10,
    price: 390,
    original: 600,
    saving: 159,
    image: pack10,
    perks: ["১০ পিস (১০x১০ ইঞ্চি)", "ট্রায়াল প্যাক"],
    badge: "স্টার্টার",
  },
  {
    pieces: 20,
    price: 690,
    original: 950,
    saving: 260,
    image: pack20,
    perks: ["২০ পিস (১০x১০ ইঞ্চি)", "সবচেয়ে বেশি বিক্রি"],
    badge: "সবচেয়ে জনপ্রিয়",
    highlight: true,
    ribbon: "BEST VALUE",
  },
  {
    pieces: 30,
    price: 990,
    original: 1450,
    saving: 460,
    image: pack30,
    perks: ["৩০ পিস (১০x১০ ইঞ্চি)", "ফ্যামিলি প্যাক — সর্বোচ্চ সাশ্রয়"],
    badge: "ফ্যামিলি প্যাক",
  },
];

const DHAKA = { inside: 0, outside: 0 };
const phone = "+8801794821159";
const waHref = "https://wa.me/8801794821159";
const PHONE_RE = /^01[3-9]\d{8}$/;

function bn(n: number | string) {
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

const features = [
  { icon: Lock, title: "এয়ারটাইট জিপ লক", desc: "বাতাস ঢুকতে পারে না, তাই খাবার অনেকদিন ফ্রেশ থাকে।" },
  { icon: Droplets, title: "১০০% লিকপ্রুফ", desc: "ঝোল বা তরল খাবার রাখলেও এক ফোঁটাও বাইরে পড়বে না।" },
  { icon: Snowflake, title: "ফ্রিজার সেফ", desc: "ডিপ ফ্রিজেও ব্যাগ ফাটে না, খাবারের স্বাদ অক্ষত থাকে।" },
  { icon: Recycle, title: "বারবার ব্যবহারযোগ্য", desc: "ধুয়ে শুকিয়ে আবার ব্যবহার করা যায় — খরচ সাশ্রয়ী।" },
  { icon: Package, title: "২-২.৫ কেজি ধারণক্ষমতা", desc: "মাছ, মাংস, সবজি — এক ব্যাগেই অনেকটা রাখা যায়।" },
  { icon: Refrigerator, title: "ফ্রিজ থাকবে গোছানো", desc: "সমান সাইজের ব্যাগে ফ্রিজ দেখতে পরিষ্কার ও সাজানো লাগে।" },
];

const problems = [
  "সাধারণ পলিব্যাগে খাবার দ্রুত নষ্ট হয়ে যায়",
  "ঝোল বা রক্ত লিক করে ফ্রিজ নোংরা হয়",
  "ব্যাকটেরিয়া জন্মে দুর্গন্ধ ছড়ায়",
  "একবার ব্যবহার করেই ফেলে দিতে হয়",
];

const solutions = [
  "মাছ-মাংস রাখলেও গন্ধ ছড়াবে না",
  "খাবার বেশি সময় ফ্রেশ থাকে",
  "ফ্রিজ থাকবে পরিষ্কার ও গুছানো",
  "বারবার ব্যবহার করা যায় (Reusable)",
  "Date লিখে রাখুন — পুরনো খাবার ভুলবেন না",
];

const reviews = [
  { name: "সাদিয়া ইসলাম", city: "ঢাকা", rating: 5, text: "ফ্রিজ এখন একদম গোছানো। মাছ-মাংস আলাদা করে রাখতে পারছি, কোনো গন্ধ নেই।" },
  { name: "মোঃ রিফাত হাসান", city: "চট্টগ্রাম", rating: 5, text: "জিপ লকটা অনেক শক্ত। ঝোলসহ তরকারি রেখেছিলাম, একটুও লিক করেনি।" },
  { name: "নুসরাত জাহান", city: "রাজশাহী", rating: 5, text: "২০ পিসের প্যাক নিয়েছি। ধুয়ে আবার ব্যবহার করছি, কোয়ালিটি দারুণ।" },
  { name: "তাসনিম আরা", city: "সিলেট", rating: 4, text: "ডেলিভারি দ্রুত পেয়েছি। দামের তুলনায় প্রোডাক্ট অনেক ভালো।" },
];

const faqs = [
  { q: "ব্যাগের সাইজ কত?", a: "প্রতিটি ব্যাগ ১০x১০ ইঞ্চি, এবং এতে ২ থেকে ২.৫ কেজি পর্যন্ত খাবার রাখা যায়।" },
  { q: "ফ্রিজে রাখলে কি ফেটে যাবে?", a: "না। ব্যাগগুলো ফ্রিজার সেফ, ডিপ ফ্রিজেও নরম থাকে এবং ফাটে না।" },
  { q: "কতবার ব্যবহার করা যাবে?", a: "ভালোভাবে ধুয়ে শুকিয়ে নিলে একই ব্যাগ অনেকবার ব্যবহার করা যায়।" },
  { q: "ডেলিভারি চার্জ কত?", a: "সীমিত সময়ের অফারে সারাদেশে ফ্রি ডেলিভারি! ক্যাশ অন ডেলিভারি উপলব্ধ।" },
  { q: "পণ্য পছন্দ না হলে কী হবে?", a: "পণ্য হাতে পেয়ে দেখে নিতে পারবেন। সমস্যা থাকলে ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।" },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("fb-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function FoilBagLanding() {
  useReveal();
  const navigate = useNavigate();
  const sendFunnel = useServerFn(trackFunnelEvent);

  const formRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const packageRef = useRef<HTMLDivElement>(null);
  const checkoutFiredRef = useRef(false);
  const submitLockRef = useRef(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [pieces, setPieces] = useState<number>(20);
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">("outside");
  const [errors, setErrors] = useState<{ name?: string; mobile?: string; address?: string; submit?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const isAutoScrollingRef = useRef(false);
  const isAutoScrollingPackRef = useRef(false);


  // Auto-slide for Reviews
  useEffect(() => {
    const el = reviewRef.current;
    if (!el) return;
    let hoverPaused = false;
    let interactUntil = 0;
    const IDLE_MS = 6000;

    const bumpIdle = () => {
      if (isAutoScrollingRef.current) return;
      interactUntil = Date.now() + IDLE_MS;
    };

    const getStep = () => {
      const first = el.querySelector("[data-review-card]") as HTMLElement | undefined;
      if (!first) return 0;
      const style = window.getComputedStyle(el);
      const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return first.offsetWidth + gap;
    };

    const onEnter = () => (hoverPaused = true);
    const onLeave = () => (hoverPaused = false);
    const onScroll = () => {
      if (!isAutoScrollingRef.current) bumpIdle();
    };

    el.addEventListener("mouseenter", onEnter, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    el.addEventListener("pointerdown", bumpIdle, { passive: true });
    el.addEventListener("touchstart", bumpIdle, { passive: true });
    el.addEventListener("wheel", bumpIdle, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });

    const id = window.setInterval(() => {
      if (hoverPaused || Date.now() < interactUntil) return;
      const step = getStep();
      if (!step) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      const currentScroll = Math.ceil(el.scrollLeft);
      const next = currentScroll + step;
      const target = next >= maxScroll - 5 ? 0 : next;

      isAutoScrollingRef.current = true;
      el.scrollTo({ left: target, behavior: "smooth" });

      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 800);
    }, 4000);

    return () => {
      window.clearInterval(id);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("pointerdown", bumpIdle);
      el.removeEventListener("touchstart", bumpIdle);
      el.removeEventListener("wheel", bumpIdle);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Auto-slide for Packages
  useEffect(() => {
    const el = packageRef.current;
    if (!el) return;
    let hoverPaused = false;
    let interactUntil = 0;
    const IDLE_MS = 6000;

    const bumpIdle = () => {
      if (isAutoScrollingPackRef.current) return;
      interactUntil = Date.now() + IDLE_MS;
    };

    const getStep = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return 0;
      const style = window.getComputedStyle(el);
      const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return first.offsetWidth + gap;
    };

    const onEnter = () => (hoverPaused = true);
    const onLeave = () => (hoverPaused = false);
    const onScroll = () => {
      if (!isAutoScrollingPackRef.current) bumpIdle();
    };

    el.addEventListener("mouseenter", onEnter, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    el.addEventListener("pointerdown", bumpIdle, { passive: true });
    el.addEventListener("touchstart", bumpIdle, { passive: true });
    el.addEventListener("wheel", bumpIdle, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });

    const id = window.setInterval(() => {
      if (window.innerWidth >= 768) return; // Only auto-slide on mobile
      if (hoverPaused || Date.now() < interactUntil) return;
      const step = getStep();
      if (!step) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      const currentScroll = Math.ceil(el.scrollLeft);
      const next = currentScroll + step;
      const target = next >= maxScroll - 5 ? 0 : next;

      isAutoScrollingPackRef.current = true;
      el.scrollTo({ left: target, behavior: "smooth" });

      setTimeout(() => {
        isAutoScrollingPackRef.current = false;
      }, 800);
    }, 5000);

    return () => {
      window.clearInterval(id);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("pointerdown", bumpIdle);
      el.removeEventListener("touchstart", bumpIdle);
      el.removeEventListener("wheel", bumpIdle);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    void initMetaPixel().then((pixelId) => {
      if (cancelled || !pixelId) return;
      const eventId = newEventId();
      pixelTrack("PageView", {}, `pv-${eventId}`);
      pixelTrack("ViewContent", { content_name: "Aluminium ফয়েল জিপলক ব্যাগ", currency: "BDT" }, eventId);
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

  const selectedTier = (tiers.find((t) => t.pieces === pieces) ?? tiers[1])!;
  const subtotal = selectedTier.price * Math.max(1, quantity);
  const deliveryCharge = deliveryArea === "inside" ? DHAKA.inside : DHAKA.outside;
  const grandTotal = subtotal + deliveryCharge;
  const saved = selectedTier.saving * Math.max(1, quantity);

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

  const selectPackage = (p: number) => {
    if (p === pieces) return;
    setPieces(p);
    const t = tiers.find((x) => x.pieces === p);
    fireFunnel("AddToCart", t ? t.price * Math.max(1, quantity) : undefined);
  };

  const maybeFireCheckout = () => {
    if (checkoutFiredRef.current) return;
    checkoutFiredRef.current = true;
    fireFunnel("InitiateCheckout", grandTotal);
  };

  const scrollToForm = (p?: number) => {
    if (p) selectPackage(p);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const scrollReviews = (dir: number) => {
    const el = reviewRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 16), behavior: "smooth" });
  };

  const scrollPackages = (dir: number) => {
    const el = packageRef.current;
    if (!el) return;
    const item = el.children[0] as HTMLElement | undefined;
    if (!item) return;
    const step = item.offsetWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
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

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (submitLockRef.current || submitting) return;
    if (!validate()) return;
    submitLockRef.current = true;
    setSubmitting(true);
    maybeFireCheckout();
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
        product_name: `Aluminium ফয়েল জিপলক ব্যাগ — ${selectedTier.pieces} পিস প্যাক`,
        quantity: Math.max(1, quantity),
        unit_price: selectedTier.price,
      });

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

  const isFormFilled = () => {
    const m = mobile.replace(/\D/g, "");
    return name.trim().length >= 2 && PHONE_RE.test(m) && address.trim().length >= 5;
  };

  const handleFloatingCta = () => {
    if (isFormFilled() && !submitting) {
      void handleSubmit();
    } else {
      scrollToForm();
    }
  };

  return (
    <div className="fb-root min-h-screen">
      <style>{`
        .fb-root { --gold:#2563eb; --gold-2:#3b82f6; --ink:#0f172a; --ink-2:#1e293b; --surface:rgba(255,255,255,.88); --surface-2:#f8fbff; --text:#334155; --text-muted:#334155; color:var(--text); background: linear-gradient(180deg,#f0f9ff 0%,#ffffff 40%,#f8fbff 100%); font-family:'Anek Bangla','Hind Siliguri',system-ui,sans-serif; }
        .fb-root, .fb-root * { font-family:'Anek Bangla','Hind Siliguri',system-ui,sans-serif; }
        .fb-root h1,.fb-root h2,.fb-root h3,.fb-root h4{color:#0b1220;letter-spacing:-.01em;}
        .fb-root p,.fb-root li,.fb-root label,.fb-root span{line-height:1.75;}
        .fb-root{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
        [data-reveal]{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.2,.7,.3,1),transform .8s cubic-bezier(.2,.7,.3,1);}
        [data-reveal].fb-in{opacity:1;transform:none;}
        .fb-gold-text{color:#2563eb;}
        .fb-gold-text-static{color:#2563eb;}
        .fb-glass{background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,251,255,.92));border:1px solid rgba(59,130,246,.18);border-radius:20px;backdrop-filter:blur(10px);box-shadow:0 24px 60px -30px rgba(15,23,42,.12);transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease;}
        .fb-glass:hover{transform:translateY(-6px);border-color:rgba(59,130,246,.45);box-shadow:0 32px 70px -28px rgba(59,130,246,.22);}
        .fb-pack-best{border:1.5px solid rgba(59,130,246,.55);background:linear-gradient(180deg,rgba(59,130,246,.10),rgba(255,255,255,.92));box-shadow:0 30px 70px -28px rgba(59,130,246,.30);}
        .fb-selected{outline:2px solid var(--gold);outline-offset:2px;}
        .fb-ribbon{position:absolute;top:14px;right:14px;z-index:2;background:linear-gradient(100deg,#3b82f6,#2563eb);color:#ffffff;font-weight:800;font-size:10px;letter-spacing:.08em;padding:5px 12px;border-radius:999px;box-shadow:0 8px 20px -8px rgba(37,99,235,.8);}
        .fb-cta{position:relative;overflow:hidden;background:linear-gradient(90deg,#f97316,#ef4444,#f59e0b,#ef4444,#f97316);background-size:300% 100%;color:#fff;border:none;cursor:pointer;box-shadow:0 10px 26px -8px rgba(239,68,68,.55);animation:fb-shift 6s linear infinite,fb-glow 3.4s ease-in-out infinite;transition:filter .25s ease;}
        .fb-cta::after{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(120% 60% at 50% 0%,rgba(255,255,255,.35),transparent 60%);pointer-events:none;}
        .fb-cta>*{position:relative;z-index:1}
        .fb-cta:hover{filter:brightness(1.08)}
        .fb-cta:disabled{opacity:.7;cursor:not-allowed;animation:none}
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fb-shift{0%{background-position:0% 50%}100%{background-position:300% 50%}}
        @keyframes fb-glow{0%,100%{box-shadow:0 10px 26px -8px rgba(239,68,68,.5),0 0 0 0 rgba(249,115,22,.45)}50%{box-shadow:0 14px 30px -8px rgba(239,68,68,.6),0 0 0 14px rgba(249,115,22,0)}}
        .fb-float{animation:fb-float 6s ease-in-out infinite}
        @keyframes fb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .fb-halo{position:absolute;inset:-10% -10% auto -10%;height:520px;background:radial-gradient(closest-side,rgba(59,130,246,.22),transparent 70%);filter:blur(10px);pointer-events:none}
        .fb-spark{position:absolute;width:4px;height:4px;border-radius:999px;background:rgba(59,130,246,.8);box-shadow:0 0 10px rgba(59,130,246,.8);animation:fb-rise linear infinite}
        @keyframes fb-rise{0%{transform:translateY(20vh) scale(.5);opacity:0}15%{opacity:1}100%{transform:translateY(-90vh) scale(1);opacity:0}}
        .fb-drop { position: absolute; top: -20px; width: 6px; height: 9px; background: rgba(59,130,246,.4); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; filter: blur(.3px); animation: fb-fall linear infinite; pointer-events: none; }
        @keyframes fb-fall { 0%{ transform: translateY(-40px) scale(.8); opacity:0; } 10%{opacity:1;} 100% { transform: translateY(110vh) scale(1); opacity:0; } }
        .fb-marquee{overflow:hidden;border-block:1px solid rgba(59,130,246,.18);background:rgba(59,130,246,.06)}
        .fb-marquee-track{display:flex;gap:44px;width:max-content;animation:fb-marq 26s linear infinite;padding:10px 0}
        @keyframes fb-marq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .fb-input{width:100%;border:1.5px solid rgba(59,130,246,.25);background:#ffffff;color:#0f172a;border-radius:14px;padding:13px 15px;font-size:15px;transition:border-color .2s,box-shadow .2s}
        .fb-input::placeholder{color:#64748b}
        .fb-input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.18)}
        .fb-input-err{border-color:#ef4444 !important}
        .fb-label{display:block;font-size:13px;font-weight:600;color:#2563eb;margin-bottom:6px}
        .fb-err{color:#dc2626;font-size:12px;margin-top:5px;font-weight:500}
        .fb-track{scrollbar-width:none;-ms-overflow-style:none}
        .fb-track::-webkit-scrollbar{display:none}
        @media (prefers-reduced-motion: reduce){.fb-cta,.fb-float,.fb-marquee-track{animation:none !important}}
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[rgba(59,130,246,.18)] bg-[rgba(255,255,255,.88)] backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size={30} textClassName="text-xl text-[#2563eb]" />
          <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb]">
            <Phone className="w-4 h-4" /> {phone}
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="fb-halo" />
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={`drop-${i}`}
            className="fb-drop"
            style={{
              left: `${(i * 7 + 5) % 100}%`,
              animationDuration: `${4 + (i % 5)}s`,
              animationDelay: `${(i % 6) * 0.45}s`,
            }}
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={`spark-${i}`}
            className="fb-spark"
            style={{
              left: `${(i * 6.3 + 4) % 100}%`,
              bottom: "-10px",
              animationDuration: `${7 + (i % 5)}s`,
              animationDelay: `${(i % 7) * 0.7}s`,
            }}
          />
        ))}
        <div className="relative max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div data-reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,130,246,.2)] bg-[rgba(59,130,246,.08)] px-3 py-1 text-xs font-semibold text-[#2563eb]">
              <Sparkles className="w-3.5 h-3.5" /> প্রিমিয়াম কিচেন কালেকশন
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.12]">
              অ্যালুমিনিয়াম ফয়েল <span className="fb-gold-text">জিপলক ব্যাগ</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-[#334155]">
              খাবার থাকবে ফ্রেশ, ফ্রিজ থাকবে গোছানো — এয়ারটাইট, লিকপ্রুফ ও বারবার ব্যবহারযোগ্য।
            </p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Lock, t: "এয়ারটাইট" },
                { icon: Droplets, t: "লিকপ্রুফ" },
                { icon: Snowflake, t: "ফ্রিজার সেফ" },
                { icon: Recycle, t: "রিইউজেবল" },
              ].map((x) => (
                <div key={x.t} className="fb-glass px-3 py-3 text-center">
                  <x.icon className="w-5 h-5 mx-auto mb-1.5 text-[#2563eb]" />
                  <div className="text-xs font-semibold">{x.t}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToForm()}
                className="fb-cta inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold"
              >
                <Package className="w-5 h-5" /> এখনই অর্ডার করুন
              </button>
              <div className="text-sm text-[#334155]">
                শুরু মাত্র <span className="fb-gold-text font-extrabold text-lg">৳{bn(390)}</span> থেকে
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 text-xs text-[#334155]">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#2563eb]" /> ক্যাশ অন ডেলিভারি
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#2563eb]" /> ৭ দিনের রিটার্ন
              </span>
            </div>
          </div>

          <div className="relative" data-reveal>
            <img
              src={imgHero}
              alt="অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগে গোছানো ফ্রিজ"
              className="fb-float w-full rounded-3xl border border-[rgba(59,130,246,.2)] shadow-2xl"
              loading="eager"
              {...({ fetchpriority: "high" } as any)}
              width={1000}
              height={1000}
              decoding="sync"
            />

            <div className="absolute -bottom-4 left-4 fb-glass px-4 py-2 text-sm font-bold text-[#2563eb]">
              <Flame className="inline w-4 h-4 mr-1" /> ৪৫% পর্যন্ত ছাড়
            </div>
          </div>
        </div>
      </section>





      {/* MARQUEE */}
      <div className="fb-marquee">
        <div className="fb-marquee-track text-sm font-semibold text-[#2563eb]">
          {Array.from({ length: 2 }).map((_, r) => (
            <div key={r} className="flex gap-11">
              {["এয়ারটাইট জিপ লক", "১০০% লিকপ্রুফ", "ফ্রিজার সেফ −৬০°C", "২-২.৫ কেজি ধারণক্ষমতা", "বারবার ব্যবহারযোগ্য", "ক্যাশ অন ডেলিভারি"].map(
                (t) => (
                  <span key={t} className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Star className="w-3.5 h-3.5" /> {t}
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>




      {/* VIDEO SECTION */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            {/* Video Side */}
            <div className="w-full md:w-1/2 order-2" data-reveal>
              <div className="relative aspect-[9/16] w-full max-w-[350px] sm:max-w-[450px] mx-auto rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-[#3b82f6]/20">
                {!videoOpen ? (
                  <div 
                    className="absolute inset-0 cursor-pointer group"
                    onClick={() => setVideoOpen(true)}
                  >
                    <img 
                      src="https://i.ytimg.com/vi/7zayAaTPLg8/maxresdefault.jpg" 
                      alt="অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ ভিডিও"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2563eb]">
                        <Play className="w-8 h-8 ml-1 fill-current" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/7zayAaTPLg8?autoplay=1&rel=0"
                    title="YouTube short player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                )}
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 order-1 space-y-8" data-reveal>
              <div className="text-left">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-sm font-bold mb-4">
                  প্রিমিয়াম কোয়ালিটি
                </span>
                <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight">
                  এখন আপনার ফ্রিজ হবে এমন পরিষ্কার ও গুছানো
                </h2>
                <p className="mt-4 text-lg text-[#475569] hidden md:block">
                  বিস্তারিত জানতে ভিডিওটি প্লে করুন অথবা নিচের বৈশিষ্ট্যগুলো দেখে নিন:
                </p>
              </div>

              <div className="grid gap-5 hidden md:block">
                {[
                  "এয়ারটাইট সিল যা খাবারকে রাখে দীর্ঘক্ষণ টাটকা",
                  "১০০% লিকপ্রুফ ডিজাইন, কোনো কিছু চুইয়ে পড়বে না",
                  "ফ্রিজার সেফ, ডিপ ফ্রিজেও ব্যাগ ফাটবে না",
                  "ইকো-ফ্রেন্ডলি ও বারবার ধুয়ে ব্যবহারযোগ্য",
                  "খাবার সংরক্ষণের আধুনিক ও স্বাস্থ্যসম্মত সমাধান",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#3b82f6]/10 flex items-center justify-center group-hover:bg-[#3b82f6]/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-[#3b82f6]" />
                    </div>
                    <span className="text-lg font-medium text-[#1e293b] leading-snug">{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 hidden md:block">
                <button 
                  onClick={() => scrollToForm()}
                  className="fb-cta px-8 py-4 rounded-xl text-lg font-bold shadow-lg flex items-center gap-2"
                >
                  এখনই অর্ডার করুন <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFER / PACKAGES */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center" data-reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(239,68,68,.15)] border border-[rgba(239,68,68,.35)] px-3 py-1 text-xs font-bold text-red-700">
              <Clock className="w-3.5 h-3.5" /> সীমিত সময়ের অফার
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">
              আপনার <span className="fb-gold-text">প্যাকেজ</span> বেছে নিন
            </h2>
            <p className="mt-2 text-[#334155]">যত বেশি পিস, তত বেশি সাশ্রয়</p>
          </div>

          <div className="relative mt-8" data-reveal>
            <button
              type="button"
              aria-label="আগের প্যাকেজ"
              onClick={() => scrollPackages(-1)}
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full fb-glass items-center justify-center text-[#2563eb]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="পরবর্তী প্যাকেজ"
              onClick={() => scrollPackages(1)}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full fb-glass items-center justify-center text-[#2563eb]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="আগের প্যাকেজ"
              onClick={() => scrollPackages(-1)}
              className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center text-[#2563eb]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="পরবর্তী প্যাকেজ"
              onClick={() => scrollPackages(1)}
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center text-[#2563eb]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div
              ref={packageRef}
              className="flex gap-0 overflow-x-auto snap-x snap-mandatory pt-4 pb-4 -mx-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible no-scrollbar"
            >
              {tiers.map((t) => {
                const active = t.pieces === pieces;
                return (
                  <div key={t.pieces} className="w-full flex-shrink-0 snap-center px-4 md:contents">
                    <article
                      onClick={() => selectPackage(t.pieces)}
                      className={`relative cursor-pointer p-5 fb-glass w-full md:w-full ${t.highlight ? "fb-pack-best md:-translate-y-3" : ""} ${active ? "fb-selected" : ""}`}
                    >
                  {t.ribbon ? <span className="fb-ribbon" style={{ background: 'linear-gradient(100deg,#3b82f6,#2563eb)', color: '#fff', boxShadow: '0 8px 20px -8px rgba(37,99,235,.8)' }}>{t.ribbon}</span> : null}
                  <div className="rounded-2xl overflow-hidden bg-[rgba(255,255,255,.04)]">
                    <img
                      src={t.image}
                      alt={`${bn(t.pieces)} পিস ফয়েল জিপলক ব্যাগ প্যাক`}
                      className="w-full h-56 object-contain"
                      loading="lazy"
                      decoding="async"
                      width={1000}
                      height={1000}
                    />

                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold">{bn(t.pieces)} পিস প্যাক</h3>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#2563eb] border border-[rgba(59,130,246,.4)] rounded-full px-2 py-0.5">
                      {t.badge}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-[#2563eb]">৳{bn(t.price)}</span>
                    <span className="text-sm line-through text-[#334155]">৳{bn(t.original)}</span>
                    <span className="ml-auto text-xs font-bold text-emerald-600">
                      ৳{bn(t.saving)} সাশ্রয়
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#334155]">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#2563eb] shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToForm(t.pieces);
                    }}
                    className="fb-cta mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full py-3 font-bold"
                  >
                    অর্ডার করুন <ArrowRight className="w-4 h-4" />
                    </button>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
          <div className="mt-2 flex justify-center gap-1.5 text-xs text-[#2563eb] md:hidden">
            <span className="inline-flex items-center gap-1 bg-[rgba(59,130,246,.1)] border border-[rgba(59,130,246,.2)] px-3 py-1 rounded-full">
              ← স্লাইড করুন →
            </span>
          </div>
        </div>
      </section>

      {/* PROBLEM VS SOLUTION */}
      <section className="py-14 md:py-20 bg-[#f0f9ff] border-y border-[rgba(59,130,246,.15)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold" data-reveal>
            এখন আপনার ফ্রিজ হবে এমন পরিষ্কার ও গুছানো
          </h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6 items-start">
            <div className="fb-glass p-5" data-reveal>
              <img
                src={imgBefore}
                alt="সাধারণ পলিব্যাগে খাবার নষ্ট হওয়ার সমস্যা"
                className="w-full rounded-2xl"
                loading="lazy"
                decoding="async"
                width={1000}
                height={1000}
              />

              <h3 className="mt-4 text-xl font-extrabold text-red-700">সাধারণ পলিব্যাগ</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#334155]">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="fb-glass fb-pack-best p-5" data-reveal style={{ transitionDelay: "120ms" }}>
              <img
                src={imgFeatures}
                alt="Trezo ফয়েল জিপলক ব্যাগের ফিচার"
                className="w-full rounded-2xl"
                loading="lazy"
                decoding="async"
                width={1000}
                height={1000}
              />

              <h3 className="mt-4 text-xl font-extrabold fb-gold-text">কেন সবাই এই Zip Lock Bag ব্যবহার করছে?</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#334155]">
                {solutions.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-20">

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center" data-reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              কেন এটি <span className="fb-gold-text">প্রিমিয়াম</span>
            </h2>
            <p className="mt-2 text-[#334155]">প্রতিটি ব্যাগেই আছে ৬টি বড় সুবিধা</p>
          </div>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {features.map((f, i) => (
              <div key={f.title} className="fb-glass p-5" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="w-11 h-11 rounded-xl bg-[rgba(59,130,246,.1)] border border-[rgba(59,130,246,.2)] flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-[#2563eb]" />
                </div>
                <h3 className="mt-3 font-bold text-lg">{f.title}</h3>
                <p className="mt-1.5 text-sm text-[#334155] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-14 md:py-20 bg-[#f0f9ff] border-y border-[rgba(59,130,246,.15)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center" data-reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,130,246,.2)] px-3 py-1 text-xs font-bold text-[#2563eb]">
              <Award className="w-3.5 h-3.5 text-[#2563eb]" /> কাস্টমার রিভিউ
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">গ্রাহকরা কী বলছেন</h2>
          </div>
          <div className="relative mt-8" data-reveal>
            <button
              type="button"
              aria-label="আগের রিভিউ"
              onClick={() => scrollReviews(-1)}
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full fb-glass items-center justify-center text-[#2563eb]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="পরবর্তী রিভিউ"
              onClick={() => scrollReviews(1)}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full fb-glass items-center justify-center text-[#2563eb]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div ref={reviewRef} className="fb-track flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4">
              {reviews.map((r) => (
                <article
                  key={r.name}
                  data-review-card
                  className="fb-glass p-5 snap-start shrink-0 w-[85%] sm:w-[46%] lg:w-[31%]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#bfdbfe] to-[#3b82f6] text-white font-extrabold flex items-center justify-center text-lg">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{r.name}</div>
                      <div className="text-xs text-[#334155]">{r.city}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 my-2">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        className={`w-4 h-4 ${k < r.rating ? "fill-[#3b82f6] text-[#2563eb]" : "text-[#cbd5e1]"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed">"{r.text}"</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ভেরিফায়েড ক্রেতা
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ORDER FORM */}
      <section ref={formRef} className="py-16 md:py-20 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center" data-reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(59,130,246,.08)] border border-[rgba(59,130,246,.25)] px-3 py-1 text-xs font-bold text-[#2563eb]">
              <Gift className="w-3.5 h-3.5 text-[#2563eb]" /> ক্যাশ অন ডেলিভারি
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">
              অর্ডার <span className="fb-gold-text">ফর্ম</span>
            </h2>
            <p className="mt-2 text-[#334155] text-sm">নিচের তথ্যগুলো দিন — আমরা কল করে অর্ডারটি নিশ্চিত করব।</p>
          </div>

          <form onSubmit={handleSubmit} className="fb-glass mt-8 p-5 md:p-7" data-reveal>
            <div className="grid sm:grid-cols-3 gap-4">
              {tiers.map((t, i) => {
                const active = t.pieces === pieces;
                return (
                  <article
                    key={t.pieces}
                    onClick={() => selectPackage(t.pieces)}
                    className={`relative cursor-pointer p-4 rounded-2xl border transition ${
                      active
                        ? "border-[#3b82f6] bg-[rgba(59,130,246,.12)] fb-selected"
                        : "border-[rgba(59,130,246,.2)] bg-white hover:border-[rgba(59,130,246,.4)]"
                    } ${t.highlight ? "md:-translate-y-2" : ""}`}
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    {t.ribbon ? <span className="fb-ribbon" style={{ background: 'linear-gradient(100deg,#3b82f6,#2563eb)', color: '#fff', boxShadow: '0 8px 20px -8px rgba(37,99,235,.8)' }}>{t.ribbon}</span> : null}
                    <div className="rounded-xl overflow-hidden bg-[rgba(255,255,255,.04)]">
                      <img
                        src={t.image}
                        alt={`${bn(t.pieces)} পিস ফয়েল জিপলক ব্যাগ প্যাক`}
                        className="w-full h-36 object-contain"
                        loading="lazy"
                        width={600}
                        height={600}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold">{bn(t.pieces)} পিস</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb] border border-[rgba(59,130,246,.3)] rounded-full px-2 py-0.5">
                        {t.badge}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xl font-extrabold text-[#2563eb]">৳{bn(t.price)}</span>
                      <span className="text-xs line-through text-[#334155]">৳{bn(t.original)}</span>
                      <span className="text-[10px] font-bold text-emerald-600">৳{bn(t.saving)} সাশ্রয়</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-[#334155]">
                      {t.perks.map((p) => (
                        <li key={p} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[#2563eb] shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="fb-label" htmlFor="fb-name">
                  আপনার নাম
                </label>
                <input
                  id="fb-name"
                  className={`fb-input ${errors.name ? "fb-input-err" : ""}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={maybeFireCheckout}
                  placeholder="যেমন: সাদিয়া ইসলাম"
                />
                {errors.name ? <p className="fb-err">{errors.name}</p> : null}
              </div>
              <div>
                <label className="fb-label" htmlFor="fb-mobile">
                  মোবাইল নম্বর
                </label>
                <input
                  id="fb-mobile"
                  inputMode="numeric"
                  className={`fb-input ${errors.mobile ? "fb-input-err" : ""}`}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onFocus={maybeFireCheckout}
                  placeholder="০১৭XXXXXXXX"
                />
                {errors.mobile ? <p className="fb-err">{errors.mobile}</p> : null}
              </div>
              <div>
                <label className="fb-label" htmlFor="fb-address">
                  সম্পূর্ণ ঠিকানা
                </label>
                <textarea
                  id="fb-address"
                  rows={3}
                  className={`fb-input ${errors.address ? "fb-input-err" : ""}`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={maybeFireCheckout}
                  placeholder="গ্রাম/এলাকা, থানা, জেলা"
                />
                {errors.address ? <p className="fb-err">{errors.address}</p> : null}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className="fb-label">ডেলিভারি এলাকা</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["inside", "ঢাকার ভেতরে ফ্রি ডেলিভারি"],
                        ["outside", "ঢাকার বাইরে ফ্রি ডেলিভারি"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDeliveryArea(key)}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                          deliveryArea === key
                            ? "border-[#3b82f6] bg-[rgba(59,130,246,.12)] text-[#2563eb]"
                            : "border-[rgba(59,130,246,.2)] bg-white text-[#334155]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="fb-label">পরিমাণ</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="কমান"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-full border border-[rgba(59,130,246,.35)] text-[#2563eb] font-bold bg-white"
                    >
                      −
                    </button>
                    <span className="text-lg font-extrabold w-8 text-center">{bn(quantity)}</span>
                    <button
                      type="button"
                      aria-label="বাড়ান"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      className="w-10 h-10 rounded-full border border-[rgba(59,130,246,.35)] text-[#2563eb] font-bold bg-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[rgba(59,130,246,.2)] bg-[rgba(59,130,246,.06)] p-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-[#334155]">
                  {bn(selectedTier.pieces)} পিস প্যাক × {bn(quantity)}
                </span>
                <span className="font-semibold">৳{bn(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#334155]">ডেলিভারি চার্জ</span>
                <span className="font-semibold">৳{bn(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-600">
                <span>আপনার সাশ্রয়</span>
                <span className="font-semibold">৳{bn(saved)}</span>
              </div>
              <div className="mt-2 border-t border-[rgba(59,130,246,.2)] pt-2 flex justify-between text-lg">
                <span className="font-bold">সর্বমোট</span>
                <span className="font-extrabold text-[#2563eb]">৳{bn(grandTotal)}</span>
              </div>
            </div>

            {errors.submit ? (
              <p className="fb-err mt-3 text-center text-sm">{errors.submit}</p>
            ) : null}

            <button type="submit" disabled={submitting} className="fb-cta mt-5 w-full rounded-full py-4 font-extrabold text-lg">
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> পাঠানো হচ্ছে…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Package className="w-5 h-5" /> অর্ডার কনফার্ম করুন
                </span>
              )}
            </button>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[12px] text-[#334155] text-center">
              <span className="inline-flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#2563eb]" /> ১০০% অরিজিনাল
              </span>
              <span className="inline-flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#2563eb]" /> দ্রুত ডেলিভারি
              </span>
              <span className="inline-flex flex-col items-center gap-1">
                <Headphones className="w-4 h-4 text-[#2563eb]" /> ২৪/৭ সাপোর্ট
              </span>
            </div>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20 bg-[#f0f9ff] border-t border-[rgba(59,130,246,.15)]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold" data-reveal>
            সাধারণ <span className="fb-gold-text">প্রশ্ন</span>
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <div key={f.q} className="fb-glass overflow-hidden" data-reveal>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-semibold"
                >
                  <span className="inline-flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#2563eb] shrink-0" /> {f.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-[#2563eb] transition ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i ? <p className="px-5 pb-4 text-sm text-[#334155] leading-relaxed">{f.a}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-[rgba(59,130,246,.18)] bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={28} textClassName="text-lg text-[#2563eb]" />
          <div className="flex items-center gap-3 text-sm">
            <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 text-[#2563eb]">
              <Phone className="w-4 h-4" /> {phone}
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600"
            >
              <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ
            </a>
          </div>
          <p className="text-xs text-[#334155]">© {bn(new Date().getFullYear())} Trezo — সর্বস্বত্ব সংরক্ষিত</p>
        </div>
        <LpDeveloperFooter className="mt-6 pt-4 border-t border-[rgba(59,130,246,.12)]" />
      </footer>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-[rgba(59,130,246,.2)] bg-[rgba(255,255,255,.95)] backdrop-blur px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="text-sm">
            <div className="text-[12px] text-[#334155]">সর্বমোট</div>
            <div className="font-extrabold text-[#2563eb]">৳{bn(grandTotal)}</div>
          </div>
          <button
            type="button"
            onClick={handleFloatingCta}
            disabled={submitting}
            className="fb-cta flex-1 rounded-full py-3 font-bold text-sm disabled:opacity-70 flex items-center justify-center gap-1.5"
          >
            <Flame className="w-4 h-4" />{" "}
            {submitting ? "অর্ডার হচ্ছে..." : isFormFilled() ? "অর্ডার কনফার্ম করুন" : "অর্ডার করুন"}
          </button>
        </div>
      </div>
      <div className="h-16" />
    </div>
  );
}
