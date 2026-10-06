import { ChevronDown, HelpCircle, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";

export type FoilBagFaqItem = {
  q: string;
  a: string;
};

export function FoilBagFaq({
  faqs,
  phone,
  waHref,
}: {
  faqs: FoilBagFaqItem[];
  phone: string;
  waHref: string;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center" data-reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,130,246,.2)] px-3 py-1 text-xs font-bold text-[#2563eb]">
            <HelpCircle className="w-3.5 h-3.5 text-[#2563eb]" /> FAQ
          </span>
          <h2 className="mt-3 text-3xl font-extrabold">সাধারণ প্রশ্নাবলী</h2>
        </div>
        <div className="mt-8 space-y-3" data-reveal>
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={f.q} className="fb-glass overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 md:p-5 flex items-center justify-between text-left font-bold"
                >
                  <span className="text-sm md:text-base">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#2563eb] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <div className="px-4 pb-4 md:px-5 md:pb-5 text-sm text-[#334155] border-t border-[rgba(59,130,246,.1)] pt-3">{f.a}</div>}
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-[#f0f9ff] border border-[rgba(59,130,246,.2)] text-center" data-reveal>
          <h3 className="font-bold text-lg">সরাসরি কথা বলতে চান?</h3>
          <p className="mt-1 text-sm text-[#334155]">যেকোনো প্রশ্নের জন্য আমাদের কল করুন বা হোয়াটসঅ্যাপ করুন</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-sm hover:bg-[#1d4ed8] transition-colors shadow-md"
            >
              <Phone className="w-4 h-4" /> কল করুন: {phone}
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25d366] text-white font-bold text-sm hover:bg-[#1da851] transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
