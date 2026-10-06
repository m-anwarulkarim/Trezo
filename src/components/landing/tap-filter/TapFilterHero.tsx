import { Droplets, Flame, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { useState } from "react";
import { Play } from "lucide-react";

export type TrustItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export function TapFilterHero({
  trustItems,
  scrollToForm,
}: {
  trustItems: TrustItem[];
  scrollToForm: () => void;
}) {
  const [droplets] = useState(() => Array.from({ length: 14 }, (_, i) => i));

  return (
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
            onClick={scrollToForm}
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
