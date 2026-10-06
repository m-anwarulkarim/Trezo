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
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(59,130,246,.08)] border border-[rgba(59,130,246,.25)] px-3 py-1 text-xs font-bold text-[#2563eb]">
            <Gift className="w-3.5 h-3.5 text-[#2563eb]" /> ক্যাশ অন ডেলিভারি
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">
            অর্ডার <span className="fb-gold-text">ফর্ম</span>
          </h2>
          <p className="mt-2 text-[#334155] text-sm">নিচের তথ্যগুলো দিন — আমরা কল করে অর্ডারটি নিশ্চিত করব।</p>
        </div>

        <form onSubmit={handleSubmit} className="fb-glass mt-8 p-5 md:p-7" data-reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {tiers.map((t, i) => {
              const active = t.pieces === pieces;
              return (
                <article
                  key={t.pieces}
                  onClick={() => selectPackage(t.pieces)}
                  className={`relative cursor-pointer p-4 rounded-2xl border transition ${
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
                  <div className="rounded-xl overflow-hidden bg-[rgba(255,255,255,.04)]">
                    <img
                      src={t.image}
                      alt={`${bn(t.pieces)} পিস ফয়েল জিপলক ব্যাগ প্যাক`}
                      className="w-full h-36 object-contain"
                      loading="lazy"
                      width={600}
                      height={600}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold">{bn(t.pieces)} পিস</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb] border border-[rgba(59,130,246,.3)] rounded-full px-2 py-0.5">
                      {t.badge}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xl font-extrabold text-[#2563eb]">৳{bn(t.price)}</span>
                    <span className="text-xs line-through text-[#334155]">৳{bn(t.original)}</span>
                    <span className="text-[10px] font-bold text-emerald-600">৳{bn(t.saving)} সাশ্রয়</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-[#334155]">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[#2563eb] shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="fb-label" htmlFor="fb-name">
                আপনার নাম
              </label>
              <input
                id="fb-name"
                className={`fb-input ${errors.name ? "fb-input-err" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={maybeFireCheckout}
                placeholder="যেমন: সাদিয়া ইসলাম"
              />
              {errors.name ? <p className="fb-err">{errors.name}</p> : null}
            </div>
            <div>
              <label className="fb-label" htmlFor="fb-mobile">
                মোবাইল নম্বর
              </label>
              <input
                id="fb-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                className={`fb-input ${errors.mobile ? "fb-input-err" : ""}`}
                value={mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                onFocus={maybeFireCheckout}
                placeholder="017XXXXXXXX"
              />
              {errors.mobile ? <p className="fb-err">{errors.mobile}</p> : null}
            </div>
            <div>
              <label className="fb-label" htmlFor="fb-address">
                সম্পূর্ণ ঠিকানা
              </label>
              <textarea
                id="fb-address"
                rows={3}
                className={`fb-input ${errors.address ? "fb-input-err" : ""}`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={maybeFireCheckout}
                placeholder="গ্রাম/এলাকা, থানা, জেলা"
              />
              {errors.address ? <p className="fb-err">{errors.address}</p> : null}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span className="fb-label">ডেলিভারি এলাকা</span>
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
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                        deliveryArea === key
                          ? "border-[#3b82f6] bg-[rgba(59,130,246,.12)] text-[#2563eb]"
                          : "border-[rgba(59,130,246,.2)] bg-white text-[#334155]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="fb-label">পরিমাণ</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="কমান"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full border border-[rgba(59,130,246,.35)] text-[#2563eb] font-bold bg-white"
                  >
                    −
                  </button>
                  <span className="text-lg font-extrabold w-8 text-center">{bn(quantity)}</span>
                  <button
                    type="button"
                    aria-label="বাড়ান"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-10 h-10 rounded-full border border-[rgba(59,130,246,.35)] text-[#2563eb] font-bold bg-white"
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
