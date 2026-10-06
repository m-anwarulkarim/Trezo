/**
 * সব ইউজার-ফেসিং মেসেজ এখান থেকেই আসবে — সবসময় সহজ, ভদ্র বাংলায়।
 * নিয়ম: টেকনিক্যাল শব্দ (RLS, JWT, fetch, 401 ইত্যাদি) কখনো ইউজারকে দেখাব না।
 */

type Rule = { match: RegExp; message: string };

const PATHAO_RULES: Rule[] = [
  {
    match: /credentials were incorrect|invalid credentials|invalid client|client_id|client_secret/i,
    message: "পাঠাও API তথ্য (Client ID, Secret, Username বা Password) সঠিক নয়। পোর্টাল থেকে মিলিয়ে দেখে আবার চেষ্টা করুন।",
  },
  {
    match: /store_id is required|invalid store_id|store_id|store id|store not found/i,
    message: "পাঠাও Store ID নির্বাচন করা হয়নি। সেটিংসে গিয়ে স্টোর বেছে নিয়ে সেভ দিন।",
  },
  {
    match: /recipient_phone|phone number|invalid phone/i,
    message: "কাস্টমারের ফোন নম্বরটি সঠিক নয় (যেমন: 01712345678)।",
  },
  {
    match: /recipient_address|short address|address/i,
    message: "কাস্টমারের ঠিকানা অন্তত ১০ অক্ষরের হতে হবে।",
  },
  {
    match: /recipient_city|recipient_zone|city_id|zone_id/i,
    message: "ঠিকানা থেকে পাঠাও সিটি বা জোন পাওয়া যায়নি। সেটিংসে ডিফল্ট সিটি ও জোন বেছে দিন।",
  },
  {
    match: /amount_to_collect|price|total_amount/i,
    message: "অর্ডারের ক্যাশ-অন-ডেলিভারি টাকার অংকে সমস্যা আছে।",
  },
];

const AUTH_RULES: Rule[] = [
  {
    match: /invalid login credentials|invalid_credentials/i,
    message: "ইমেইল বা পাসওয়ার্ড মিলছে না। আবার দেখে চেষ্টা করুন।",
  },
  {
    match: /email not confirmed/i,
    message: "আপনার ইমেইলটি এখনো নিশ্চিত করা হয়নি। ইনবক্সের লিংকে ক্লিক করে তারপর লগইন করুন।",
  },
  {
    match: /user already registered|already registered/i,
    message: "এই ইমেইলে একটি অ্যাকাউন্ট আগেই আছে। সরাসরি লগইন করুন।",
  },
  {
    match: /password should be at least|password is too short|weak password/i,
    message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।",
  },
  {
    match: /invalid email|unable to validate email/i,
    message: "ইমেইল ঠিকানাটি সঠিক নয়। আবার লিখুন।",
  },
  {
    match: /email rate limit|too many requests|rate limit/i,
    message: "একটু বেশি চেষ্টা হয়ে গেছে। ২-৩ মিনিট পরে আবার চেষ্টা করুন।",
  },
  {
    match: /signups? not allowed|signup is disabled/i,
    message: "এখন নতুন অ্যাকাউন্ট তৈরি করা বন্ধ আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।",
  },
];

const COMMON_RULES: Rule[] = [
  ...PATHAO_RULES,
  {
    match: /missing supabase environment|supabase_url|supabase_publishable_key/i,
    message: "ডেটাবেজ এনভায়রনমেন্ট ভেরিয়েবল সেট করা নেই। দয়া করে .env ফাইলটি পরীক্ষা করুন।",
  },
  {
    match: /failed to fetch|network|networkerror|offline|timeout|timed out|econnrefused|enotfound/i,
    message: "ইন্টারনেট বা সার্ভার সংযোগে সমস্যা হচ্ছে। কানেকশন দেখে আবার চেষ্টা করুন।",
  },
  {
    match: /row-level security|permission denied|not authorized|unauthorized|forbidden|42501/i,
    message: "এই কাজটি করার অনুমতি আপনার নেই। অ্যাডমিনের সাথে যোগাযোগ করুন।",
  },
  {
    match: /duplicate key|already exists|23505/i,
    message: "তথ্যটি আগেই সংরক্ষিত আছে, তাই আবার যোগ করা যায়নি।",
  },
  {
    match: /violates check constraint|invalid input|23514|22P02/i,
    message: "দেওয়া তথ্যে কিছু ভুল আছে। ঘরগুলো আবার দেখে সঠিক তথ্য দিন।",
  },
  {
    match: /foreign key|23503/i,
    message: "সম্পর্কিত তথ্য খুঁজে পাওয়া যায়নি। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।",
  },
  {
    match: /token expired|jwt expired/i,
    message: "লগইনের মেয়াদ শেষ হয়ে গেছে। দয়া করে পেজ রিফ্রেশ করে আবার লগইন করুন।",
  },
];

function rawText(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const o = err as { message?: unknown; error_description?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    return [o.message, o.error_description, o.details, o.hint, o.code]
      .filter((v) => typeof v === "string" || typeof v === "number")
      .join(" ");
  }
  return "";
}

/** যেকোনো এরর নিয়ে ইউজারের জন্য পরিষ্কার বাংলা বাক্য ফেরত দেয়। */
export function bnError(
  err: unknown,
  fallback = "দুঃখিত, কাজটি সম্পন্ন করা যায়নি। একটু পরে আবার চেষ্টা করুন।",
): string {
  const text = rawText(err);
  if (!text) return fallback;

  // If the error message ALREADY contains Bengali text, return it directly!
  if (/[\u0980-\u09FF]/.test(text)) {
    return text;
  }

  for (const rule of COMMON_RULES) {
    if (rule.match.test(text)) return rule.message;
  }

  return fallback;
}

/** লগইন/সাইনআপের এররকে বাংলায় রূপ দেয়। */
export function bnAuthError(err: unknown): string {
  const text = rawText(err);
  if (/[\u0980-\u09FF]/.test(text)) return text;
  for (const rule of [...AUTH_RULES, ...COMMON_RULES]) if (rule.match.test(text)) return rule.message;
  return "লগইন করা যাচ্ছে না। তথ্যগুলো আবার দেখে চেষ্টা করুন।";
}

/** অর্ডার ফর্মের জন্য নির্দিষ্ট মেসেজ। */
export function bnOrderError(err: unknown): string {
  return bnError(
    err,
    "অর্ডারটি পাঠানো যায়নি। ইন্টারনেট দেখে আবার “অর্ডার করুন” বাটনে চাপ দিন, অথবা আমাদের ফোন করুন।",
  );
}
