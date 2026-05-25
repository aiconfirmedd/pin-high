# Project Router Skill
## Trigger
Auto-trigger IMMEDIATELY when any of these are detected in the user's message:
- A new product, brand, tool, app, website, or business idea is mentioned
- A topic that doesn't match the currently connected workspace project
- Words like: "I want to build", "new app", "new project", "new site", "add a", "idea", "also want", "separate", "another one", "we should also"
- A domain change (e.g., currently working on golf app, user mentions supplements/labs/finance/etc.)

## What to do immediately when triggered

### Step 1 — Classify
Ask ONE question before doing anything else:

> "Is **[topic they mentioned]** a new standalone project, or a feature/subsection of **[current project name]**?"

Give them two clear options:
- A) New standalone project → gets its own folder, repo, Vercel project, workspace
- B) Subsection of [current] → added as a module/feature inside the existing structure

### Step 2A — If NEW PROJECT
1. Ask for a project name (slug, lowercase-hyphenated)
2. Confirm the primary deliverable (website / app / tool / document library / other)
3. Scaffold immediately:
   - Create project folder in outputs: `outputs/<project-name>/`
   - Run: `npm create vite@latest <project-name> -- --template react-ts`
   - Create folder structure: `src/{components,pages,layouts,assets,api,hooks,types,lib}`, `server/{routes,middleware,models}`
   - Write `CODEX-PROMPT.md` with 5-agent roster (see template below)
   - Write `CHANGELOG.md` with initial entry
   - Write `.env.example`
   - Write `.gitignore`
4. Check Vercel for existing project with matching name via Vercel MCP
5. Update memory: save new project to `project_<name>.md` memory file
6. Confirm workspace isolation: remind user to connect the new folder as a separate Cowork workspace — NOT inside an existing project folder
7. Update MEMORY.md index

### Step 2B — If SUBSECTION
1. Identify the parent project folder
2. Add a new module directory under `src/features/<feature-name>/` or `src/pages/<page-name>/`
3. Update the parent project's `CODEX-PROMPT.md` ACTIVE TASKS section
4. Append to parent `CHANGELOG.md`
5. Do NOT create a new repo or Vercel project

---

## CODEX-PROMPT.md Template (for new projects)

```
# [PROJECT NAME] — CODEX MASTER COORDINATION PROMPT

## LATEST HANDOFF
From: Claude | Date: [today]
Status: [current status]
Next Codex action: [what to do first]

## GROUND RULES
- Claude owns: .claude/, CODEX-PROMPT.md, memory files, deployment config, infrastructure specs
- Codex owns: component code, pages, routes, styling, tests
- Neither touches the other's files without a handoff note in CHANGELOG.md

## AGENT ROSTER

### Agent 1 — FRONTEND BUILDER
Owns: src/components/, src/pages/, src/layouts/, src/hooks/
Never touches: server/, src/api/

### Agent 2 — BACKEND WIRER
Owns: server/routes/, server/middleware/, server/models/, server/index.js
Never touches: src/components/, src/pages/, styling

### Agent 3 — API BRIDGE
Owns: src/api/, src/types/
Depends on: Agent 1 + Agent 2
Never touches: server logic, UI rendering

### Agent 4 — ASSET MANAGER
Owns: src/assets/
Never touches: React components, server routes

### Agent 5 — QA / TESTER
Owns: tests/, playwright.config.ts
Never touches: source files (read only)

## COMMUNICATION PROTOCOL
- Every change → append to CHANGELOG.md:
  [SOURCE][date][AgentN] Action: what | Affects: files | Needs: requests
- New ENV var needed → add to .env.example, never hardcode
- New route → update server/index.js AND src/api/ simultaneously (Agent 2 + Agent 3)
- Conflict on file ownership → add // TODO: OWNERSHIP CONFLICT comment, flag in CHANGELOG

## CODEX SESSION CHECKLIST
1. Read ## LATEST HANDOFF
2. Read CHANGELOG.md
3. Confirm which Agent(s) you are
4. Check ## ACTIVE TASKS
5. After work: update CHANGELOG + task checkboxes

## ACTIVE TASKS
[filled in per project]

## PROJECT DETAILS
[filled in per project]
```

---

## Folder Isolation Rule
Every project gets its own:
- Desktop folder (never nested inside another project)
- Git repo
- Vercel project (when deployed)
- Cowork workspace connection
- Memory file in Claude's memory system

Projects currently tracked:
- `pin-high` → ~/Desktop/golf-scorecard-app
- `silverback-labs` → ~/Desktop/silverback-labs (pending Desktop move)
- `peptide-calculator` → standalone (pending repo)

---

## On Every Session Start
Silently check: does the user's message topic match the currently connected workspace?
If NO → trigger Step 1 classification immediately, before any other work.
