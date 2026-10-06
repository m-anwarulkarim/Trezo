export function detectTrafficSource(): string {
  if (typeof window === "undefined") return "website";

  try {
    const saved = sessionStorage.getItem("traffic_source");
    if (saved) return saved;

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source")?.toLowerCase();
    const fbclid = urlParams.get("fbclid");
    const gclid =
      urlParams.get("gclid") ||
      urlParams.get("wbraid") ||
      urlParams.get("gbraid");
    const ttclid = urlParams.get("ttclid");

    const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "").toLowerCase();
    const isFbBrowser =
      ua.includes("fban") ||
      ua.includes("fbav") ||
      ua.includes("instagram") ||
      ua.includes("fb_iab") ||
      ua.includes("fb4a");

    let source = "website";

    if (isFbBrowser) {
      source = "facebook";
    } else if (utmSource) {
      if (
        utmSource.includes("fb") ||
        utmSource.includes("facebook") ||
        utmSource.includes("ig") ||
        utmSource.includes("instagram") ||
        utmSource.includes("meta")
      ) {
        source = "facebook";
      } else if (utmSource.includes("google") || utmSource.includes("gads")) {
        source = "google";
      } else if (utmSource.includes("tiktok")) {
        source = "tiktok";
      } else {
        source = utmSource;
      }
    } else if (fbclid) {
      source = "facebook";
    } else if (gclid) {
      source = "google";
    } else if (ttclid) {
      source = "tiktok";
    } else if (document.referrer) {
      const ref = document.referrer.toLowerCase();
      if (
        ref.includes("facebook.com") ||
        ref.includes("fb.com") ||
        ref.includes("instagram.com") ||
        ref.includes("fb.me") ||
        ref.includes("m.facebook.com") ||
        ref.includes("l.facebook.com") ||
        ref.includes("lm.facebook.com")
      ) {
        source = "facebook";
      } else if (
        ref.includes("google.com") ||
        ref.includes("googlesyndication") ||
        ref.includes("google.com.bd")
      ) {
        source = "google";
      } else if (ref.includes("tiktok.com")) {
        source = "tiktok";
      } else if (ref.includes("youtube.com")) {
        source = "youtube";
      }
    }

    sessionStorage.setItem("traffic_source", source);
    return source;
  } catch {
    return "website";
  }
}
