// Local supplier boundary: this classic script is fetched/executed by the browser.
(() => {
  const script = document.currentScript;
  const query = new URL(script.src).searchParams;
  window.fixtureLoads ??= [];
  window.fixtureLoads.push(query.get('key'));
  if (query.get('native')) {
    const render = () => {
      const target = document.getElementById('container-' + query.get('key'));
      if (!target || target.firstChild) return;
      const banner = document.createElement('div');
      banner.textContent = 'LOCAL NATIVE AD · ' + query.get('key');
      banner.dataset.nativeBanner = query.get('key');
      target.append(banner);
    };
    // Model the supplier's persistent SPA initialization at its boundary.
    new MutationObserver(render).observe(document.body, { childList: true, subtree: true });
    addEventListener('popstate', render);
    render();
    return;
  }
  const options = { ...window.atOptions };
  const banner = document.createElement('div');
  banner.dataset.banner = options.key;
  banner.dataset.width = options.width;
  banner.dataset.height = options.height;
  banner.dataset.collision = String(options.key !== query.get('key') ||
    String(options.width) !== query.get('width') || String(options.height) !== query.get('height'));
  window.fixtureCollisions ??= [];
  if (banner.dataset.collision === 'true') window.fixtureCollisions.push(query.get('key'));
  banner.textContent = `LOCAL BANNER · ${options.key} · ${options.width} × ${options.height}`;
  script.parentElement?.append(banner);
})();
