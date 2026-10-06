import { Flame } from "lucide-react";
import { bn } from "@/lib/bn";

export function FoilBagStickyCta({
  grandTotal,
  submitting,
  isFormFilled,
  handleFloatingCta,
}: {
  grandTotal: number;
  submitting: boolean;
  isFormFilled: boolean;
  handleFloatingCta: () => void;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-[rgba(59,130,246,.2)] bg-[rgba(255,255,255,.95)] backdrop-blur px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <div className="text-sm">
          <div className="text-[12px] text-[#334155]">সর্বমোট</div>
          <div className="font-extrabold text-[#2563eb]">৳{bn(grandTotal)}</div>
        </div>
        <button
          type="button"
          onClick={handleFloatingCta}
          disabled={submitting}
          className="fb-cta flex-1 rounded-full py-3 font-bold text-sm disabled:opacity-70 flex items-center justify-center gap-1.5"
        >
          <Flame className="w-4 h-4" />{" "}
          {submitting ? "অর্ডার হচ্ছে..." : isFormFilled ? "অর্ডার কনফার্ম করুন" : "অর্ডার করুন"}
        </button>
      </div>
    </div>
  );
}
