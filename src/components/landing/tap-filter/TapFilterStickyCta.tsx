import { Flame, MessageCircle, Phone } from "lucide-react";

export function TapFilterStickyCta({
  phone,
  waHref,
  submitting,
  isFormFilled,
  handleFloatingCta,
}: {
  phone: string;
  waHref: string;
  submitting: boolean;
  isFormFilled: boolean;
  handleFloatingCta: () => void;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:bottom-4">
      <div className="mx-auto max-w-2xl md:rounded-2xl bg-white/95 backdrop-blur border-t md:border border-primary/20 shadow-2xl px-3 py-2.5 flex items-center gap-2">
        <a
          href={`tel:${phone}`}
          aria-label="Call"
          className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"
        >
          <Phone className="w-5 h-5" />
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
        <button
          type="button"
          onClick={handleFloatingCta}
          disabled={submitting}
          className="tf-cta flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-bold text-sm disabled:opacity-70"
        >
          <Flame className="w-4 h-4" />{" "}
          {submitting ? "অর্ডার হচ্ছে..." : isFormFilled ? "অর্ডার কনফার্ম করুন" : "এখনই অর্ডার করুন"}
        </button>
      </div>
    </div>
  );
}
