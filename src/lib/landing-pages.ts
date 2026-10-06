export interface LandingPage {
  id: string;
  title: string;
  path: string;
  description: string;
}

interface RouteModule {
  landingPageMeta?: {
    title?: string;
    description?: string;
  };
}

// Automatically glob all landing page route files
const modules = import.meta.glob<RouteModule>(
  [
    "/src/routes/index.tsx",
    "/src/routes/lp.*.tsx",
    "/src/routes/lp/**/*.tsx",
  ],
  { eager: true }
);

function convertFilePathToPath(filePath: string): { path: string; id: string } {
  // Normalize Windows & POSIX path slashes
  const normalized = filePath.replace(/\\/g, "/");
  const cleanPath = normalized
    .replace(/^.*\/src\/routes\//, "")
    .replace(/\.tsx$/, "");

  if (cleanPath === "index") {
    return { path: "/", id: "tap-filter" };
  }

  // Handle dot notation e.g. "lp.foil-bag-2" -> "/lp/foil-bag-2"
  const urlPath = "/" + cleanPath.replace(/\./g, "/");
  const id = cleanPath.replace(/^lp[\.\/]/, "").replace(/[\.\/]/g, "-");

  return { path: urlPath, id };
}

function formatTitleFromId(id: string): string {
  if (id === "tap-filter" || id === "index") return "প্রধান ল্যান্ডিং পেজ (Tap Filter)";
  return (
    id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") + " Landing Page"
  );
}

// Known default metadata for existing pages if not explicitly exported in route file
const knownDefaults: Record<string, { title: string; description: string }> = {
  "/": {
    title: "ওয়াটার ফসেট ট্যাপ ফিল্টার (Tap Filter)",
    description: "পরিষ্কার ও বিশুদ্ধ পানির নিশ্চয়তা। ক্যাশ অন ডেলিভারি, ৭ দিনের রিটার্ন।",
  },
  "/lp/foil-bag": {
    title: "অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ (Foil Bag)",
    description: "এয়ারটাইট জিপ লক, ১০০% লিকপ্রুফ, ফ্রিজার সেফ ও রিইউজেবল ব্যাগ।",
  },
  "/lp/foil-bag-2": {
    title: "অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ (Foil Bag 2)",
    description: "ভিডিও শর্টস সহ অ্যালুমিনিয়াম ফয়েল জিপলক ব্যাগ ল্যান্ডিং পেজ।",
  },
};

export const landingPages: LandingPage[] = Object.entries(modules).map(
  ([filePath, mod]) => {
    const { path, id } = convertFilePathToPath(filePath);
    const meta = mod.landingPageMeta;
    const fallback = knownDefaults[path] || {
      title: formatTitleFromId(id),
      description: `ল্যান্ডিং পেজ লিঙ্ক: ${path}`,
    };

    return {
      id,
      path,
      title: meta?.title || fallback.title,
      description: meta?.description || fallback.description,
    };
  }
);

