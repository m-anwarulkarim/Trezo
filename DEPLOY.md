# Cloudflare Workers এ Deploy (Trezo)

এই প্রজেক্টটি TanStack Start + Nitro দিয়ে Cloudflare Workers এর জন্য বিল্ড হয়।
`bun run build` চালালে `dist/server/wrangler.json` ও `.wrangler/deploy/config.json`
অটো তৈরি হয়, তাই আলাদা করে wrangler config লেখার দরকার নেই।

## ১) এক-বার করার সেটআপ (GitHub Secrets)

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
এ নিচের secret গুলো যোগ করুন:

| Secret | কোথায় পাবেন |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → **Edit Cloudflare Workers** টেমপ্লেট |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Workers & Pages → ডান পাশে Account ID |
| `VITE_SUPABASE_URL` | Lovable প্রজেক্টের `.env` ফাইলে আছে |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` ফাইলে আছে |
| `VITE_SUPABASE_PROJECT_ID` | `.env` ফাইলে আছে |
| `SUPABASE_URL` | `.env` ফাইলে আছে |
| `SUPABASE_PUBLISHABLE_KEY` | `.env` ফাইলে আছে |
| `SUPABASE_PROJECT_ID` | `.env` ফাইলে আছে |
| `SUPABASE_SERVICE_ROLE_KEY` | (ঐচ্ছিক) শুধু দরকার হলে |

## ২) অটো ডেপ্লয়

`main` ব্রাঞ্চে push হলেই `.github/workflows/deploy.yml` চলবে — build হবে,
তারপর Worker নাম `trezo` দিয়ে Cloudflare এ deploy হয়ে যাবে।
ম্যানুয়ালি চালাতে: GitHub → Actions → *Deploy to Cloudflare Workers* → Run workflow।

## ৩) লোকালি ডেপ্লয় (ঐচ্ছিক)

```bash
bunx wrangler login
bun run deploy
```

## ৪) ডোমেইন

Cloudflare Dashboard → Workers & Pages → `trezo` → Settings → Domains & Routes
থেকে custom domain যোগ করুন।

## নোট

- Worker এর নাম বদলাতে `deploy.yml` এর `--name trezo` আর `package.json` এর
  `deploy` স্ক্রিপ্ট দুই জায়গায় বদলান।
- `VITE_*` ভেরিয়েবল build-time এ লাগে, বাকিগুলো runtime secret হিসেবে
  Worker এ সেট হয়।
