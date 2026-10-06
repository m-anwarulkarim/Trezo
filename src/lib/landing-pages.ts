export interface LandingPage {
  id: string;
  title: string;
  path: string;
  description: string;
}

export const landingPages: LandingPage[] = [
  {
    id: "tap-filter",
    title: "ওয়াটার ফসেট ট্যাপ ফিল্টার (Tap Filter)",
    path: "/",
    description: "পরিষ্কার ও বিশুদ্ধ পানির নিশ্চয়তা। ক্যাশ অন ডেলিভারি, ৭ দিনের রিটার্ন।",
  },
  {
    id: "foil-bag",
    title: "অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ (Foil Bag)",
    path: "/lp/foil-bag",
    description: "এয়ারটাইট জিপ লক, ১০০% লিকপ্রুফ, ফ্রিজার সেফ ও রিইউজেবল ব্যাগ।",
  },
];
