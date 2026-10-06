import { ArrowRight, BadgeCheck, CheckCircle2, Flame, Frown, ShieldCheck, Smile, Sparkles } from "lucide-react";

export function TapFilterComparison({
  imgBefore,
  imgAfter,
  scrollToForm,
}: {
  imgBefore: { url: string; w: number; h: number };
  imgAfter: { url: string; w: number; h: number };
  scrollToForm: () => void;
}) {
  return (
    <section className="py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10" data-reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-deep">পার্থক্য দেখুন নিজেই</h2>
          <p className="mt-2 text-slate-600">সাধারণ ট্যাপের পানি বনাম Water faucet tap filter লাগানোর পরের পানি</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 items-stretch relative">
          <div
            data-reveal
            className="rounded-2xl overflow-hidden bg-gradient-to-b from-amber-50 to-white ring-1 ring-amber-200 shadow-sm"
          >
            <div className="bg-amber-500/90 text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">সাধারণ ট্যাপ (Before)</span>
              <Frown className="w-5 h-5" />
            </div>
            <div className="p-6">
              <div className="relative aspect-square rounded-xl ring-1 ring-amber-300 overflow-hidden mb-5 group bg-white">
                <img
                  src={imgBefore.url}
                  alt="ফিল্টার ছাড়া কলের ঘোলা ও ময়লা পানি"
                  width={imgBefore.w}
                  height={imgBefore.h}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-amber-600/90 px-2 py-1 rounded-md backdrop-blur">
                  ঘোলা ও ময়লা পানি
                </span>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {[
                  "দৃশ্যমান ময়লা, বালু ও মরিচা",
                  "দুর্গন্ধ ও অস্বাস্থ্যকর স্বাদ",
                  "চামড়া ও চুলের ক্ষতি",
                  "রান্নার পাত্রে দাগ পড়ে",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white shadow-lg ring-4 ring-primary/20 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div
            data-reveal
            style={{ transitionDelay: "120ms" }}
            className="rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-white ring-1 ring-primary/20 shadow-sm"
          >
            <div className="bg-gradient-to-r from-primary/50 to-primary-light text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Water faucet tap filter (After)</span>
              <Smile className="w-5 h-5" />
            </div>
            <div className="p-6">
              <div className="relative aspect-square rounded-xl ring-1 ring-primary/30 overflow-hidden mb-5 group bg-white">
                <img
                  src={imgAfter.url}
                  alt="ওয়াটার ট্যাপ ফিল্টার ব্যবহারে বিশুদ্ধ ও নিরাপদ পানি"
                  width={imgAfter.w}
                  height={imgAfter.h}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/30 via-transparent to-transparent" />
                <Sparkles className="absolute top-3 right-3 w-5 h-5 text-white drop-shadow animate-pulse" />
                <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-primary-deep/90 px-2 py-1 rounded-md backdrop-blur">
                  স্বচ্ছ ও বিশুদ্ধ পানি
                </span>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {[
                  "সম্পূর্ণ পরিষ্কার ও স্বচ্ছ পানি",
                  "কোনো দুর্গন্ধ বা বাজে স্বাদ নেই",
                  "চামড়া ও চুলের জন্য নিরাপদ",
                  "রান্না ও পান — সবকিছুতেই ভালো",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center" data-reveal>
          <button
            type="button"
            onClick={scrollToForm}
            className="tf-cta inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-base"
          >
            <Flame className="w-5 h-5" /> এখনই অর্ডার করুন
          </button>
        </div>

        {/* GUARANTEE BADGE */}
        <div className="mt-12" data-reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-deep via-primary to-primary-light text-white p-6 md:p-8 shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-light/20 blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-5 md:gap-7">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white text-primary flex items-center justify-center shadow-lg ring-4 ring-white/40 tf-guarantee-pulse">
                  <ShieldCheck className="w-12 h-12 md:w-14 md:h-14" />
                </div>
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                  100%
                </span>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">
                  <BadgeCheck className="w-3.5 h-3.5" /> আমাদের প্রতিশ্রুতি
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold">১০০% মানি ব্যাক গ্যারান্টি</h3>
                <p className="mt-1.5 text-sm md:text-base text-primary-foreground/90">
                  পণ্য পছন্দ না হলে বা কোনো সমস্যা থাকলে ৭ দিনের মধ্যে সম্পূর্ণ টাকা ফেরত। মান ও বিশুদ্ধতার নিশ্চয়তা
                  আমাদের।
                </p>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 text-[11px] font-bold">
                  <span className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">✓ ৭ দিন রিটার্ন</span>
                  <span className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">✓ ক্যাশ অন ডেলিভারি</span>
                  <span className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">✓ বিশ্বস্ত ব্র্যান্ড</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
