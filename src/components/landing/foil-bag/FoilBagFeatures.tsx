import type { LucideIcon } from "lucide-react";

export type FoilBagFeatureItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export function FoilBagFeatures({ features }: { features: FoilBagFeatureItem[] }) {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center" data-reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold">
            কেন এটি <span className="fb-gold-text">প্রিমিয়াম</span>
          </h2>
          <p className="mt-2 text-[#334155]">প্রতিটি ব্যাগেই আছে ৬টি বড় সুবিধা</p>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {features.map((f, i) => (
            <div key={f.title} className="fb-glass p-5" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="w-11 h-11 rounded-xl bg-[rgba(59,130,246,.1)] border border-[rgba(59,130,246,.2)] flex items-center justify-center">
                <f.icon className="w-5 h-5 text-[#2563eb]" />
              </div>
              <h3 className="mt-3 font-bold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-[#334155] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
