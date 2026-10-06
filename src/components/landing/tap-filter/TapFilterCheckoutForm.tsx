import { Flame, Gift, Loader2, PartyPopper } from "lucide-react";
import type { FormEvent, RefObject } from "react";
import { bn } from "@/lib/bn";
import type { TapFilterTier } from "./TapFilterPackages";

export function TapFilterCheckoutForm({
  formRef,
  tiers,
  tierPieces,
  selectPackage,
  name,
  setName,
  mobile,
  handleMobileChange,
  address,
  setAddress,
  deliveryArea,
  setDeliveryArea,
  quantity,
  setQuantity,
  subtotal,
  deliveryCharge,
  grandTotal,
  submitting,
  errors,
  success,
  setSuccess,
  handleSubmit,
  maybeFireCheckout,
  DHAKA,
}: {
  formRef: RefObject<HTMLDivElement | null>;
  tiers: TapFilterTier[];
  tierPieces: number;
  selectPackage: (p: number) => void;
  name: string;
  setName: (v: string) => void;
  mobile: string;
  handleMobileChange: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  deliveryArea: "inside" | "outside";
  setDeliveryArea: (v: "inside" | "outside") => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  submitting: boolean;
  errors: { name?: string; mobile?: string; address?: string; submit?: string };
  success: null | { orderId: string };
  setSuccess: (val: null | { orderId: string }) => void;
  handleSubmit: (ev?: FormEvent) => void;
  maybeFireCheckout: () => void;
  DHAKA: { enabled: boolean; inside: number; outside: number };
}) {
  const selectedTier = (tiers.find((t) => t.pieces === tierPieces) ?? tiers[1])!;

  return (
    <section id="order" ref={formRef} className="py-14 md:py-20 bg-gradient-to-b from-primary/5 to-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8" data-reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-deep">অর্ডার ফর্ম</h2>
          <p className="mt-2 text-slate-600">নিচের ফর্মটি পূরণ করে সাবমিট করুন — আমরা দ্রুত যোগাযোগ করব।</p>
        </div>

        <div className="tf-card rounded-3xl p-6 md:p-8" data-reveal>
          {success ? (
            <div className="tf-pop text-center py-8">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 52 52" className="w-12 h-12">
                  <circle cx="26" cy="26" r="24" fill="none" stroke="#10b981" strokeWidth="3" />
                  <path
                    d="M14 27 L23 36 L39 18"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 50,
                      strokeDashoffset: 50,
                      animation: "tf-check-draw .6s .2s ease-out forwards",
                    }}
                  />
                </svg>
              </div>
              <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                <PartyPopper className="w-6 h-6" />
                <h3 className="text-2xl md:text-3xl font-extrabold">ধন্যবাদ!</h3>
              </div>
              <p className="text-lg font-semibold text-slate-800">আপনার অর্ডার পাওয়া গেছে</p>
              <p className="mt-2 text-sm text-slate-600">
                অর্ডার আইডি: <span className="font-mono font-bold text-primary">{success.orderId}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">আমরা শীঘ্রই আপনার নম্বরে যোগাযোগ করব ইনশাআল্লাহ।</p>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-primary border-2 border-primary/20 hover:bg-primary/5"
              >
                আরেকটি অর্ডার দিন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label className="tf-label mb-2 block">প্যাকেজ নির্বাচন করুন</label>
                <div className="grid grid-cols-2 gap-3">
                  {tiers.map((t) => {
                    const selected = t.pieces === tierPieces;
                    const regular = Math.round(t.price * 1.35);
                    return (
                      <button
                        type="button"
                        key={t.pieces}
                        onClick={() => selectPackage(t.pieces)}
                        className={`relative text-left rounded-xl border-2 p-2.5 sm:p-3 transition-all ${
                          selected
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-orange-300"
                        }`}
                        aria-pressed={selected}
                      >
                        {t.badge && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white whitespace-nowrap">
                            {t.badge}
                          </span>
                        )}
                        <div className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
                          {t.pieces} পিস প্যাকেজ
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1 flex-wrap">
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                            ৳{regular.toLocaleString("en-US")}
                          </span>
                          <span className="text-sm sm:text-base font-extrabold text-orange-600">
                            ৳{t.price.toLocaleString("en-US")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="tf-label">
                    নাম <span className="text-primary-deep">*</span>
                  </label>
                  <input
                    type="text"
                    className={`tf-input ${errors.name ? "tf-input-err" : ""}`}
                    placeholder="আপনার পূর্ণ নাম"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      maybeFireCheckout();
                    }}
                    maxLength={80}
                  />
                  {errors.name && <div className="tf-err">{errors.name}</div>}
                </div>
                <div>
                  <label className="tf-label">
                    মোবাইল নম্বর <span className="text-primary-deep">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    className={`tf-input ${errors.mobile ? "tf-input-err" : ""}`}
                    placeholder="017XXXXXXXX"
                    value={mobile}
                    onChange={(e) => {
                      handleMobileChange(e.target.value);
                      maybeFireCheckout();
                    }}
                  />
                  {errors.mobile && <div className="tf-err">{errors.mobile}</div>}
                </div>
                <div>
                  <label className="tf-label">
                    সম্পূর্ণ ঠিকানা <span className="text-primary-deep">*</span>
                  </label>
                  <textarea
                    className={`tf-input ${errors.address ? "tf-input-err" : ""}`}
                    rows={2}
                    placeholder="বাসা, রোড, থানা, জেলা"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      maybeFireCheckout();
                    }}
                    maxLength={300}
                  />
                  {errors.address && <div className="tf-err">{errors.address}</div>}
                </div>
              </div>

              {DHAKA.enabled && (
                <div className="mt-5">
                  <label className="tf-label mb-2 block">ডেলিভারি এরিয়া</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { value: "inside" as const, label: "ঢাকার মধ্যে", charge: DHAKA.inside },
                      { value: "outside" as const, label: "ঢাকার বাইরে", charge: DHAKA.outside },
                    ].map((opt) => {
                      const sel = deliveryArea === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setDeliveryArea(opt.value)}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${
                            sel
                              ? "border-orange-500 bg-orange-50 shadow-md"
                              : "border-slate-200 bg-white hover:border-orange-300"
                          }`}
                          aria-pressed={sel}
                        >
                          <div className="text-sm font-semibold text-slate-800">{opt.label}</div>
                          <div className="text-xs text-orange-600 font-bold mt-0.5">ডেলিভারি চার্জ ৳{opt.charge}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-2xl border-2 border-primary/20 bg-white p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">পরিমাণ (কতটি প্যাকেজ)</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedTier.pieces} পিস প্যাকেজ × {bn(quantity)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="পরিমাণ কমান"
                    className="w-10 h-10 rounded-full bg-primary/10 text-primary-deep font-bold text-xl flex items-center justify-center hover:bg-primary/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] text-center text-lg font-extrabold text-primary-deep">
                    {bn(quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    disabled={quantity >= 99}
                    aria-label="পরিমাণ বাড়ান"
                    className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/20 p-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">প্যাকেজ:</span>
                  <span className="font-semibold text-primary-deep">
                    {selectedTier.pieces} পিস × {quantity}
                  </span>
                </div>
                <div className="mt-1.5 flex items-start justify-between text-xs text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" /> ফ্রি গিফট:
                  </span>
                  <span className="text-right font-medium">{selectedTier.freebies.join(", ")}</span>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-slate-700">সাবটোটাল:</span>
                  <span className="font-semibold text-primary-deep">৳ {subtotal.toLocaleString("en-US")}</span>
                </div>
                <div className="mt-1 flex justify-between items-center text-sm">
                  <span className="text-slate-700">
                    ডেলিভারি চার্জ ({deliveryArea === "inside" ? "ঢাকার মধ্যে" : "ঢাকার বাইরে"}):
                  </span>
                  <span className="font-semibold text-primary-deep">৳ {deliveryCharge.toLocaleString("en-US")}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/20 flex justify-between items-center">
                  <span className="font-bold text-slate-800">সর্বমোট:</span>
                  <span className="text-2xl font-extrabold text-orange-600">
                    ৳ {grandTotal.toLocaleString("en-US")}
                  </span>
                </div>
              </div>

              {errors.submit && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="tf-cta mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> পাঠানো হচ্ছে...
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5" /> অর্ডার কনফার্ম করুন
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                সাবমিট করার সাথে সাথে আপনার অর্ডার সেভ হবে এবং আমরা যোগাযোগ করব।
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
