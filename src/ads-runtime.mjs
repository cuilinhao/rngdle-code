const mounted = new WeakMap();
const bannerQueue = [];
const nativeScripts = new WeakMap();
let activeBanner = null;

export function adsEnabled(production, hostname) {
  return production === true && (hostname === 'rngdle.art' || hostname === 'www.rngdle.art');
}

function startNextBanner() {
  if (activeBanner) return;
  let entry;
  while ((entry = bannerQueue.shift())) {
    if (entry.cancelled || !entry.container.isConnected) {
      entry.cleanup();
      continue;
    }
    activeBanner = entry;
    const { unit, container } = entry;
    window.atOptions = {
      key: unit.key,
      format: 'iframe',
      height: unit.height,
      width: unit.width,
      params: {},
    };
    const script = document.createElement('script');
    script.src = unit.src;
    script.type = 'text/javascript';
    // Keep atOptions stable until execution has finished, even if React removes
    // this slot. Removing a script does not reliably cancel its network request.
    const settled = () => {
      if (activeBanner !== entry) return;
      script.onload = script.onerror = null;
      activeBanner = null;
      startNextBanner();
    };
    script.onload = script.onerror = settled;
    container.append(script);
    return;
  }
}

export function mountAd(container, unit) {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !container) return () => {};
  const existing = mounted.get(container);
  if (existing) return existing.cleanup;
  const entry = { container, unit, cancelled: false, cleanup: null };
  entry.cleanup = () => {
    if (entry.cancelled) return;
    entry.cancelled = true;
    container.replaceChildren();
    mounted.delete(container);
    // Queued slots are skipped when the current script settles. Cleanup must
    // not release an executing script's shared options early.
  };
  mounted.set(container, entry);
  if (unit.format === 'native') {
    const target = document.createElement('div');
    target.id = 'container-' + unit.key;
    container.append(target);
    let registry = nativeScripts.get(document);
    if (!registry) {
      registry = new Map();
      nativeScripts.set(document, registry);
    }
    if (!registry.has(unit.key)) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = unit.src;
      script.onerror = () => {
        if (registry.get(unit.key) !== script) return;
        registry.delete(unit.key);
        script.remove();
      };
      registry.set(unit.key, script);
      // The native vendor initializes once per key and watches SPA navigation.
      // Keep its script outside React's slot while targets come and go.
      document.body.append(script);
    }
  } else {
    bannerQueue.push(entry);
    startNextBanner();
  }
  return entry.cleanup;
}
