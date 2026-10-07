# 🛍️ Trezo — E-Commerce & Order Management Hub

Trezo হলো একটি আধুনিক, ফাস্ট এবং সুসংগঠিত **E-Commerce Landing Page & Order Management System**। এটি ল্যান্ডিং পেজ থেকে কাস্টমার অর্ডার গ্রহণ করা, মেটা ইভেন্ট (Meta CAPI & Pixel) ট্র্যাক করা, পাঠাও (Pathao) কুরিয়ার API-র মাধ্যমে অটো-শিপিং ও রিয়েল-টাইম ডেলিভারি স্ট্যাটাস আপডেট করার একটি সম্পূর্ণ প্ল্যাটফর্ম।

---

## 🚀 প্রধান বৈশিষ্ট্যসমূহ (Key Features)

### 📊 **স্মার্ট অ্যাডমিন ড্যাশবোর্ড (Analytics & Real-time Overview)**
- **রিয়েল-টাইম ওভারভিউ:** ড্যাশবোর্ডে প্রতিদিনের মোট সেলস, অর্ডার সংখ্যা, কনফার্মড অর্ডার এবং রেভিনিউ ট্র্যাকিং।
- **লাইভ পারফরম্যান্স চার্ট:** ইন্টারঅ্যাক্টিভ সেলস ট্রেন্ড চার্ট ও অল-ইন-ওয়ান অর্ডার স্ট্যাটাস ব্রেকডাউন চার্ট।
- **অটো-পোলিং ও রিয়েল-টাইম ডাটা:** Supabase Realtime ও TanStack Query-র মাধ্যমে ডাটাবেজের যেকোনো পরিবর্তন মুহূর্তেই ড্যাশবোর্ডে রিফ্লেক্ট হয়।

### 📦 **অর্ডার ম্যানেজমেন্ট সিস্টেম (Order Management)**
- **অর্ডার পাইপলাইন ও ফিল্টারিং:** Pending, Confirmed, Shipped, Delivered, Hold, Cancelled, Return সহ বিভিন্ন স্ট্যাটাসে দ্রুত ফিল্টার করার সুবিধা।
- **রিপিট কাস্টমার ট্র্যাকিং:** একই ফোন নম্বর থেকে বারবার অর্ডার আসা কাস্টমার চিহ্নিত করার অপশন।
- **তারিখ অনুযায়ী কাস্টম ফিল্টার:** আজকের, গতকালের, শেষ ৭ দিন, ৩০ দিন বা কাস্টম তারিখের অর্ডার ফিল্টারিং।

### 🚚 **পাঠাও কুরিয়ার এপিআই ইন্টিগ্রেশন (Pathao Courier Integration)**
- **ওয়ান-ক্লিক কুরিয়ার এন্ট্রি:** কাস্টমারের ঠিকানা ও আইটেম অটো-রেজোলিউশন করে সরাসরি Pathao Courier API-তে অর্ডার পাঠানো।
- **অটো কুরিয়ার এন্ট্রি:** অর্ডার Confirmed হওয়ার সাথে সাথেই ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে পাঠাও-তে এন্ট্রি হওয়ার সুবিধা।
- **রিয়েল-টাইম কুরিয়ার স্ট্যাটাস সিঙ্ক (Background Auto-Sync):** পাঠাও সার্ভার থেকে পার্সেলের ডেলিভারি স্ট্যাটাস (Delivered, Returned, In Transit, Hold) ব্যাকগ্রাউন্ডে অটো-সিঙ্ক হয়ে ডাটাবেজ আপডেট হওয়ার ব্যবস্থা।

### 🎯 **মেটা ট্র্যাকিং ও পিক্সেল (Meta Pixel & Conversions API - CAPI)**
- **অটো ইভেন্ট ট্র্যাকিং:** ওয়েবসাইট থেকে কাস্টমার অর্ডার করার সাথে সাথে Browser Pixel এবং Server-side Conversions API (CAPI) এর মাধ্যমে `Purchase` ও `Lead` ইভেন্ট ট্র্যাকিং।
- **SHA-256 এনক্রিপ্টেড ডাটা:** মেটা পলিসি অনুযায়ী ফোন নম্বর ও ব্যবহারকারীর ডেটা নিরাপদে হ্যাশ করে Meta-তে পাঠানো।

---

## 🛠️ ব্যবহৃত টেকনোলজি স্ট্যাক (Tech Stack)

- **Frontend / Framework:** React, TypeScript, TanStack Router, TanStack Query (React Query), Vite / TanStack Start
- **Backend & Database:** Supabase (Postgres Database, Auth, Realtime)
- **UI Components & Styling:** TailwindCSS, Lucide Icons, Shadcn UI (Radix Primitives)
- **Courier API:** Pathao Merchant Hermes / Aladdin API
- **Analytics & Tracking:** Meta Conversions API (CAPI) & Facebook Pixel

---

## 💻 লোকাল ডেভেলপমেন্ট সেটআপ (Local Development)

```bash
# 1. রিপোজিটরি ক্লোন করুন
git clone https://github.com/m-anwarulkarim/Trezo.git

# 2. প্রজেক্ট ফোল্ডারে প্রবেশ করুন
cd trezo-home-hub

# 3. ডিপেন্ডেন্সি ইনস্টল করুন (Bun অথবা NPM দিয়ে)
npm install
# অথবা
bun install

# 4. এনভায়রনমেন্ট ভেরিয়েবল সেটআপ করুন (.env ফাইল তৈরি করে)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# 5. ডেভেলপমেন্ট সার্ভার চালু করুন
npm run dev
# অথবা
bun dev
```

---

## 📝 লাইসেন্স (License)

© 2026 **Trezo Home Hub**. All Rights Reserved. Developed by **Anwarul Karim**.
