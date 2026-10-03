# CAnnect: Agent Working Agreement

## Definition of Done: QA & Security gate (mandatory)

Work runs as an agile **develop → test → fix → retest** loop.
**Any** change to application code (`src/`, `next.config.*`, `package.json`,
Tailwind/PostCSS config, scripts) is not done until the QA tester has passed it:

1. Read and follow `.agents/skills/qa-security-tester/SKILL.md`.
2. Run `node .agents/skills/qa-security-tester/scripts/qa-run.mjs`, with `npm run dev` running so runtime probes execute.
3. Browser-test the affected features plus the smoke set from
   `.agents/skills/qa-security-tester/references/feature-checklist.md`, on mobile and desktop.
4. Fix every **new** bug or finding and re-run until green. Each loop is one iteration.
5. Tell the user what was tested, what was found and fixed, and what is still open.

Never weaken checks or add items to `.agents/qa-baseline.json` without the
user's explicit approval. A Stop hook (`.agents/hooks.json`) enforces this gate.

## Project notes
- Next.js 14 App Router, TypeScript, Tailwind, Supabase. Windows/PowerShell: use `npx.cmd`/`npm.cmd` if script execution is blocked.
- Never run runtime probes or destructive browser tests against production.
