import { useEffect, useRef } from "react";
import { useApp } from "./core";
import { adUnits, type AdPlacement } from "./ad-units";
import { adsEnabled, mountAd } from "./ads-runtime.mjs";
import "./ads.css";

const labels = {
  en: "Advertisement",
  zh: "广告",
  ja: "広告",
  ko: "광고",
  de: "Werbung",
  fr: "Publicité",
};

export function AdSlot({ placement }: { placement: AdPlacement }) {
  const { locale } = useApp();
  const container = useRef<HTMLDivElement>(null);
  const unit = adUnits[placement];

  useEffect(() => {
    const target = container.current;
    if (!target || !adsEnabled(import.meta.env.PROD, location.hostname)) return;
    let cleanup: (() => void) | undefined;
    const load = () => { cleanup = mountAd(target, unit); };
    if (!("IntersectionObserver" in window)) {
      load();
      return () => cleanup?.();
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: "200px" });
    observer.observe(target);
    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, [unit]);

  return (
    <aside className={`ad-slot ad-slot--${placement}`} aria-label={labels[locale]}>
      <span className="ad-slot__label">{labels[locale]}</span>
      <div className="ad-slot__content" ref={container} />
    </aside>
  );
}
