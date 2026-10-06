import { Clock, Droplets, Sparkles, Wrench, type LucideIcon } from "lucide-react";

export type BenefitItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export function TapFilterFeatures({ benefits }: { benefits: BenefitItem[] }) {
  return (
    <>
      {/* BENEFITS */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-deep">কেন Water faucet tap filter?</h2>
            <p className="mt-2 text-slate-600">দৈনন্দিন ব্যবহারের জন্য সেরা সমাধান</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                data-reveal
                className="tf-card rounded-2xl p-6 text-center"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4 shadow-md">
                  <b.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-primary-deep">{b.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
              সহজ ইনস্টলেশন
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-primary-deep">কীভাবে ব্যবহার করবেন?</h2>
            <p className="mt-2 text-slate-600">মাত্র ৩টি সহজ ধাপে ইনস্টল করুন — কোনো টুলস বা টেকনিশিয়ান লাগবে না!</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative">
            {[
              {
                icon: Wrench,
                title: "পুরনো ফিল্টার/অ্যারেটর খুলুন",
                desc: "আপনার ট্যাপের সামনের অংশ (aerator) হাত দিয়েই ঘুরিয়ে সহজে খুলে ফেলুন।",
                step: "১",
              },
              {
                icon: Droplets,
                title: "Water faucet tap filter লাগান",
                desc: "নতুন Water faucet tap filterটি ট্যাপের মুখে বসিয়ে হালকাভাবে ঘুরিয়ে টাইট করে নিন।",
                step: "২",
              },
              {
                icon: Sparkles,
                title: "বিশুদ্ধ পানি উপভোগ করুন",
                desc: "ট্যাপ চালু করুন — ময়লা, বালু ও অপদ্রব্য মুক্ত পরিষ্কার পানি সরাসরি!",
                step: "৩",
              },
            ].map((s, i) => (
              <div
                key={i}
                data-reveal
                style={{ transitionDelay: `${i * 100}ms` }}
                className="relative rounded-2xl bg-white ring-1 ring-primary/20 shadow-sm p-6 pt-10 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="absolute -top-5 left-6 w-11 h-11 rounded-full bg-gradient-to-br from-primary/50 to-primary-light text-white flex items-center justify-center font-extrabold text-lg shadow-lg ring-4 ring-white">
                  {s.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary-deep">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-500" data-reveal>
            <Clock className="inline w-4 h-4 mr-1 -mt-0.5" />
            মোট সময়: <span className="font-bold text-primary">১ মিনিটেরও কম!</span>
          </div>
        </div>
      </section>
    </>
  );
}
