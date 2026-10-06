import { Droplets, Flame, Lock, Package, Recycle, RotateCcw, Snowflake, Sparkles, Truck } from "lucide-react";
import { bn } from "@/lib/bn";

export function FoilBagHero({
  imgHero,
  scrollToForm,
}: {
  imgHero: string;
  scrollToForm: () => void;
}) {
  return (
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
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,130,246,.25)] bg-[rgba(59,130,246,.08)] px-3 py-1 text-xs font-bold text-[#2563eb]">
              <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" /> প্রিমিয়াম কিচেন কালেকশন
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-800 shadow-sm">
              🇨🇳 Made In China অরিজিনাল
            </span>
          </div>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-[1.12]">
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

          <div className="absolute top-4 right-4 fb-glass px-3.5 py-1.5 text-xs font-extrabold text-amber-800 bg-white/95 border border-amber-300 shadow-md rounded-full">
            🇨🇳 Made In China (অরিজিনাল)
          </div>

          <div className="absolute -bottom-4 left-4 fb-glass px-4 py-2 text-sm font-bold text-[#2563eb]">
            <Flame className="inline w-4 h-4 mr-1" /> ৪৫% পর্যন্ত ছাড়
          </div>
        </div>
      </div>
    </section>
  );
}
