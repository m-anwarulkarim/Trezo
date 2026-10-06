import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { useState } from "react";

export function FoilBagVideoSection({ scrollToForm }: { scrollToForm: () => void }) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Video Side */}
          <div className="w-full md:w-1/2 order-2" data-reveal>
            <div className="relative aspect-[9/16] w-full max-w-[350px] sm:max-w-[450px] mx-auto rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-[#3b82f6]/20">
              {!videoOpen ? (
                <div
                  className="absolute inset-0 cursor-pointer group"
                  onClick={() => setVideoOpen(true)}
                >
                  <img
                    src="https://i.ytimg.com/vi/7zayAaTPLg8/maxresdefault.jpg"
                    alt="অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ ভিডিও"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2563eb]">
                      <Play className="w-8 h-8 ml-1 fill-current" />
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  src="https://www.youtube.com/embed/7zayAaTPLg8?autoplay=1&rel=0"
                  title="YouTube short player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              )}
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 order-1 space-y-8" data-reveal>
            <div className="text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-sm font-bold mb-4">
                প্রিমিয়াম কোয়ালিটি
              </span>
              <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight">
                এখন আপনার ফ্রিজ হবে এমন পরিষ্কার ও গুছানো
              </h2>
              <p className="mt-4 text-lg text-[#475569] hidden md:block">
                বিস্তারিত জানতে ভিডিওটি প্লে করুন অথবা নিচের বৈশিষ্ট্যগুলো দেখে নিন:
              </p>
            </div>

            <div className="grid gap-5 hidden md:block">
              {[
                "এয়ারটাইট সিল যা খাবারকে রাখে দীর্ঘক্ষণ টাটকা",
                "১০০% লিকপ্রুফ ডিজাইন, কোনো কিছু চুইয়ে পড়বে না",
                "ফ্রিজার সেফ, ডিপ ফ্রিজেও ব্যাগ ফাটবে না",
                "ইকো-ফ্রেন্ডলি ও বারবার ধুয়ে ব্যবহারযোগ্য",
                "খাবার সংরক্ষণের আধুনিক ও স্বাস্থ্যসম্মত সমাধান",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#3b82f6]/10 flex items-center justify-center group-hover:bg-[#3b82f6]/20 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#3b82f6]" />
                  </div>
                  <span className="text-lg font-medium text-[#1e293b] leading-snug">{text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 hidden md:block">
              <button
                onClick={() => scrollToForm()}
                className="fb-cta px-8 py-4 rounded-xl text-lg font-bold shadow-lg flex items-center gap-2"
              >
                এখনই অর্ডার করুন <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
