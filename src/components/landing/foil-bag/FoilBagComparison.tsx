import { CheckCircle2 } from "lucide-react";

export function FoilBagComparison({
  imgBefore,
  imgFeatures,
  problems,
  solutions,
}: {
  imgBefore: string;
  imgFeatures: string;
  problems: string[];
  solutions: string[];
}) {
  return (
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
  );
}
