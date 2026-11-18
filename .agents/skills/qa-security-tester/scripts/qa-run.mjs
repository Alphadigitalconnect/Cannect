#!/usr/bin/env node
// CAnnect QA & Security test runner.
//
//   node .agents/skills/qa-security-tester/scripts/qa-run.mjs [options]
//
// Options:
//   --base-url <url>   Dev server for runtime probes (default http://localhost:3000)
//   --no-runtime       Skip runtime probes even if a server is running
//   --full             Also run `next build` (slow, catches build-only errors)
//   --init-baseline    Record ALL current findings as the known-issue backlog
//   --allow-remote     Allow runtime probes against non-localhost (NOT recommended)
//
// Exit code 0 = PASS (no NEW medium+ findings, typecheck clean), 1 = FAIL.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeFingerprint, findRepoRoot } from "./lib/fingerprint.mjs";
import { runSecurityScan, SEV_ORDER } from "./lib/security-scan.mjs";
import { runApiProbes, isServerUp } from "./lib/api-probe.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(__dirname);
const qaDir = join(repoRoot, ".agents", ".qa");
const reportsDir = join(qaDir, "reports");
const baselinePath = join(repoRoot, ".agents", "qa-baseline.json");
mkdirSync(reportsDir, { recursive: true });

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const BASE = opt("--base-url", process.env.QA_BASE_URL || "http://localhost:3000");

const log = (...a) => console.log(...a);
const sh = (cmd, timeoutMs = 300000) => {
  const r = spawnSync(cmd, { cwd: repoRoot, shell: true, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: timeoutMs });
  return { code: r.status ?? 1, out: (r.stdout || "") + (r.stderr || "") };
};

const findings = [];
const checks = []; // { name, status: pass|fail|skip|warn, detail }
const ranSources = new Set(["static"]);

// ---------- 1. TypeScript ----------
log("▶ TypeScript typecheck…");
{
  const r = sh("npx tsc --noEmit --pretty false -p .");
  const errs = r.out.split(/\r?\n/).filter((l) => /error TS\d+/.test(l));
  ranSources.add("typecheck");
  if (r.code !== 0 && errs.length) {
    const byFile = {};
    for (const e of errs) {
      const m = e.match(/^(.+?)\((\d+),\d+\): (error TS\d+: .*)$/);
      const file = m ? m[1].replace(/\\/g, "/") : "unknown";
      (byFile[file] ||= []).push(m ? `L${m[2]} ${m[3]}` : e);
    }
    for (const [file, list] of Object.entries(byFile)) {
      findings.push({ id: `typecheck:${file}`, source: "typecheck", rule: "typecheck", severity: "high", file, lines: [], message: `${list.length} TypeScript error(s): ${list.slice(0, 3).join(" | ")}`, fix: "Fix the type errors." });
    }
    checks.push({ name: "TypeScript", status: "fail", detail: `${errs.length} error(s)` });
  } else if (r.code !== 0) {
    checks.push({ name: "TypeScript", status: "warn", detail: "tsc exited non-zero: " + r.out.slice(0, 300) });
  } else checks.push({ name: "TypeScript", status: "pass", detail: "0 errors" });
}

// ---------- 2. ESLint ----------
log("▶ ESLint…");
{
  const r = sh("npx next lint --dir src --format json");
  ranSources.add("lint");
  const start = r.out.indexOf("[");
  let parsed = null;
  try { parsed = JSON.parse(r.out.slice(start, r.out.lastIndexOf("]") + 1)); } catch {}
  if (parsed) {
    let errors = 0, warnings = 0;
    for (const f of parsed) {
      errors += f.errorCount; warnings += f.warningCount;
      if (f.errorCount) {
        const rel = f.filePath.replace(/\\/g, "/").replace(repoRoot.replace(/\\/g, "/") + "/", "");
        const msgs = f.messages.filter((m) => m.severity === 2);
        findings.push({ id: `lint:${rel}`, source: "lint", rule: "lint", severity: "medium", file: rel, lines: msgs.map((m) => m.line), message: `${msgs.length} lint error(s): ${msgs.slice(0, 3).map((m) => `${m.ruleId}: ${m.message}`).join(" | ")}`, fix: "Fix lint errors." });
      }
    }
    checks.push({ name: "ESLint", status: errors ? "fail" : warnings ? "warn" : "pass", detail: `${errors} error(s), ${warnings} warning(s)` });
  } else {
    checks.push({ name: "ESLint", status: r.code === 0 ? "pass" : "warn", detail: r.code === 0 ? "clean" : "Could not parse lint output: " + r.out.slice(0, 200) });
  }
}

// ---------- 3. Static security scan ----------
log("▶ Static security scan…");
{
  const s = runSecurityScan(repoRoot);
  findings.push(...s);
  checks.push({ name: "Static security scan", status: s.some((f) => SEV_ORDER[f.severity] >= 2) ? "fail" : "pass", detail: `${s.length} finding(s)` });
}

// ---------- 4. Dependency audit ----------
log("▶ npm audit (production deps)…");
{
  const r = sh("npm audit --omit=dev --json", 120000);
  ranSources.add("deps");
  try {
    const j = JSON.parse(r.out.slice(r.out.indexOf("{")));
    const vulns = j.vulnerabilities || {};
    let n = 0;
    for (const [pkg, v] of Object.entries(vulns)) {
      const sev = v.severity === "moderate" ? "medium" : v.severity;
      if (!SEV_ORDER[sev] || SEV_ORDER[sev] < 2) continue;
      n++;
      const via = (v.via || []).filter((x) => typeof x === "object").map((x) => x.title).slice(0, 2).join("; ");
      findings.push({ id: `npm-audit:${pkg}`, source: "deps", rule: "npm-audit", severity: sev, file: "package.json", lines: [], message: `${pkg} (${v.range}) ${via || "vulnerable dependency"}`, fix: v.fixAvailable ? `Upgrade: ${typeof v.fixAvailable === "object" ? `${v.fixAvailable.name}@${v.fixAvailable.version}` : "npm audit fix"}` : "No fix available; evaluate/replace." });
    }
    checks.push({ name: "Dependency audit", status: n ? "fail" : "pass", detail: `${n} medium+ vulnerable package(s)` });
  } catch {
    checks.push({ name: "Dependency audit", status: "warn", detail: "npm audit unavailable (offline?)" });
    ranSources.delete("deps");
  }
}

// ---------- 5. Runtime probes ----------
let probePassed = [];
if (flag("--no-runtime")) checks.push({ name: "Runtime probes", status: "skip", detail: "--no-runtime" });
else {
  log(`▶ Runtime probes against ${BASE}…`);
  if (await isServerUp(BASE)) {
    try {
      const { findings: rf, passed } = await runApiProbes(BASE, { allowRemote: flag("--allow-remote") });
      findings.push(...rf);
      probePassed = passed;
      ranSources.add("runtime");
      checks.push({ name: "Runtime probes", status: rf.some((f) => SEV_ORDER[f.severity] >= 2) ? "fail" : "pass", detail: `${passed.length} passed, ${rf.length} finding(s)` });
    } catch (e) {
      checks.push({ name: "Runtime probes", status: "skip", detail: String(e.message) });
    }
  } else checks.push({ name: "Runtime probes", status: "skip", detail: `No server at ${BASE} (start \`npm run dev\` to enable)` });
}

// ---------- 6. Production build (optional) ----------
if (flag("--full")) {
  log("▶ next build…");
  const r = sh("npx next build", 900000);
  ranSources.add("build");
  if (r.code !== 0) {
    findings.push({ id: "build:next", source: "build", rule: "build", severity: "high", file: "", lines: [], message: "next build failed: " + r.out.split(/\r?\n/).filter((l) => /error|Error/.test(l)).slice(0, 5).join(" | "), fix: "Fix build errors." });
    checks.push({ name: "Production build", status: "fail", detail: "failed" });
  } else checks.push({ name: "Production build", status: "pass", detail: "ok" });
}

// ---------- Baseline diff ----------
let baseline = { description: "Known-issue backlog. Items here do not fail QA. Only add with explicit user approval.", issues: [] };
if (existsSync(baselinePath)) baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
if (flag("--init-baseline")) {
  const now = new Date().toISOString().slice(0, 10);
  const known = new Set(baseline.issues.map((i) => i.id));
  for (const f of findings) if (!known.has(f.id) && f.source !== "typecheck") baseline.issues.push({ id: f.id, severity: f.severity, message: f.message, fix: f.fix, addedAt: now });
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n");
  log(`✔ Baseline written with ${baseline.issues.length} known issue(s) → ${baselinePath}`);
}
const baseIds = new Set(baseline.issues.map((i) => i.id));
const curIds = new Set(findings.map((f) => f.id));
const newFindings = findings.filter((f) => !baseIds.has(f.id));
const knownFindings = findings.filter((f) => baseIds.has(f.id));
const resolved = baseline.issues.filter((i) => !curIds.has(i.id) && ranSources.has(sourceOf(i.id)));
function sourceOf(id) {
  const r = id.split(":")[0];
  if (r === "typecheck") return "typecheck";
  if (r === "lint") return "lint";
  if (r === "npm-audit") return "deps";
  if (r === "build") return "build";
  if (/^(page-|not-found|runtime-|admin-open|idor-|unauth-|login-|malformed|no-rate|reflected)/.test(r)) return "runtime";
  return "static";
}

const blocking = newFindings.filter((f) => SEV_ORDER[f.severity] >= 2);
const passed = blocking.length === 0;

// ---------- Report ----------
const fp = computeFingerprint(repoRoot);
const ts = new Date();
const icon = { pass: "✅", fail: "❌", skip: "⏭️", warn: "⚠️" };
const sevIcon = { critical: "🟥", high: "🟧", medium: "🟨", low: "🟦", info: "⬜" };
const row = (f) => `| ${sevIcon[f.severity]} ${f.severity} | \`${f.rule}\` | ${f.file ? `\`${f.file}\`${f.lines?.length ? ` L${f.lines.slice(0, 5).join(",")}` : ""}` : "—"} | ${f.message} | ${f.fix} |`;
const table = (list) => list.length ? `| Severity | Rule | Location | Problem | Fix |\n|---|---|---|---|---|\n${list.map(row).join("\n")}` : "_None._";

const md = `# QA & Security Report — ${passed ? "✅ PASS" : "❌ FAIL"}

- **Run:** ${ts.toISOString()}
- **Code fingerprint:** \`${fp.fingerprint}\` (${fp.files.length} changed file(s))
- **New blocking findings (medium+):** ${blocking.length}
- **Known backlog items still open:** ${knownFindings.length}
- **Backlog items resolved this run:** ${resolved.length}

## Checks
| Check | Result | Detail |
|---|---|---|
${checks.map((c) => `| ${c.name} | ${icon[c.status]} ${c.status} | ${c.detail} |`).join("\n")}

## 🆕 New findings (introduced since baseline — must fix)
${table(newFindings)}

## 🎉 Resolved backlog items (remove from qa-baseline.json)
${resolved.length ? resolved.map((r) => `- \`${r.id}\``).join("\n") : "_None._"}

## 📋 Known backlog (pre-existing, tracked in .agents/qa-baseline.json)
${table(knownFindings)}

${probePassed.length ? `## Runtime probes passed\n${probePassed.map((p) => `- ${p}`).join("\n")}\n` : ""}
## Manual / browser feature tests
Static and runtime checks above do not click through the UI. Follow
\`.agents/skills/qa-security-tester/references/feature-checklist.md\` with the browser subagent for affected features.
`;

writeFileSync(join(reportsDir, "latest.md"), md);
writeFileSync(join(reportsDir, `report-${ts.toISOString().replace(/[:.]/g, "-")}.md`), md);
writeFileSync(join(reportsDir, "latest.json"), JSON.stringify({ passed, fingerprint: fp.fingerprint, checks, newFindings, knownFindings, resolved }, null, 2));

const statePath = join(qaDir, "state.json");
let state = {};
try { state = JSON.parse(readFileSync(statePath, "utf8")); } catch {}
writeFileSync(statePath, JSON.stringify({ ...state, lastRun: { fingerprint: fp.fingerprint, passed, at: ts.toISOString(), blocking: blocking.length }, consecutiveBlocks: 0 }, null, 2));

// ---------- Console summary ----------
log("\n================ QA SUMMARY ================");
for (const c of checks) log(`${icon[c.status]} ${c.name.padEnd(22)} ${c.detail}`);
log(`\nNew findings: ${newFindings.length} (blocking: ${blocking.length}) | Known backlog: ${knownFindings.length} | Resolved: ${resolved.length}`);
for (const f of newFindings) log(`  ${sevIcon[f.severity]} [${f.severity}] ${f.id} — ${f.message}`);
log(`\nReport: ${join(reportsDir, "latest.md")}`);
log(passed ? "RESULT: PASS ✅" : "RESULT: FAIL ❌ — fix the new findings and re-run.");
process.exit(passed ? 0 : 1);
