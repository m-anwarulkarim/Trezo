import { Award, CheckCircle2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { RefObject } from "react";

export type FoilBagReviewItem = {
  name: string;
  city: string;
  rating: number;
  text: string;
};

export function FoilBagReviews({
  reviews,
  reviewRef,
  scrollReviews,
}: {
  reviews: FoilBagReviewItem[];
  reviewRef: RefObject<HTMLDivElement | null>;
  scrollReviews: (dir: number) => void;
}) {
  return (
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
  );
}
