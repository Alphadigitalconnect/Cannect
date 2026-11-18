// Static security scanner tailored to the CAnnect Next.js + Supabase codebase.
// Pure Node, no dependencies. Findings are grouped per (rule, file) so IDs are
// stable across edits and can be tracked in the known-issue baseline.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";

const SEV_ORDER = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

const AUTH_HELPER_RE = /\b(verifySession|requireAuth|requireUser|requireAdmin|getServerSession|getSessionUser|auth\.getUser|verifyJwt|jwtVerify)\b/;

// Each rule: { id, severity, appliesTo(relPath, src), pattern (RegExp, global) | check(src) => lines[], message, fix }
const RULES = [
  {
    id: "plaintext-password-compare",
    severity: "critical",
    appliesTo: (f) => f.includes("/api/"),
    pattern: /\.eq\(\s*["'`]password["'`]/g,
    message: "Passwords are compared in plaintext against the database (no hashing).",
    fix: "Store bcrypt/argon2 hashes at registration and compare with bcrypt.compare() at login.",
  },
  {
    id: "password-stored-unhashed",
    severity: "critical",
    appliesTo: (f, s) => /\/api\/auth\/(register|reset-password)/.test(f) && /password/.test(s) && !/bcrypt|argon2|scrypt|pbkdf2/i.test(s),
    check: (s) => firstMatchLines(s, /password/g, 1),
    message: "Password is written to the database without a hashing function.",
    fix: "Hash with bcrypt (cost >= 10) before insert/update.",
  },
  {
    id: "unauthenticated-mutation",
    severity: "high",
    appliesTo: (f, s) => /\/api\/.*route\.(ts|js)$/.test(f) && !/\/api\/auth\//.test(f) && !AUTH_HELPER_RE.test(s),
    pattern: /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/g,
    message: "Mutating API handler has no server-side session/auth verification; anyone can call it.",
    fix: "Verify a signed session (httpOnly cookie / Supabase auth) and derive the user id from it.",
  },
  {
    id: "client-trusted-identity",
    severity: "high",
    appliesTo: (f, s) => /\/api\//.test(f) && !AUTH_HELPER_RE.test(s),
    pattern: /(searchParams\.get\(\s*["'`](userId|adminId|senderId)["'`]\s*\)|\{[^}]*\b(userId|senderId|adminId)\b[^}]*\}\s*=\s*await\s+request\.json\(\))/g,
    message: "API trusts a user id supplied by the client (IDOR / impersonation risk).",
    fix: "Ignore client-supplied identity; use the authenticated session's user id.",
  },
  {
    id: "dangerous-inner-html",
    severity: "high",
    appliesTo: (f, s) => !/DOMPurify|sanitize-html|sanitizeHtml/.test(s),
    pattern: /dangerouslySetInnerHTML/g,
    message: "dangerouslySetInnerHTML without a sanitizer (stored/reflected XSS).",
    fix: "Sanitize with DOMPurify or render as text.",
  },
  {
    id: "eval-usage",
    severity: "high",
    appliesTo: () => true,
    pattern: /\b(eval\(|new Function\()/g,
    message: "Dynamic code execution.",
    fix: "Remove eval/new Function.",
  },
  {
    id: "hardcoded-secret",
    severity: "critical",
    appliesTo: () => true,
    pattern: /(sk_live_[0-9a-zA-Z]{10,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC )?PRIVATE KEY-----|eyJhbGciOiJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}|service_role["'`]?\s*[:=]\s*["'`][^"'`]{20,})/g,
    message: "Hard-coded credential / key in source.",
    fix: "Move to environment variables and rotate the leaked key.",
  },
  {
    id: "service-role-in-client",
    severity: "critical",
    appliesTo: (f, s) => /^["']use client["']/.test(s.trimStart()) || f.includes("NEXT_PUBLIC"),
    pattern: /SERVICE_ROLE|service_role/g,
    message: "Supabase service-role key referenced from client-side code.",
    fix: "Only use the service-role key in server code; never expose it with NEXT_PUBLIC_.",
  },
  {
    id: "auth-state-in-localstorage",
    severity: "medium",
    appliesTo: (f) => f.endsWith(".tsx"),
    pattern: /localStorage\.setItem\(\s*["'`][^"'`]*(user|token|session|auth)[^"'`]*["'`]/gi,
    message: "Auth/user state kept in localStorage — client-controlled and readable by any XSS.",
    fix: "Use an httpOnly, Secure, SameSite session cookie issued by the server.",
  },
  {
    id: "users-select-star",
    severity: "medium",
    appliesTo: (f, s) => /\/api\//.test(f) && /from\(\s*["'`]users["'`]\s*\)/.test(s) && !/password\s*:\s*_|delete\s+\w+\.password|omitPassword/.test(s),
    pattern: /from\(\s*["'`]users["'`]\s*\)[\s\S]{0,80}?\.select\(\s*["'`]\*["'`]\s*\)/g,
    message: "select('*') on users without stripping the password column before responding.",
    fix: "Select explicit safe columns or strip password before returning.",
  },
  {
    id: "unsafe-user-url",
    severity: "medium",
    appliesTo: (f, s) => f.endsWith(".tsx") && !/safeUrl|isSafeUrl|sanitizeUrl/.test(s),
    pattern: /href=\{\s*[\w.?]*(linkedInUrl|twitterUrl|websiteUrl|imageUrl|link|url)\s*\}/gi,
    message: "User-controlled URL rendered in href without scheme validation (javascript: XSS).",
    fix: "Allow only http(s):// URLs via a safeUrl() helper.",
  },
  {
    id: "password-logged",
    severity: "medium",
    appliesTo: () => true,
    pattern: /console\.(log|info|debug)\([^)]*password/gi,
    message: "Password value may be written to logs.",
    fix: "Never log credentials.",
  },
  {
    id: "error-detail-leak",
    severity: "low",
    appliesTo: (f) => /\/api\//.test(f),
    pattern: /NextResponse\.json\(\s*\{[^}]*(error\.message|err\.message|error\.stack|details:\s*error)/g,
    message: "Raw internal error details returned to the client.",
    fix: "Return a generic message; log details server-side.",
  },
  {
    id: "blank-target-no-rel",
    severity: "low",
    appliesTo: (f) => f.endsWith(".tsx"),
    check: (s) => {
      const lines = [];
      s.split(/\r?\n/).forEach((l, i) => {
        if (/target=["']_blank["']/.test(l) && !/rel=/.test(l)) lines.push(i + 1);
      });
      return lines;
    },
    message: 'target="_blank" without rel="noopener noreferrer".',
    fix: 'Add rel="noopener noreferrer".',
  },
];

function firstMatchLines(src, re, max = 50) {
  const lines = [];
  for (const m of src.matchAll(re)) {
    lines.push(src.slice(0, m.index).split(/\r?\n/).length);
    if (lines.length >= max) break;
  }
  return lines;
}

export function runSecurityScan(repoRoot) {
  const findings = [];
  const files = walk(join(repoRoot, "src"));
  for (const abs of files) {
    const rel = relative(repoRoot, abs).split(sep).join("/");
    const src = readFileSync(abs, "utf8");
    for (const rule of RULES) {
      if (!rule.appliesTo(rel, src)) continue;
      const lines = rule.check ? rule.check(src) : firstMatchLines(src, rule.pattern);
      if (lines.length) {
        findings.push({
          id: `${rule.id}:${rel}`,
          source: "static",
          rule: rule.id,
          severity: rule.severity,
          file: rel,
          lines,
          message: rule.message,
          fix: rule.fix,
        });
      }
    }
  }

  // Project-level checks
  const cfgPath = ["next.config.mjs", "next.config.js", "next.config.ts"].map((f) => join(repoRoot, f)).find(existsSync);
  if (cfgPath) {
    const cfg = readFileSync(cfgPath, "utf8");
    if (!/headers\s*\(/.test(cfg) && !existsSync(join(repoRoot, "src", "middleware.ts"))) {
      findings.push({
        id: "missing-security-headers:next.config",
        source: "static",
        rule: "missing-security-headers",
        severity: "medium",
        file: relative(repoRoot, cfgPath),
        lines: [],
        message: "No security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS).",
        fix: "Add async headers() in next.config or a middleware that sets them.",
      });
    }
    if (!/poweredByHeader\s*:\s*false/.test(cfg)) {
      findings.push({
        id: "x-powered-by:next.config",
        source: "static",
        rule: "x-powered-by",
        severity: "low",
        file: relative(repoRoot, cfgPath),
        lines: [],
        message: "X-Powered-By: Next.js header is enabled (fingerprinting).",
        fix: "Set poweredByHeader: false.",
      });
    }
  }

  try {
    const tracked = execSync("git ls-files", { cwd: repoRoot, encoding: "utf8" }).split(/\r?\n/);
    for (const f of tracked) {
      if (/(^|\/)\.env(\.|$)/.test(f) && !/\.example$/.test(f)) {
        findings.push({ id: `env-committed:${f}`, source: "static", rule: "env-committed", severity: "critical", file: f, lines: [], message: "Environment file is committed to git.", fix: "Remove from git, add to .gitignore, rotate secrets." });
      }
      if (/^data\/.*\.json$/.test(f)) {
        findings.push({ id: `data-file-committed:${f}`, source: "static", rule: "data-file-committed", severity: "medium", file: f, lines: [], message: "Data file committed to git (may contain user PII/passwords).", fix: "Remove from git history and .gitignore it." });
      }
    }
  } catch {}

  return findings.sort((a, b) => SEV_ORDER[b.severity] - SEV_ORDER[a.severity]);
}

export { SEV_ORDER };
