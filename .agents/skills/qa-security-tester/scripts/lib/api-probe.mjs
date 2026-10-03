// Runtime probes against a RUNNING local dev server.
// All probes are NON-DESTRUCTIVE: they use random, non-existent ids and fake
// credentials. Refuses non-localhost targets unless allowRemote is set.
import { randomUUID } from "node:crypto";

const PAGES = ["/", "/about", "/events", "/knowledge", "/go-digital", "/app-teaser", "/auth/login", "/auth/register", "/auth/register-type", "/auth/forgot-password", "/dashboard"];

async function req(base, path, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(base + path, { redirect: "manual", ...init, signal: ctrl.signal });
    const text = await res.text().catch(() => "");
    return { status: res.status, headers: res.headers, text };
  } catch (e) {
    return { status: 0, error: String(e?.message || e), headers: new Headers(), text: "" };
  } finally {
    clearTimeout(t);
  }
}

export async function isServerUp(base) {
  const r = await req(base, "/");
  return r.status > 0;
}

export async function runApiProbes(base, { allowRemote = false } = {}) {
  const url = new URL(base);
  if (!allowRemote && !["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error(`Refusing to probe non-local host ${url.hostname}. Pass --allow-remote to override.`);
  }
  const findings = [];
  const passed = [];
  const add = (id, severity, message, fix, extra = {}) =>
    findings.push({ id: `${id}`, source: "runtime", rule: id.split(":")[0], severity, file: extra.path || "", lines: [], message, fix, evidence: extra.evidence });
  const ok = (name) => passed.push(name);
  const fakeId = randomUUID();
  const json = { "Content-Type": "application/json" };

  // 1. Page smoke tests
  for (const p of PAGES) {
    const r = await req(base, p);
    if (r.status === 0) add(`page-unreachable:${p}`, "high", `Page ${p} unreachable: ${r.error}`, "Check dev server / route.", { path: p });
    else if (r.status >= 500) add(`page-5xx:${p}`, "high", `Page ${p} returned HTTP ${r.status}.`, "Fix the server render error.", { path: p, evidence: r.text.slice(0, 300) });
    else ok(`page ${p} -> ${r.status}`);
  }
  const nf = await req(base, `/definitely-not-a-page-${fakeId.slice(0, 6)}`);
  nf.status === 404 ? ok("unknown route -> 404") : add("not-found-handling:/", "low", `Unknown route returned ${nf.status} instead of 404.`, "Ensure not-found.tsx is wired.");

  // 2. Security headers
  const home = await req(base, "/");
  const h = home.headers;
  const wanted = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "clickjacking protection (or CSP frame-ancestors)",
    "referrer-policy": "referrer leakage control",
    "content-security-policy": "XSS mitigation",
  };
  const missing = Object.keys(wanted).filter((k) => !h.get(k) && !(k === "x-frame-options" && /frame-ancestors/.test(h.get("content-security-policy") || "")));
  if (missing.length) add("runtime-missing-headers:/", "medium", `Missing response headers: ${missing.join(", ")}.`, "Add headers() in next.config.mjs.", { path: "/" });
  else ok("security headers present");
  if (h.get("x-powered-by")) add("runtime-x-powered-by:/", "low", `X-Powered-By: ${h.get("x-powered-by")} exposed.`, "poweredByHeader: false.", { path: "/" });

  // 3. Admin endpoints must reject anonymous callers
  for (const p of ["/api/admin/users", "/api/admin/data", "/api/admin/approvals", "/api/admin/firms", `/api/admin/users?userId=${fakeId}`]) {
    const r = await req(base, p);
    if (r.status === 200) add(`admin-open:${p}`, "critical", `Admin endpoint ${p} returned 200 to an anonymous request.`, "Require an authenticated admin session server-side.", { path: p, evidence: r.text.slice(0, 200) });
    else ok(`${p} anonymous -> ${r.status}`);
  }

  // 4. IDOR: reading another user's private data with only a guessed id
  for (const p of [`/api/messages?userId=${fakeId}`, `/api/connections?userId=${fakeId}`, `/api/inquiries?userId=${fakeId}`]) {
    const r = await req(base, p);
    if (r.status === 200) add(`idor-read:${p.split("?")[0]}`, "high", `${p.split("?")[0]} serves data for any userId without a session (IDOR).`, "Derive userId from the authenticated session; reject mismatches with 403.", { path: p });
    else ok(`${p.split("?")[0]} anonymous -> ${r.status}`);
  }

  // 5. Unauthenticated account deletion (uses a random non-existent id => harmless)
  const del = await req(base, `/api/users/${fakeId}`, { method: "DELETE" });
  if (del.status >= 200 && del.status < 300) add("unauth-delete:/api/users/[id]", "critical", "DELETE /api/users/:id succeeds without any authentication — anyone can delete any account.", "Require session; allow only self-delete or admin.", { path: "/api/users/[id]" });
  else ok(`DELETE /api/users/:id anonymous -> ${del.status}`);

  // 6. Login input validation (type confusion should be 400/401, never 500)
  const tc = await req(base, "/api/auth/login", { method: "POST", headers: json, body: JSON.stringify({ email: { $ne: 1 }, password: { $ne: 1 } }) });
  if (tc.status >= 500) add("login-input-validation:/api/auth/login", "low", `Login with non-string fields returned ${tc.status} (unvalidated input).`, "Validate types (typeof === 'string') and return 400.", { path: "/api/auth/login" });
  else if (tc.status === 200) add("login-bypass:/api/auth/login", "critical", "Login succeeded with object-typed credentials!", "Strictly validate input types.", { path: "/api/auth/login" });
  else ok(`login type-confusion -> ${tc.status}`);

  const malformed = await req(base, "/api/auth/login", { method: "POST", headers: json, body: "{not json" });
  if (malformed.status >= 500) add("malformed-json:/api/auth/login", "low", `Malformed JSON body returned ${malformed.status}.`, "Catch JSON parse errors and return 400.", { path: "/api/auth/login" });
  else ok(`login malformed json -> ${malformed.status}`);

  // 7. Brute-force protection (fake account; 8 quick attempts)
  let throttled = false;
  for (let i = 0; i < 8; i++) {
    const r = await req(base, "/api/auth/login", { method: "POST", headers: json, body: JSON.stringify({ email: `qa-probe-${fakeId.slice(0, 8)}@example.invalid`, password: `wrong-${i}` }) });
    if (r.status === 429) { throttled = true; break; }
  }
  throttled ? ok("login rate limiting") : add("no-rate-limit:/api/auth/login", "medium", "No rate limiting on login (8 rapid failures, no 429).", "Add per-IP/per-email throttling.", { path: "/api/auth/login" });

  // 8. Reflected XSS on 404/search paths
  const payload = "<script>alert(1)</script>";
  const xr = await req(base, `/knowledge/${encodeURIComponent(payload)}`);
  if (xr.text.includes(payload)) add("reflected-xss:/knowledge/[slug]", "high", "Unescaped script payload reflected in /knowledge/[slug].", "Escape output; never inject raw params.", { path: "/knowledge/[slug]" });
  else ok("no reflected XSS on /knowledge/[slug]");

  return { findings, passed };
}
