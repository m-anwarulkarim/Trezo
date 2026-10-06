import { CheckCircle2, Gift, Loader2, Package, ShieldCheck, Truck } from "lucide-react";
import type { FormEvent, RefObject } from "react";
import { bn } from "@/lib/bn";
import type { FoilBagTier } from "./FoilBagPackages";

export function FoilBagCheckoutForm({
  formRef,
  tiers,
  pieces,
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
  saved,
  grandTotal,
  submitting,
  errors,
  handleSubmit,
  maybeFireCheckout,
}: {
  formRef: RefObject<HTMLDivElement | null>;
  tiers: FoilBagTier[];
  pieces: number;
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
  saved: number;
  grandTotal: number;
  submitting: boolean;
  errors: { name?: string; mobile?: string; address?: string; submit?: string };
  handleSubmit: (ev?: FormEvent) => Promise<void>;
  maybeFireCheckout: () => void;
}) {
  const selectedTier = tiers.find((t) => t.pieces === pieces) ?? tiers[1]!;

  return (
    <section ref={formRef} className="py-16 md:py-20 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center" data-reveal>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(59,130,246,.08)] border border-[rgba(59,130,246,.25)] px-3 py-1 text-xs font-bold text-[#2563eb]">
              <Gift className="w-3.5 h-3.5 text-[#2563eb]" /> ক্যাশ অন ডেলিভারি
            </span>
            <span className="fb-china-badge">
              🇨🇳 Made In China অরিজিনাল
            </span>
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">
            অর্ডার <span className="fb-gold-text">ফর্ম</span>
          </h2>
          <p className="mt-2 text-[#334155] text-sm">নিচের তথ্যগুলো দিন — আমরা কল করে অর্ডারটি নিশ্চিত করব।</p>
        </div>

        <form onSubmit={handleSubmit} className="fb-glass mt-8 p-5 md:p-7" data-reveal>
          <div className="grid grid-cols-3 gap-2">
            {tiers.map((t, i) => {
              const active = t.pieces === pieces;
              return (
                <article
                  key={t.pieces}
                  onClick={() => selectPackage(t.pieces)}
                  className={`relative cursor-pointer p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition ${
                    active
                      ? "border-[#3b82f6] bg-[rgba(59,130,246,.12)] fb-selected"
                      : "border-[rgba(59,130,246,.2)] bg-white hover:border-[rgba(59,130,246,.4)]"
                  } ${t.highlight ? "md:-translate-y-2" : ""}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  {t.ribbon ? (
                    <span
                      className="fb-ribbon"
                      style={{
                        background: "linear-gradient(100deg,#3b82f6,#2563eb)",
                        color: "#fff",
                        boxShadow: "0 8px 20px -8px rgba(37,99,235,.8)",
                      }}
                    >
                      {t.ribbon}
                    </span>
                  ) : null}
                  <div className="rounded-lg overflow-hidden bg-[rgba(255,255,255,.04)]">
                    <img
                      src={t.image}
                      alt={`${bn(t.pieces)} পিস ফয়েল জিপলক ব্যাগ প্যাক`}
                      className="w-full h-20 sm:h-36 object-contain"
                      loading="lazy"
                      width={600}
                      height={600}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <h3 className="text-[11px] sm:text-base font-extrabold leading-tight">{bn(t.pieces)} পিস</h3>
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#2563eb] border border-[rgba(59,130,246,.3)] rounded-full px-1 sm:px-2 py-0.5 whitespace-nowrap">
                      {t.badge}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-0.5">
                    <span className="text-sm sm:text-xl font-extrabold text-[#2563eb] shrink-0 whitespace-nowrap">৳{bn(t.price)}</span>
                    <span className="text-[8px] sm:text-xs line-through text-[#64748b] shrink-0 whitespace-nowrap">৳{bn(t.original)}</span>
                    <span className="text-[7px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-0.5 sm:px-1 py-0.5 rounded border border-emerald-100 shrink-0 whitespace-nowrap">
                      ৳{bn(t.saving)} সাশ্রয়
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-[10px] sm:text-xs text-[#334155]">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mt-0.5 text-[#2563eb] shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-6 space-y-4 text-left">
            <div>
              <label htmlFor="fb-name" className="block text-sm font-bold text-[#1e293b] mb-1.5">
                আপনার নাম <span className="text-red-500">*</span>
              </label>
              <input
                id="fb-name"
                type="text"
                className={`w-full rounded-xl border ${
                  errors.name
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-[rgba(59,130,246,.35)] focus:border-[#2563eb]"
                } bg-white px-4 py-3 text-sm font-semibold text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/15 transition-all shadow-sm`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={maybeFireCheckout}
                placeholder="যেমন: সাদিয়া ইসলাম"
              />
              {errors.name ? <p className="mt-1 text-xs font-semibold text-red-500">{errors.name}</p> : null}
            </div>

            <div>
              <label htmlFor="fb-mobile" className="block text-sm font-bold text-[#1e293b] mb-1.5">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                id="fb-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                className={`w-full rounded-xl border ${
                  errors.mobile
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-[rgba(59,130,246,.35)] focus:border-[#2563eb]"
                } bg-white px-4 py-3 text-sm font-semibold text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/15 transition-all shadow-sm`}
                value={mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                onFocus={maybeFireCheckout}
                placeholder="017XXXXXXXX"
              />
              {errors.mobile ? <p className="mt-1 text-xs font-semibold text-red-500">{errors.mobile}</p> : null}
            </div>

            <div>
              <label htmlFor="fb-address" className="block text-sm font-bold text-[#1e293b] mb-1.5">
                সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span>
              </label>
              <textarea
                id="fb-address"
                rows={3}
                className={`w-full rounded-xl border ${
                  errors.address
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-[rgba(59,130,246,.35)] focus:border-[#2563eb]"
                } bg-white px-4 py-3 text-sm font-semibold text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/15 transition-all shadow-sm resize-none`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={maybeFireCheckout}
                placeholder="গ্রাম/এলাকা, থানা, জেলা"
              />
              {errors.address ? <p className="mt-1 text-xs font-semibold text-red-500">{errors.address}</p> : null}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="block text-sm font-bold text-[#1e293b] mb-1.5">ডেলিভারি এলাকা</span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["inside", "ঢাকার ভেতরে ফ্রি ডেলিভারি"],
                      ["outside", "ঢাকার বাইরে ফ্রি ডেলিভারি"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDeliveryArea(key)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                        deliveryArea === key
                          ? "border-[#3b82f6] bg-[rgba(59,130,246,.12)] text-[#2563eb] shadow-sm"
                          : "border-[rgba(59,130,246,.2)] bg-white text-[#334155] hover:border-[#3b82f6]/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-sm font-bold text-[#1e293b] mb-1.5">পরিমাণ</span>
                <div className="flex items-center gap-3 h-10">
                  <button
                    type="button"
                    aria-label="কমান"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl border border-[rgba(59,130,246,.35)] text-[#2563eb] text-lg font-extrabold bg-white hover:bg-blue-50 transition-colors flex items-center justify-center shadow-sm"
                  >
                    −
                  </button>
                  <span className="text-xl font-extrabold w-8 text-center text-[#0f172a]">{bn(quantity)}</span>
                  <button
                    type="button"
                    aria-label="বাড়ান"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-10 h-10 rounded-xl border border-[rgba(59,130,246,.35)] text-[#2563eb] text-lg font-extrabold bg-white hover:bg-blue-50 transition-colors flex items-center justify-center shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[rgba(59,130,246,.2)] bg-[rgba(59,130,246,.06)] p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-[#334155]">
                {bn(selectedTier.pieces)} পিস প্যাক × {bn(quantity)}
              </span>
              <span className="font-semibold">৳{bn(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#334155]">ডেলিভারি চার্জ</span>
              <span className="font-semibold">৳{bn(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between py-1 text-emerald-600">
              <span>আপনার সাশ্রয়</span>
              <span className="font-semibold">৳{bn(saved)}</span>
            </div>
            <div className="mt-2 border-t border-[rgba(59,130,246,.2)] pt-2 flex justify-between text-lg">
              <span className="font-bold">সর্বমোট</span>
              <span className="font-extrabold text-[#2563eb]">৳{bn(grandTotal)}</span>
            </div>
          </div>

          {errors.submit ? (
            <p className="fb-err mt-3 text-center text-sm">{errors.submit}</p>
          ) : null}

          <button type="submit" disabled={submitting} className="fb-cta mt-5 w-full rounded-full py-4 font-extrabold text-lg">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> পাঠানো হচ্ছে…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Package className="w-5 h-5" /> অর্ডার কনফার্ম করুন
              </span>
            )}
          </button>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[12px] text-[#334155] text-center">
            <span className="inline-flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#2563eb]" /> ১০০% অরিজিনাল
            </span>
            <span className="inline-flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#2563eb]" /> দ্রুত ডেলিভারি
            </span>
            <span className="inline-flex flex-col items-center gap-1">
              <Gift className="w-4 h-4 text-[#2563eb]" /> ফিনান্সিয়াল সেফটি
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
