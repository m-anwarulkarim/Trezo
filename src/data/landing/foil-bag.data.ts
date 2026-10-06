import { Droplets, Lock, Package, Refrigerator, Recycle, Snowflake } from "lucide-react";
import type { FoilBagTier } from "@/components/landing/foil-bag/FoilBagPackages";
import type { FoilBagFeatureItem } from "@/components/landing/foil-bag/FoilBagFeatures";
import type { FoilBagReviewItem } from "@/components/landing/foil-bag/FoilBagReviews";
import type { FoilBagFaqItem } from "@/components/landing/foil-bag/FoilBagFaq";

export const imgHero = "/images/foil-hero-v2.webp";
export const imgBefore = "/images/foil-before-v2.webp";
export const imgFeatures = "/images/foil-after-v2.webp";
export const pack10 = imgHero;
export const pack20 = imgHero;
export const pack30 = imgHero;

export const tiers: FoilBagTier[] = [
  {
    pieces: 10,
    price: 390,
    original: 600,
    saving: 159,
    image: pack10,
    perks: ["১০ পিস (১০x১০ ইঞ্চি)", "ট্রায়াল প্যাক"],
    badge: "স্টার্টার",
  },
  {
    pieces: 20,
    price: 690,
    original: 950,
    saving: 260,
    image: pack20,
    perks: ["২০ পিস (১০x১০ ইঞ্চি)", "সবচেয়ে বেশি বিক্রি"],
    badge: "সবচেয়ে জনপ্রিয়",
    highlight: true,
    ribbon: "BEST VALUE",
  },
  {
    pieces: 30,
    price: 990,
    original: 1450,
    saving: 460,
    image: pack30,
    perks: ["৩০ পিস (১০x১০ ইঞ্চি)", "ফ্যামিলি প্যাক — সর্বোচ্চ সাশ্রয়"],
    badge: "ফ্যামিলি প্যাক",
  },
];

export const DHAKA = { inside: 0, outside: 0 };
export const phone = "+8801794821159";
export const waHref = "https://wa.me/8801794821159";

export const features: FoilBagFeatureItem[] = [
  { icon: Lock, title: "এয়ারটাইট জিপ লক", desc: "বাতাস ঢুকতে পারে না, তাই খাবার অনেকদিন ফ্রেশ থাকে।" },
  { icon: Droplets, title: "১০০% লিকপ্রুফ", desc: "ঝোল বা তরল খাবার রাখলেও এক ফোঁটাও বাইরে পড়বে না।" },
  { icon: Snowflake, title: "ফ্রিজার সেফ", desc: "ডিপ ফ্রিজেও ব্যাগ ফাটে না, খাবারের স্বাদ অক্ষত থাকে।" },
  { icon: Recycle, title: "বারবার ব্যবহারযোগ্য", desc: "ধুয়ে শুকিয়ে আবার ব্যবহার করা যায় — খরচ সাশ্রয়ী।" },
  { icon: Package, title: "২-২.৫ কেজি ধারণক্ষমতা", desc: "মাছ, মাংস, সবজি — এক ব্যাগেই অনেকটা রাখা যায়।" },
  { icon: Refrigerator, title: "ফ্রিজ থাকবে গোছানো", desc: "সমান সাইজের ব্যাগে ফ্রিজ দেখতে পরিষ্কার ও সাজানো লাগে।" },
];

export const problems = [
  "সাধারণ পলিব্যাগে খাবার দ্রুত নষ্ট হয়ে যায়",
  "ঝোল বা রক্ত লিক করে ফ্রিজ নোংরা হয়",
  "ব্যাকটেরিয়া জন্মে দুর্গন্ধ ছড়ায়",
  "একবার ব্যবহার করেই ফেলে দিতে হয়",
];

export const solutions = [
  "মাছ-মাংস রাখলেও গন্ধ ছড়াবে না",
  "খাবার বেশি সময় ফ্রেশ থাকে",
  "ফ্রিজ থাকবে পরিষ্কার ও গুছানো",
  "বারবার ব্যবহার করা যায় (Reusable)",
  "Date লিখে রাখুন — পুরনো খাবার ভুলবেন না",
];

export const reviews: FoilBagReviewItem[] = [
  { name: "সাদিয়া ইসলাম", city: "ঢাকা", rating: 5, text: "ফ্রিজ এখন একদম গোছানো। মাছ-মাংস আলাদা করে রাখতে পারছি, কোনো গন্ধ নেই।" },
  { name: "মোঃ রিফাত হাসান", city: "চট্টগ্রাম", rating: 5, text: "জিপ লকটা অনেক শক্ত। ঝোলসহ তরকারি রেখেছিলাম, একটুও লিক করেনি।" },
  { name: "নুসরাত জাহান", city: "রাজশাহী", rating: 5, text: "২০ পিসের প্যাক নিয়েছি। ধুয়ে আবার ব্যবহার করছি, কোয়ালিটি দারুণ।" },
  { name: "তাসনিম আরা", city: "সিলেট", rating: 4, text: "ডেলিভারি দ্রুত পেয়েছি। দামের তুলনায় প্রোডাক্ট অনেক ভালো।" },
];

export const faqs: FoilBagFaqItem[] = [
  { q: "ব্যাগের সাইজ কত?", a: "প্রতিটি ব্যাগ ১০x১০ ইঞ্চি, এবং এতে ২ থেকে ২.৫ কেজি পর্যন্ত খাবার রাখা যায়।" },
  { q: "ফ্রিজে রাখলে কি ফেটে যাবে?", a: "না। ব্যাগগুলো ফ্রিজার সেফ, ডিপ ফ্রিজেও নরম থাকে এবং ফাটে না।" },
  { q: "কতবার ব্যবহার করা যাবে?", a: "ভালোভাবে ধুয়ে শুকিয়ে নিলে একই ব্যাগ অনেকবার ব্যবহার করা যায়।" },
  { q: "ডেলিভারি চার্জ কত?", a: "সীমিত সময়ের অফারে সারাদেশে ফ্রি ডেলিভারি! ক্যাশ অন ডেলিভারি উপলব্ধ।" },
  { q: "পণ্য পছন্দ না হলে কী হবে?", a: "পণ্য হাতে পেয়ে দেখে নিতে পারবেন। সমস্যা থাকলে ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।" },
];
