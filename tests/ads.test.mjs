import { test } from 'node:test';
import assert from 'node:assert/strict';
let caseId = 0;

async function browser(t) {
  const oldWindow = globalThis.window, oldDocument = globalThis.document;
  class Element {
    children = [];
    isConnected = true;
    constructor(tagName) { this.tagName = tagName.toUpperCase(); }
    append(...children) { for (const child of children) if (typeof child === 'object') child.parentNode = this; this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this[name] = value; }
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); }
  }
  globalThis.window = {};
  globalThis.document = { createElement: (tag) => new Element(tag), body: new Element('body') };
  t.after(() => {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
  });
  return { ...await import(`../src/ads-runtime.mjs?test=${++caseId}`), container: () => new Element('section') };
}
const banner = (key) => ({ key, src: `https://ads.example/${key}/invoke.js`, format: 'banner', width: 320, height: 50 });

test('ads load only for production exact apex and www hosts', async (t) => {
  const { adsEnabled } = await browser(t);
  assert.equal(adsEnabled(true, 'rngdle.art'), true);
  assert.equal(adsEnabled(true, 'www.rngdle.art'), true);
  for (const host of ['localhost', 'rngdle.art.example', 'demo.vercel.app', '']) assert.equal(adsEnabled(true, host), false);
  assert.equal(adsEnabled(false, 'rngdle.art'), false);
});

test('banner scripts serialize their options and errors release the next slot', async (t) => {
  const { mountAd, container } = await browser(t);
  const a = container(), b = container();
  mountAd(a, banner('a')); mountAd(b, banner('b'));
  assert.deepEqual(window.atOptions, { key: 'a', format: 'iframe', width: 320, height: 50, params: {} });
  assert.equal(a.children[0].src, banner('a').src);
  assert.equal(b.children.length, 0);
  a.children[0].onerror();
  assert.equal(window.atOptions.key, 'b');
  assert.equal(b.children[0].src, banner('b').src);
  b.children[0].onload();
});

test('duplicate mounts do not add scripts and cleanup clears only the owned container', async (t) => {
  const { mountAd, container } = await browser(t);
  const a = container(), outside = container();
  outside.append('untouched');
  const clean = mountAd(a, banner('a'));
  mountAd(a, banner('a'));
  assert.equal(a.children.length, 1);
  a.children[0].onload();
  a.append('vendor frame'); clean(); clean();
  assert.equal(a.children.length, 0);
  assert.deepEqual(outside.children, ['untouched']);
});

test('cancelled and detached pending banners never execute', async (t) => {
  const { mountAd, container } = await browser(t);
  const a = container(), b = container(), c = container(), d = container();
  mountAd(a, banner('a'));
  const cancel = mountAd(b, banner('b'));
  mountAd(c, banner('c')); mountAd(d, banner('d'));
  cancel(); c.isConnected = false;
  a.children[0].onload();
  assert.equal(b.children.length, 0); assert.equal(c.children.length, 0);
  assert.equal(window.atOptions.key, 'd');
  d.children[0].onload();
});

test('cleanup of in-flight banner does not release options until its script settles', async (t) => {
  const { mountAd, container } = await browser(t);
  const a = container(), b = container();
  const cancel = mountAd(a, banner('a')), script = a.children[0];
  mountAd(b, banner('b')); cancel();
  assert.equal(a.children.length, 0); assert.equal(b.children.length, 0);
  assert.equal(window.atOptions.key, 'a');
  script.onload();
  assert.equal(window.atOptions.key, 'b');
  b.children[0].onload();
});

test('native uses exact vendor target and asynchronous script without modifying banner options', async (t) => {
  const { mountAd, container } = await browser(t);
  const a = container(); window.atOptions = { key: 'existing' };
  const clean = mountAd(a, { key: 'native-key', src: 'https://ads.example/native/invoke.js', format: 'native' });
  assert.equal(a.children[0].id, 'container-native-key');
  assert.equal(document.body.children[0].src, 'https://ads.example/native/invoke.js');
  assert.equal(document.body.children[0].async, true);
  assert.equal(document.body.children[0]['data-cfasync'], 'false');
  assert.deepEqual(window.atOptions, { key: 'existing' });
  clean(); assert.equal(a.children.length, 0);
});

test('SSR without browser globals is a safe no-op', async (t) => {
  const { mountAd } = await browser(t);
  delete globalThis.window; delete globalThis.document;
  assert.doesNotThrow(() => mountAd(null, banner('a'))());
});

const native = { key: 'native-key', src: 'https://ads.example/native/invoke.js', format: 'native' };

test('native pending script survives cleanup and remount without duplicate initialization', async (t) => {
  const { mountAd, container } = await browser(t);
  const first = container(), second = container();
  const clean = mountAd(first, native), script = document.body.children[0];
  assert.equal(document.body.children.length, 1);
  clean();
  mountAd(second, native);
  assert.equal(first.children.length, 0);
  assert.equal(second.children[0].id, 'container-native-key');
  assert.deepEqual(document.body.children, [script]);
});

test('failed native request is removed and a later remount may try again', async (t) => {
  const { mountAd, container } = await browser(t);
  const clean = mountAd(container(), native), failed = document.body.children[0];
  assert.ok(failed);
  failed.onerror();
  assert.equal(document.body.children.length, 0);
  clean();
  mountAd(container(), native);
  assert.equal(document.body.children.length, 1);
  assert.notEqual(document.body.children[0], failed);
  assert.equal(document.body.children[0].src, 'https://ads.example/native/invoke.js');
});
