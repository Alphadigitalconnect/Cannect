#!/usr/bin/env node
// Stop hook: prevents the agent from finishing a turn if application code
// changed since the last QA run, or if the last QA run FAILED.
// Safety valve: after 3 consecutive blocks it lets the agent stop so it can
// report back to the user instead of looping forever.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeFingerprint, findRepoRoot } from "../skills/qa-security-tester/scripts/lib/fingerprint.mjs";

const MAX_BLOCKS = 3;
const out = (o) => { process.stdout.write(JSON.stringify(o)); process.exit(0); };

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch {}

try {
  if (input.terminationReason && input.terminationReason !== "model_stop") out({ decision: "allow" });
  if (process.env.QA_GATE_DISABLED === "1") out({ decision: "allow" });

  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = findRepoRoot(input.workspacePaths?.[0] || here);
  const qaDir = join(repoRoot, ".agents", ".qa");
  mkdirSync(qaDir, { recursive: true });
  const statePath = join(qaDir, "state.json");
  let state = {};
  try { state = JSON.parse(readFileSync(statePath, "utf8")); } catch {}

  const { fingerprint, files } = computeFingerprint(repoRoot);
  const last = state.lastRun;
  const save = (s) => writeFileSync(statePath, JSON.stringify(s, null, 2));

  let reason = null;
  if (!last || last.fingerprint !== fingerprint) {
    reason = `QA GATE: application code changed since the last QA run (${files.length} changed file(s)). ` +
      `Before finishing, act as the QA & Security tester: read .agents/skills/qa-security-tester/SKILL.md, run ` +
      `\`node .agents/skills/qa-security-tester/scripts/qa-run.mjs\`, browser-test the affected features, fix any NEW findings, and re-run until it passes.`;
  } else if (!last.passed) {
    reason = `QA GATE: the last QA run FAILED with ${last.blocking} new blocking finding(s). ` +
      `Read .agents/.qa/reports/latest.md, fix the new findings (do NOT add them to the baseline without user approval), then re-run qa-run.mjs.`;
  }

  if (!reason) { save({ ...state, consecutiveBlocks: 0 }); out({ decision: "allow" }); }

  const blocks = (state.consecutiveBlocks || 0) + 1;
  if (blocks > MAX_BLOCKS) {
    save({ ...state, consecutiveBlocks: 0 });
    out({ decision: "allow", reason: "QA gate gave up after repeated blocks; tell the user QA is not green." });
  }
  save({ ...state, consecutiveBlocks: blocks });
  out({ decision: "continue", reason: `${reason} (gate attempt ${blocks}/${MAX_BLOCKS})` });
} catch (e) {
  // Never brick the agent because of a hook bug.
  out({ decision: "allow", reason: `qa-stop-gate error: ${e?.message || e}` });
}
