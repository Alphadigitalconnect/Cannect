// Computes a stable fingerprint of the working tree's *application* changes.
// Used by qa-run.mjs (to stamp a QA run) and by the Stop hook (to detect
// code that changed after the last QA run).
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Paths that are QA tooling / docs and should not invalidate a QA run.
const IGNORED = [/^\.agents\//, /^AGENTS\.md$/, /\.md$/i, /^\.next\//, /^node_modules\//];

function git(cmd, cwd) {
  return execSync(`git ${cmd}`, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

export function computeFingerprint(repoRoot) {
  const hash = createHash("sha256");
  let head = "no-head";
  try {
    head = git("rev-parse HEAD", repoRoot).trim();
  } catch {}
  hash.update(head);

  let status = "";
  try {
    status = git("status --porcelain=v1 -uall", repoRoot);
  } catch {
    return { fingerprint: "no-git", files: [] };
  }

  const files = status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => ({ code: l.slice(0, 2), path: l.slice(3).replace(/^"|"$/g, "").split(" -> ").pop() }))
    .filter((f) => !IGNORED.some((re) => re.test(f.path)))
    .sort((a, b) => a.path.localeCompare(b.path));

  for (const f of files) {
    hash.update(`\n${f.code}:${f.path}:`);
    const abs = join(repoRoot, f.path);
    if (existsSync(abs) && statSync(abs).isFile() && statSync(abs).size < 5_000_000) {
      hash.update(readFileSync(abs));
    }
  }
  return { fingerprint: hash.digest("hex").slice(0, 16), files: files.map((f) => f.path) };
}

export function findRepoRoot(start) {
  try {
    return git("rev-parse --show-toplevel", start).trim();
  } catch {
    return start;
  }
}
