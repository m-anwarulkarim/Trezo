import { CheckCircle2, ChevronLeft, ChevronRight, Flame, Gift } from "lucide-react";
import type { RefObject } from "react";

export type TapFilterTier = {
  pieces: number;
  price: number;
  freebies: string[];
  badge?: string;
  highlight?: boolean;
  ribbon?: string;
  image?: string;
  alt?: string;
};

export function TapFilterPackages({
  tiers,
  tierScrollRef,
  activeTierIdx,
  scrollTierTo,
  scrollToForm,
}: {
  tiers: TapFilterTier[];
  tierScrollRef: RefObject<HTMLDivElement | null>;
  activeTierIdx: number;
  scrollTierTo: (idx: number) => void;
  scrollToForm: (pieces?: number) => void;
}) {
  return (
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
  );
}
