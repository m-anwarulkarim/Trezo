import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { RefObject } from "react";
import { bn } from "@/lib/bn";

export type FoilBagTier = {
  pieces: number;
  badge: string;
  price: number;
  original: number;
  saving: number;
  perks: string[];
  image: string;
  highlight?: boolean;
  ribbon?: string;
};

export function FoilBagPackages({
  tiers,
  pieces,
  packageRef,
  selectPackage,
  scrollToForm,
  scrollPackages,
}: {
  tiers: FoilBagTier[];
  pieces: number;
  packageRef: RefObject<HTMLDivElement | null>;
  selectPackage: (p: number) => void;
  scrollToForm: (p?: number) => void;
  scrollPackages: (dir: number) => void;
}) {
  return (
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
                    {t.ribbon ? (
                      <span
                        className="fb-ribbon"
                        style={{
                          background: "linear-gradient(100deg,#3b82f6,#2563eb)",
                          color: "#fff",
                          boxShadow: "0 8px 20px -8px rgba(37,99,235,.8)",
                        }}
                      >
                        {t.ribbon}
                      </span>
                    ) : null}
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
                    <div className="mt-2 flex items-baseline justify-between gap-1">
                      <span className="text-xl sm:text-3xl font-extrabold text-[#2563eb] shrink-0 whitespace-nowrap">৳{bn(t.price)}</span>
                      <span className="text-[11px] sm:text-sm line-through text-[#64748b] shrink-0 whitespace-nowrap">৳{bn(t.original)}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0 whitespace-nowrap">
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
  );
}
