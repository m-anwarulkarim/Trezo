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

import { FoilBagHero } from "@/components/landing/foil-bag/FoilBagHero";
import { FoilBagVideoSection } from "@/components/landing/foil-bag/FoilBagVideoSection";
import { FoilBagPackages } from "@/components/landing/foil-bag/FoilBagPackages";
import { FoilBagComparison } from "@/components/landing/foil-bag/FoilBagComparison";
import { FoilBagFeatures } from "@/components/landing/foil-bag/FoilBagFeatures";
import { FoilBagReviews } from "@/components/landing/foil-bag/FoilBagReviews";
import { FoilBagCheckoutForm } from "@/components/landing/foil-bag/FoilBagCheckoutForm";
import { FoilBagFaq } from "@/components/landing/foil-bag/FoilBagFaq";
import { FoilBagStickyCta } from "@/components/landing/foil-bag/FoilBagStickyCta";

import {
  DHAKA,
  faqs,
  features,
  imgBefore,
  imgFeatures,
  imgHero,
  phone,
  problems,
  reviews,
  solutions,
  tiers,
  waHref,
} from "@/data/landing/foil-bag.data";

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

const PHONE_RE = /^01[3-9]\d{8}$/;

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
        .fb-cta:hover{filter:brightness(1.06);}
        @keyframes fb-shift{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
        @keyframes fb-glow{0%,100%{box-shadow:0 10px 26px -8px rgba(239,68,68,.55);}50%{box-shadow:0 16px 36px -4px rgba(249,115,22,.75);}}
        .fb-halo{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:700px;height:400px;background:radial-gradient(ellipse at center,rgba(59,130,246,.15),transparent 70%);pointer-events:none;}
        .fb-drop{position:absolute;width:2px;height:40px;background:linear-gradient(180deg,transparent,rgba(59,130,246,.3),transparent);animation:fb-rain 5s linear infinite;pointer-events:none;}
        @keyframes fb-rain{0%{transform:translateY(-40px);opacity:0;}20%{opacity:1;}80%{opacity:1;}100%{transform:translateY(900px);opacity:0;}}
        .fb-spark{position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(59,130,246,.6);box-shadow:0 0 10px rgba(59,130,246,.8);animation:fb-float 8s ease-in-out infinite;pointer-events:none;}
        @keyframes fb-float{0%{transform:translateY(0) scale(1);opacity:0;}20%{opacity:1;}80%{opacity:1;}100%{transform:translateY(-600px) scale(1.8);opacity:0;}}
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .fb-china-badge{
          display:inline-flex;align-items:center;gap:6px;
          padding:5px 14px;border-radius:999px;
          background:linear-gradient(135deg,#c8102e 0%,#de1c31 40%,#c8102e 100%);
          background-size:200% 100%;
          color:#fff;font-weight:800;font-size:13px;letter-spacing:.02em;
          border:1.5px solid rgba(255,255,255,.35);
          box-shadow:0 4px 18px -4px rgba(200,16,46,.6),0 0 0 0 rgba(200,16,46,.4);
          animation:fb-china-shine 3s linear infinite,fb-china-pulse 2.4s ease-in-out infinite;
          position:relative;overflow:hidden;
          text-shadow:0 1px 3px rgba(0,0,0,.25);
        }
        .fb-china-badge::after{
          content:"";
          position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%);
          background-size:200% 100%;
          animation:fb-china-shimmer 2.2s linear infinite;
        }
        @keyframes fb-china-shine{
          0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}
        }
        @keyframes fb-china-shimmer{
          0%{background-position:200% 0;}100%{background-position:-200% 0;}
        }
        @keyframes fb-china-pulse{
          0%,100%{box-shadow:0 4px 18px -4px rgba(200,16,46,.6),0 0 0 0 rgba(200,16,46,.4);}
          50%{box-shadow:0 6px 24px -2px rgba(200,16,46,.8),0 0 0 6px rgba(200,16,46,.08);}
        }
      `}</style>

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[rgba(59,130,246,.15)] bg-[rgba(255,255,255,.95)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-1 sm:gap-3">
          <Logo />
          <div className="flex flex-col items-center text-center justify-center min-w-0 flex-1 px-1">
            <div className="inline-flex flex-col items-center bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/80 px-2.5 sm:px-4 py-1 rounded-xl shadow-xs">
              <span className="text-[11px] sm:text-[13px] font-black text-slate-900 tracking-wide truncate max-w-[140px] xs:max-w-[210px] sm:max-w-none">
                অ্যালুমিনিয়াম ফয়েল ব্যাগ
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-bold text-blue-700 tracking-tight whitespace-nowrap">
                🛡️ এয়ারটাইট · লিকপ্রুফ · রিইউজেবল
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollToForm()}
            className="fb-cta px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-xs md:text-sm shadow-md whitespace-nowrap shrink-0"
          >
            অর্ডার করুন
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <FoilBagHero imgHero={imgHero} scrollToForm={() => scrollToForm(20)} />

      {/* Video Section */}
      <FoilBagVideoSection scrollToForm={() => scrollToForm(20)} />

      {/* Package Selection Section */}
      <FoilBagPackages
        tiers={tiers}
        pieces={pieces}
        packageRef={packageRef}
        selectPackage={selectPackage}
        scrollToForm={scrollToForm}
        scrollPackages={scrollPackages}
      />

      {/* Comparison Section */}
      <FoilBagComparison
        imgBefore={imgBefore}
        imgFeatures={imgFeatures}
        problems={problems}
        solutions={solutions}
      />

      {/* Features Grid */}
      <FoilBagFeatures features={features} />

      {/* Customer Reviews */}
      <FoilBagReviews
        reviews={reviews}
        reviewRef={reviewRef}
        scrollReviews={scrollReviews}
      />

      {/* Order Form Section */}
      <FoilBagCheckoutForm
        formRef={formRef}
        tiers={tiers}
        pieces={pieces}
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
        saved={saved}
        grandTotal={grandTotal}
        submitting={submitting}
        errors={errors}
        handleSubmit={handleSubmit}
        maybeFireCheckout={maybeFireCheckout}
      />

      {/* FAQ Section */}
      <FoilBagFaq faqs={faqs} phone={phone} waHref={waHref} />

      {/* Developer Footer */}
      <div className="pb-32 md:pb-28 text-center text-xs">
        <Logo size={34} textClassName="text-lg text-slate-800" className="mb-3" />
        <div className="mb-2" />
        <LpDeveloperFooter />
      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <FoilBagStickyCta
        grandTotal={grandTotal}
        submitting={submitting}
        isFormFilled={isFormFilled()}
        handleFloatingCta={handleFloatingCta}
      />
    </div>
  );
}
