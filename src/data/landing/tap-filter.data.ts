import { Droplets, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import type { TapFilterTier } from "@/components/landing/tap-filter/TapFilterPackages";
import type { TrustItem } from "@/components/landing/tap-filter/TapFilterHero";
import type { BenefitItem } from "@/components/landing/tap-filter/TapFilterFeatures";
import type { TapFilterReview } from "@/components/landing/tap-filter/TapFilterReviews";
import type { TapFilterFaqItem } from "@/components/landing/tap-filter/TapFilterFaq";

export const imgBefore = { url: "/images/before-water.webp", w: 1000, h: 1000 };
export const imgAfter = { url: "/images/after-water.webp", w: 1000, h: 1000 };
export const pack50 = { url: "/images/pack-50.webp", w: 1000, h: 1000 };
export const pack100 = { url: "/images/pack-100.webp", w: 1000, h: 1000 };

export const tiers: TapFilterTier[] = [
  {
    pieces: 50,
    price: 360,
    freebies: ["ভেলক্রো ব্যান্ড ১০ পিস"],
    badge: "জনপ্রিয়",
    image: pack50.url,
    alt: "৫০ পিস Water faucet tap filter প্যাকেজ",
  },
  {
    pieces: 100,
    price: 690,
    freebies: ["ভেলক্রো ব্যান্ড ২০ পিস"],
    badge: "সবচেয়ে জনপ্রিয়",
    highlight: true,
    ribbon: "BEST VALUE",
    image: pack100.url,
    alt: "১০০ পিস Water faucet tap filter বেস্ট ভ্যালু কম্বো",
  },
];

export const DHAKA = { enabled: true, inside: 60, outside: 120 };

export const trustItems: TrustItem[] = [
  { icon: Droplets, label: "পরিস্কার ও বিশুদ্ধ পানি" },
  { icon: ShieldCheck, label: "অন্তদ্ধতা অপসারণে কার্যকর" },
  { icon: Wrench, label: "সহজে ইনস্টল করা যায়" },
];

export const reviews: TapFilterReview[] = [
  {
    name: "ফারহানা আক্তার",
    city: "ঢাকা",
    rating: 5,
    text: "পানি অনেক পরিস্কার আসে এখন। ইনস্টল করাও অনেক সহজ ছিল। পরিবারের সবাই খুশি।",
  },
  {
    name: "মোঃ আল-আমিন",
    city: "চট্টগ্রাম",
    rating: 5,
    text: "দাম অনুযায়ী প্রোডাক্টের কোয়ালিটি অসাধারণ। ট্যাপের ময়লা একদম আটকে ফেলে।",
  },
  {
    name: "নাজমা বেগম",
    city: "সিলেট",
    rating: 4,
    text: "ডেলিভারি দ্রুত পেয়েছি, প্যাকেজিং ভালো ছিল। কাজ করছে ভালোভাবেই, রেকমেন্ড করব।",
  },
  {
    name: "তানভীর হোসেন",
    city: "খুলনা",
    rating: 5,
    text: "কম্বো প্যাকেজ নিয়েছিলাম — পুরো ফ্যামিলিতে বিলিয়ে দিয়েছি। সবাই পজিটিভ ফিডব্যাক দিয়েছে।",
  },
];

export const benefits: BenefitItem[] = [
  {
    icon: ShieldCheck,
    title: "মজবুত ও টেকসই",
    desc: "উন্নত মানের ম্যাটেরিয়ালে তৈরি, দীর্ঘদিন ব্যবহারের জন্য উপযোগী।",
  },
  {
    icon: Wrench,
    title: "সহজে লাগানো ও খুলে ফেলা যায়",
    desc: "কোনো টুলস ছাড়াই ঘরের যেকোনো ট্যাপে সহজে সংযোগ করা যায়।",
  },
  {
    icon: Sparkles,
    title: "দীর্ঘস্থায়ী ব্যবহার উপযোগী",
    desc: "বার বার পরিষ্কার করে ব্যবহার করা যায়, খরচ সাশ্রয়ী।",
  },
];

export const faqs: TapFilterFaqItem[] = [
  {
    q: "ইনস্টল করতে কি টেকনিশিয়ান লাগবে?",
    a: "না, একদমই না! Water faucet tap filter ইনস্টল করতে কোনো টুলস বা টেকনিশিয়ান লাগে না। পুরনো অ্যারেটর হাত দিয়ে খুলে নতুন ফিল্টারটি ঘুরিয়ে লাগিয়ে দিলেই কাজ শেষ — মাত্র ১ মিনিটে।",
  },
  {
    q: "সব ধরনের ট্যাপে কি ফিট হবে?",
    a: "বাংলাদেশের প্রায় ৯৫% স্ট্যান্ডার্ড কিচেন ও বাথরুম ট্যাপে সরাসরি ফিট হয়। প্যাকেজের সাথে বিভিন্ন সাইজের অ্যাডাপ্টার/রাবার রিং দেওয়া থাকে, ফলে থ্রেডেড ও নন-থ্রেডেড দুই ধরনের ট্যাপেই লাগানো যায়।",
  },
  {
    q: "ওয়ারেন্টি ও রিটার্ন পলিসি কী?",
    a: "প্রতিটি Water faucet tap filterে ১০০% মানি ব্যাক গ্যারান্টি রয়েছে। পণ্য পছন্দ না হলে বা কোনো সমস্যা থাকলে ৭ দিনের মধ্যে সম্পূর্ণ টাকা ফেরত পাবেন। কোনো প্রশ্ন ছাড়াই।",
  },
  {
    q: "ডেলিভারি কত দিনে পাবো?",
    a: "ঢাকার মধ্যে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে পণ্য পৌঁছে যাবে। পুরো বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে — পণ্য হাতে পেয়ে টাকা দিন।",
  },
  {
    q: "একটি ফিল্টার কতদিন ব্যবহার করা যায়?",
    a: "সাধারণ ব্যবহারে প্রতিটি ফিল্টার ৩-৬ মাস কার্যকর থাকে (পানির মানের উপর নির্ভর করে)। তাই কম্বো প্যাকেজ নিলে অনেকদিন নিশ্চিন্তে ব্যবহার করতে পারবেন — বারবার অর্ডার করার ঝামেলা নেই।",
  },
];

export const phone = "+8801794821159";
export const waHref = "https://wa.me/8801794821159";
