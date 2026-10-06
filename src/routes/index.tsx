import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Droplets } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { makeOrderId } from "@/lib/orders";
import { bnOrderError } from "@/lib/bn-errors";
import { getFbCookies, initMetaPixel, newEventId, pixelTrack } from "@/lib/pixel";
import { trackFunnelEvent } from "@/lib/tracking.functions";
import { detectTrafficSource } from "@/lib/traffic-source";
import { Logo } from "@/components/trezo/Logo";
import { LpDeveloperFooter } from "@/components/landing/LpDeveloperFooter";

import { TapFilterHero } from "@/components/landing/tap-filter/TapFilterHero";
import { TapFilterComparison } from "@/components/landing/tap-filter/TapFilterComparison";
import { TapFilterPackages } from "@/components/landing/tap-filter/TapFilterPackages";
import { TapFilterReviews } from "@/components/landing/tap-filter/TapFilterReviews";
import { TapFilterFeatures } from "@/components/landing/tap-filter/TapFilterFeatures";
import { TapFilterCheckoutForm } from "@/components/landing/tap-filter/TapFilterCheckoutForm";
import { TapFilterFaq } from "@/components/landing/tap-filter/TapFilterFaq";
import { TapFilterStickyCta } from "@/components/landing/tap-filter/TapFilterStickyCta";

import {
  benefits,
  DHAKA,
  faqs,
  imgAfter,
  imgBefore,
  phone,
  reviews,
  tiers,
  trustItems,
  waHref,
} from "@/data/landing/tap-filter.data";

import { Phone } from "lucide-react";

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

const PHONE_RE = /^01[3-9]\d{8}$/;

function TapFilterLanding() {
  useReveal();

  const navigate = useNavigate();
  const sendFunnel = useServerFn(trackFunnelEvent);

  useEffect(() => {
    detectTrafficSource();
  }, []);
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
  const checkoutFiredRef = useRef(false);

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

  const selectPackage = (p: number) => {
    setTierPieces(p);
    const idx = tiers.findIndex((t) => t.pieces === p);
    if (idx !== -1) scrollTierTo(idx);
  };

  const scrollToForm = (p?: number) => {
    if (p) selectPackage(p);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const validate = () => {
    const e: { name?: string; mobile?: string; address?: string } = {};
    if (!name.trim()) e.name = "আপনার নামটি লিখুন";
    else if (name.trim().length < 2) e.name = "নামটি অন্তত ২ অক্ষরের হতে হবে";
    const m = mobile.replace(/\D/g, "");
    if (!m) {
      e.mobile = "মোবাইল নম্বরটি লিখুন";
    } else if (!m.startsWith("01")) {
      e.mobile = "নম্বরটি অবশ্যই 01 দিয়ে শুরু হতে হবে";
    } else if (m.length < 11) {
      e.mobile = "১১ ডিজিটের সম্পূর্ণ নম্বর দিন (যেমন: 01712345678)";
    } else if (!PHONE_RE.test(m)) {
      e.mobile = "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন";
    }
    if (!address.trim()) e.address = "ডেলিভারির ঠিকানাটি লিখুন";
    else if (address.trim().length < 5) e.address = "সম্পূর্ণ ঠিকানা লিখুন — গ্রাম/এলাকা, থানা ও জেলা";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleMobileChange = (val: string) => {
    let digits = val.replace(/\D/g, "");

    // Strip +880 or 880 prefix if pasted
    if (digits.startsWith("880") && digits.length > 10) {
      digits = digits.slice(2);
    }

    // Strict real-time 01 prefix enforcement
    if (digits.length > 0) {
      if (digits.startsWith("1") && !digits.startsWith("01")) {
        digits = "0" + digits;
      } else if (!digits.startsWith("0")) {
        digits = "01" + digits;
      } else if (digits.length >= 2 && !digits.startsWith("01")) {
        digits = "01" + digits.slice(2);
      }
    }

    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    setMobile(digits);
    if (errors.mobile) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.mobile;
        return next;
      });
    }
  };

  const maybeFireCheckout = () => {
    if (checkoutFiredRef.current) return;
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
        traffic_source: detectTrafficSource(),
        delivery_area: deliveryArea,
        delivery_charge: deliveryCharge,
        subtotal,
        total_amount: grandTotal,
      });
      if (error) throw error;

      await supabase.from("order_items").insert({
        order_id: rowId,
        product_name: `Trezo ট্যাপ ফিল্টার — ${selectedTier.pieces} পিস প্যাকেজ`,
        product_image: selectedTier.image || "/images/pack-50.webp",
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

  const isFormFilled = () => {
    const m = mobile.replace(/\D/g, "");
    return name.trim().length >= 2 && PHONE_RE.test(m) && address.trim().length >= 5;
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
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-1 sm:gap-3">
          <Logo size={30} textClassName="text-xl text-primary-deep" />
          <div className="flex flex-col items-center text-center justify-center min-w-0 flex-1 px-1">
            <div className="inline-flex flex-col items-center bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-200/80 px-3 sm:px-4 py-1 rounded-xl shadow-xs">
              <span className="text-[12px] sm:text-[14px] font-black text-slate-900 tracking-wide truncate max-w-[150px] xs:max-w-[240px] sm:max-w-none">
                ওয়াটার ফসেট ট্যাপ ফিল্টার
              </span>
              <span className="text-[10.5px] sm:text-[12px] font-extrabold text-blue-800 tracking-tight whitespace-nowrap mt-0.5 inline-flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-blue-600 inline" />
                <span>১০০% বিশুদ্ধ ও জীবাণুমুক্ত পানি</span>
              </span>
            </div>
          </div>
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-deep bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-100 shrink-0"
          >
            <Phone className="w-4 h-4 text-primary" /> <span className="hidden xs:inline">{phone}</span>
          </a>
        </div>
      </header>

      {/* HERO */}
      <TapFilterHero trustItems={trustItems} scrollToForm={() => scrollToForm()} />

      {/* BEFORE / AFTER COMPARISON & GUARANTEE */}
      <TapFilterComparison
        imgBefore={imgBefore}
        imgAfter={imgAfter}
        scrollToForm={() => scrollToForm()}
      />

      {/* REVIEWS */}
      <TapFilterReviews reviews={reviews} />

      {/* PRICING PACKAGES */}
      <TapFilterPackages
        tiers={tiers}
        tierScrollRef={tierScrollRef}
        activeTierIdx={activeTierIdx}
        scrollTierTo={scrollTierTo}
        scrollToForm={scrollToForm}
      />

      {/* ORDER FORM */}
      <TapFilterCheckoutForm
        formRef={formRef}
        tiers={tiers}
        tierPieces={tierPieces}
        selectPackage={selectPackage}
        name={name}
        setName={setName}
        mobile={mobile}
        handleMobileChange={handleMobileChange}
        address={address}
        setAddress={setAddress}
        deliveryArea={deliveryArea}
        setDeliveryArea={setDeliveryArea}
        quantity={quantity}
        setQuantity={setQuantity}
        subtotal={subtotal}
        deliveryCharge={deliveryCharge}
        grandTotal={grandTotal}
        submitting={submitting}
        errors={errors}
        success={success}
        setSuccess={setSuccess}
        handleSubmit={handleSubmit}
        maybeFireCheckout={maybeFireCheckout}
        DHAKA={DHAKA}
      />

      {/* BENEFITS & HOW TO USE */}
      <TapFilterFeatures benefits={benefits} />

      {/* FAQ & TRUST STRIP */}
      <TapFilterFaq faqs={faqs} scrollToForm={() => scrollToForm()} />

      {/* FOOTER */}
      <div className="pb-32 md:pb-28 text-center text-xs">
        <Logo size={34} textClassName="text-lg text-primary-deep" className="mb-3" />
        <div className="mb-2" />
        <LpDeveloperFooter />
      </div>

      {/* STICKY BOTTOM CTA */}
      <TapFilterStickyCta
        phone={phone}
        waHref={waHref}
        submitting={submitting}
        isFormFilled={isFormFilled()}
        handleFloatingCta={handleFloatingCta}
      />
    </div>
  );
}
