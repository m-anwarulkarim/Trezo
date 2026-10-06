import { Award, CheckCircle2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef } from "react";

export type TapFilterReview = {
  name: string;
  city: string;
  rating: number;
  text: string;
};

export function TapFilterReviews({ reviews }: { reviews: TapFilterReview[] }) {
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
