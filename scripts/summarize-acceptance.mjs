// Turn remote-acceptance outputs into GitHub annotations so results can be read
// through the checks API without downloading logs or artifacts.
import { existsSync, readFileSync } from "node:fs";

const esc = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "").replace(/\n/g, "%0A");
const load = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const lines = [];
const errors = [];

const hosts = load("verification/host-comparison.json");
if (hosts) {
  lines.push(`hosts: ${hosts.pathCount} paths, ${hosts.failures.length} failures (base ${hosts.base}, reference ${hosts.reference})`);
  const byName = {};
  for (const f of hosts.failures) (byName[f.name] ??= []).push(f);
  for (const [name, list] of Object.entries(byName))
    errors.push(`hosts/${name} (${list.length}): ` + list.slice(0, 25).map((f) => JSON.stringify(f)).join(" | "));
} else lines.push("hosts: no report");

const content = load("verification/release-production-http.json");
if (content) {
  lines.push(`content: ${content.passed} passed, ${content.failed.length} failed; checks ${content.checkSummary.passed}/${content.checkSummary.passed + content.checkSummary.failed}`);
  const failed = content.failed.map((item) => ({ path: item.path, checks: item.checks.filter((c) => !c.pass).map((c) => c.name) }));
  if (failed.length) errors.push(`content (${failed.length}): ` + failed.slice(0, 40).map((f) => `${f.path}[${f.checks.join(",")}]`).join(" "));
} else lines.push("content: no report");

const browser = load("verification/browser-results.json");
if (browser) {
  const s = browser.stats || {};
  lines.push(`browser: expected ${s.expected ?? "?"}, unexpected ${s.unexpected ?? "?"}, flaky ${s.flaky ?? "?"}, skipped ${s.skipped ?? "?"}`);
  const failedTitles = [];
  const walk = (suite, prefix) => {
    for (const spec of suite.specs || [])
      for (const test of spec.tests || [])
        if (test.status === "unexpected")
          failedTitles.push(`${prefix}${spec.title}: ${(test.results?.at(-1)?.error?.message || "").split("\n")[0].slice(0, 200)}`);
    for (const child of suite.suites || []) walk(child, `${prefix}${child.title} > `);
  };
  for (const suite of browser.suites || []) walk(suite, `${suite.title} > `);
  if (failedTitles.length) errors.push(`browser (${failedTitles.length}): ` + failedTitles.slice(0, 20).join(" | "));
} else lines.push("browser: no report");

console.log(`::notice title=Acceptance summary::${esc(lines.join("\n"))}`);
for (const e of errors.slice(0, 9)) console.log(`::error title=Acceptance failure::${esc(e.slice(0, 60000))}`);
