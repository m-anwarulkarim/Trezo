import { ChevronDown, Droplets, HelpCircle, Package } from "lucide-react";
import { bn } from "@/lib/bn";

export type TapFilterFaqItem = {
  q: string;
  a: string;
};

export function TapFilterFaq({
  faqs,
  scrollToForm,
}: {
  faqs: TapFilterFaqItem[];
  scrollToForm: () => void;
}) {
  return (
    <>
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" /> সাধারণ প্রশ্ন
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-primary-deep">আপনার যা জানা দরকার</h2>
            <p className="mt-2 text-slate-600">অর্ডার করার আগে কমন প্রশ্নগুলোর উত্তর দেখে নিন</p>
          </div>

          <div className="space-y-3">
            {faqs.map((item, i) => (
              <details
                key={i}
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
                className="group rounded-2xl bg-white ring-1 ring-primary/20 hover:ring-primary/30 shadow-sm hover:shadow-md transition-all open:ring-primary open:shadow-md"
              >
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-5 select-none">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary-light text-white font-bold text-sm flex items-center justify-center shadow">
                      {bn(i + 1)}
                    </span>
                    <span className="font-bold text-primary-deep text-sm md:text-base pt-1">{item.q}</span>
                  </div>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center group-open:bg-primary/50 group-open:text-white transition-all group-open:rotate-180">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </summary>
                <div className="px-5 pb-5 pl-16 -mt-1">
                  <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed border-l-2 border-primary/20 pl-4">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-600" data-reveal>
            আরও প্রশ্ন?{" "}
            <a href="tel:01794821159" className="font-bold text-primary hover:underline">
              কল করুন — 01794821159
            </a>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4" data-reveal>
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-deep via-primary-light to-primary-deep text-white p-8 md:p-10 text-center shadow-2xl">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 60%, #fff 0, transparent 40%)",
              }}
            />
            <Droplets className="w-10 h-10 mx-auto mb-3" />
            <h3 className="text-2xl md:text-3xl font-extrabold">স্বাস্থ্যকর জীবন শুরু হোক বিশুদ্ধ পানি দিয়ে</h3>
            <p className="mt-2 text-primary-foreground/90 text-sm md:text-base">
              প্রতিদিনের রান্না, পান আর ব্যবহার — সব কিছুতে নিরাপদ পানি নিশ্চিত করুন।
            </p>
            <button
              type="button"
              onClick={scrollToForm}
              className="tf-cta mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold"
            >
              <Package className="w-5 h-5" /> এখনই অর্ডার করুন
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
