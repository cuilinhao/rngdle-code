export const GA_MEASUREMENT_ID = "G-FN1KFQ0VMX";

let lastPathname;
let previousLocation = "";

export function trackPageView(isProduction, measurementId = GA_MEASUREMENT_ID) {
  if (
    !isProduction ||
    !/^G-[A-Z0-9]{10}$/.test(measurementId) ||
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window.location.protocol !== "https:" ||
    !["rngdle.art", "www.rngdle.art"].includes(window.location.hostname) ||
    lastPathname === window.location.pathname
  ) return;

  const pageLocation = window.location.origin + window.location.pathname;
  let pageReferrer = previousLocation;
  if (!pageReferrer) {
    try {
      const referrer = new URL(document.referrer);
      pageReferrer = referrer.origin + referrer.pathname;
    } catch {}
  }
  const page = {
    page_location: pageLocation,
    page_referrer: pageReferrer,
    page_title: document.title,
  };
  if (!previousLocation) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
  }
  // Keep automatic session/engagement events on the same query-free URLs.
  window.gtag("set", page);
  if (!previousLocation) {
    // Disable GA's enhanced history pageviews too, or SPA views are counted twice.
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    document.head.append(script);
  }
  window.gtag("event", "page_view", page);
  lastPathname = window.location.pathname;
  previousLocation = pageLocation;
}
