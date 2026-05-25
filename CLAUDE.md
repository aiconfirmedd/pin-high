# Pin High - Claude Handoff

Last updated: 2026-05-25

## Current Objective

Get Claude aligned with the Pin High / Ask My Caddie transfer work.

The immediate user-approved scope is **audit only**:

- Inventory what can transfer from the Ask My Caddie / Tactical HUD agent into Pin High.
- Identify what should become local repo docs or scripts.
- Identify what still requires Twin.SO or another external operator.
- Do not implement app code, deploy, scrape, upload, authenticate, or make external account changes unless the user explicitly asks.

## Active Repo

Use this repo as the active Pin High workspace:

```text
/Users/aiconfirmed/Desktop/golf-scorecard-app
```

Repo facts found locally:

- Remote: `https://github.com/aiconfirmedd/pin-high.git`
- Branch: `main`
- Stack: React + TypeScript + Vite PWA
- Persistence: Supabase plus localStorage helpers
- Design system: luxury dark metal / copper, defined in `src/index.css` and `.claude/skills/frontend-design/SKILL.md`
- Main guided entry surface: `src/components/GuidedHoleEntry.tsx`
- Round sync: `src/App.tsx` `handleRoundChange`, storing `holes` as JSONB

Reference-only folder:

```text
/Users/aiconfirmed/golf-scorecard-app
```

That folder contains an older Codex dispatch prompt and project brief. Do not treat it as the active implementation repo unless the user explicitly redirects.

## Local Git State To Respect

At the time this handoff was written, the active repo already had untracked files:

```text
.claude/
CODEX-PROMPT.md
reference/
```

Those were preexisting context files. Do not delete, reset, or overwrite them casually.

This file, `CLAUDE.md`, was added so Claude Code and other Claude sessions have the same handoff.

## Important Existing Context

`CODEX-PROMPT.md` in the active repo describes Pin High Phase 2 features:

- Swipe miss direction in `GuidedHoleEntry`
- Green map for approach shots
- Voice input in `GuidedHoleEntry`

Those are valid future Pin High features, but they are not the current user-requested action. The latest user direction is to first audit the Ask My Caddie/Tactical HUD agent instructions and decide what can move into Pin High.

## Ask My Caddie Source Context

The user pasted instructions for a separate app/agent:

- Product: Ask My Caddie / Tactical HUD voice web app
- Courses: Sierra Lakes Golf Club in Fontana, CA and The Country Club at Soboba Springs in San Jacinto, CA
- Live app: `https://aiconfirmedd.github.io/ask-my-caddie-sierra-lakes/`
- Repo: `aiconfirmedd/ask-my-caddie-sierra-lakes`
- Frontend: single-page `index.html` served by GitHub Pages
- Voice in: Web Speech API / `webkitSpeechRecognition`
- Voice out primary: `puter.ai.txt2speech`
- Voice out fallback: enhanced `speechSynthesis`
- AI brain primary: `puter.ai.chat` with Claude Sonnet 4.5
- AI brain fallback: local rule engine using haversine distance, hazard position, wind, and tee-to-pin bearing
- GPS: `navigator.geolocation.watchPosition`
- Weather: Open-Meteo current endpoint, cached client-side for 5 minutes
- Browser persistence keys: `caddie.round.v2`, `caddie.scores.v2`, `caddie.shots.v2`, `caddie.recs.v2`, `caddie.history.v2`
- Agent DB concept: SQLite tables for courses, holes, hazards, rounds, scores, shots, recommendations
- Maintenance workflows: status check, OSM/Overpass course refresh, rebuild/redeploy, archive finished round, email summary

Known database quirk from the pasted instructions:

- Canonical multi-course table is `course_holes_v2`.
- Older `course_holes` still exists and may be read by runtime by default.
- Do not try to `DROP` or `RENAME` tables in that agent DB because the wrapper rejects those statements.
- Refresh flow should `DELETE FROM course_holes_v2 WHERE course_id = ?` then `INSERT OR REPLACE` by `(course_id, hole)`.

## Transfer Audit Buckets

Use these buckets for the audit report.

### Move Into Pin High App

Likely portable product capabilities:

- Caddie Mode / voice assistant flow for on-course use
- Web Speech API mic input with unsupported-browser fallback
- Local spoken reply fallback so the app still answers without AI
- GPS course and hole detection
- Weather fetch and short client-side cache
- Course selector and manual hole override
- Course/hole/hazard data model for Sierra Lakes and Soboba
- Round, shot, recommendation, and history concepts
- End-round archive behavior

Important integration preference:

- Do not jam the tactical caddie into the current handwriting score entry UI.
- Plan it as a separate Pin High feature surface, likely "Caddie Mode" or "Course Assist", connected to the current round.

### Move Into Repo Docs Or Scripts

Likely durable maintenance knowledge:

- Course map refresh instructions
- Overpass query and hazard assignment rules
- Sierra/Soboba authoritative scorecard notes
- Data rebuild process for static course constants
- Deployment checklist
- Round archive import format
- External approval gates and safety rules

### Keep External / Twin.SO Only If Needed

Keep these outside Pin High unless the user explicitly asks to integrate them:

- Authenticated GitHub Pages redeploy operations for the old Ask My Caddie repo
- External dashboard/browser workflows
- Puter account setup or account-dependent testing
- Email summary sending
- Uploading files to external services
- Any production deploy or persistent third-party access grant

### Discard Or Defer

Likely not a direct Pin High transfer:

- Single-file GitHub Pages build architecture
- Tactical HUD styling as-is; Pin High should keep its luxury dark metal/copper visual system
- SQLite wrapper-specific implementation details, unless writing migration/import scripts for the old agent

## GitHub/Auth Constraint

GitHub CLI is installed, but the saved token was invalid when checked:

```text
gh auth status -> token invalid for aiconfirmedd
```

Claude should not assume it can inspect private GitHub repo contents or push changes until auth is repaired by the user. Public URLs may be inspected only if needed and safe, but the current audit can proceed from the pasted instructions and local repo.

## Suggested Next Claude Action

Produce a concise **Ask My Caddie to Pin High Transfer Audit** with:

- Feature/function inventory
- Recommendation per item: `move now`, `move later`, `docs/script only`, `external only`, or `discard`
- Pin High integration shape
- Risks and blockers
- Suggested implementation sequence after the audit

Keep it decision-ready, but do not edit implementation files unless the user asks to move from audit to build.

## Commands To Start With

Read-only orientation:

```bash
git status --short --branch
sed -n '1,220p' CODEX-PROMPT.md
sed -n '1,220p' .claude/skills/frontend-design/SKILL.md
sed -n '1,260p' src/types.ts
sed -n '1,260p' src/components/GuidedHoleEntry.tsx
sed -n '130,220p' src/App.tsx
```

Build verification, only if implementation later happens:

```bash
npm run build
```

