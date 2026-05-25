# Pin High — Codex Phase 2 Build Brief

This document is the authoritative handoff for Codex / twin.ai to implement Phase 2 features on the Pin High golf scorecard PWA.

---

## Stack Overview

- **React + TypeScript + Vite** PWA
- **localStorage** for auth, rounds, presets, reflections, and club data
- **CSS design tokens** in `src/index.css` (no Tailwind, no CSS modules)
- **Deployment**: Vercel (auto-deploy on push to `main`)
- **Login**: local player name plus simple password, no backend account system

## Design System (non-negotiable)

Read `.claude/skills/frontend-design/SKILL.md` for the full system. Summary:

- **Background**: `#1A1A1A`
- **Cards**: `#242424`
- **Secondary surface**: `#2E2E2E`
- **Top bar**: `#111111`
- **Accent**: orange `#E87722`; highlight orange `#FF9340`
- **Text**: `#FFFFFF`, secondary `#888888`, muted `#555555`
- **Grid lines**: `#333333`
- **Font**: system-ui / -apple-system
- **Tone**: Design 1 Dark Premium
- **NEVER**: white backgrounds, blue buttons, orange/bronze themes, purple gradients

---

## Phase 2 Features to Build

### Feature 1: Swipe Miss Direction in `GuidedHoleEntry`

**Where**: `src/components/GuidedHoleEntry.tsx`

**When it triggers**: After the user selects a "Miss" on any shot result field (FIR, GIR, or approach).

**What to build**:
- A directional compass overlay — 8-segment ring showing: L, FL, F, FR, R, BR, B, BL
- Touch gesture: user swipes from center toward direction — detect angle from `touchstart` → `touchend` delta
- Tapping a segment also selects it (fallback for accessibility)
- Selected segment highlights orange (`var(--orange)` fill)
- On selection: haptic pulse (`navigator.vibrate(40)` if supported), auto-advance after 350ms
- If no selection needed (e.g., putt miss — only left/right matters), show simplified 3-segment: L, Center, R

**Data**:
```typescript
// Add to Hole interface in src/types.ts
missDirection?: string;  // "L" | "FL" | "F" | "FR" | "R" | "BR" | "B" | "BL"
```

**Styling**:
- Compass ring: 220px diameter SVG or Canvas, centered on screen
- Segments: dark fill (`var(--surface2)`), orange stroke on active
- Direction labels: Oswald font, 13px, `var(--white)`
- Background behind compass: `rgba(0,0,0,0.85)` blur overlay

---

### Feature 2: Green Map for Approach Shots

**Where**: New component `src/components/GreenMap.tsx`, integrated into `GuidedHoleEntry`

**When it triggers**: User is entering approach shot data AND distance from pin ≤ 100 yards (ask user to input approach distance first, then show green map).

**What to build**:
- Canvas (or SVG) rendering a top-down putting green:
  - Oval green shape, `#2D8A35` fill with subtle texture (noise or radial gradient)
  - Pin position marker at default center-right: orange flag icon (8px circle + line)
  - Fringe indicated by slightly lighter green ring
- Tap anywhere on green to place an approach landing marker:
  - First tap: places shot landing (white circle, 10px radius, orange stroke)
  - Tap again: moves the marker
  - Long press (500ms): clears the marker
- Two-marker mode (optional, Phase 2.5): place both where you aimed AND where it landed

**Data**:
```typescript
// Add to Hole interface in src/types.ts
approachLanding?: { x: number; y: number };  // 0–1 normalized canvas coords
pinPosition?: { x: number; y: number };       // 0–1 normalized, default { x: 0.65, y: 0.5 }
```

**Styling**:
- Green canvas: 300×200px, centered, border-radius 12px
- Wrapped in a card with header: "Tap where it landed"
- Subtle grid lines on canvas (faint, `rgba(255,255,255,0.05)`)
- Compass rose (N/S/E/W) in corners, tiny, `var(--muted)` color

**Notes**:
- Persist normalized coords so they render correctly regardless of canvas size
- No course-specific green shapes in Phase 2 (generic oval) — Phase 3 adds custom outlines

---

### Feature 3: Voice Input in `GuidedHoleEntry`

**Where**: `src/components/GuidedHoleEntry.tsx` header

**What to build**:
- Microphone icon button in the top-right of the GuidedHoleEntry header (next to the close button)
- On tap: start `SpeechRecognition` session (Web Speech API)
- Visual state: mic button pulses orange while listening
- Parse recognized text into hole fields:
  - Numbers → score (e.g., "five" → 5, "birdie" on par 4 → 3)
  - "Fairway" / "hit fairway" → FIR: true
  - "Miss left" / "left" → FIR: false, missDirection: "L"
  - "GIR" / "on the green" → GIR: true
  - Club names → club field
- Show parsed results in a confirmation strip at top, then tap to confirm and populate fields
- On confirm: populate fields and auto-advance through them
- **Fallback**: `if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))` → hide mic button entirely

**Styling**:
- Mic button: 36px, `var(--surface2)` background, orange mic icon
- Listening state: `animation: pulse 1s infinite` with orange glow ring
- Confirmation strip: slides down from top, dark card, green checkmarks, orange values

---

## Existing Architecture Notes

### `src/types.ts` — Hole interface (extend, don't replace)
Current fields include: `par`, `yardage`, `score`, `fir`, `gir`, `putts`, `club`, `notes`, etc.
Add new fields as optional to stay backward-compatible.

### `src/App.tsx` — Round persistence
`handleRoundChange(round)` saves rounds locally through `src/utils/localStorageStore.ts`. New hole fields should stay serializable and optional for backward compatibility.

### `src/components/GuidedHoleEntry.tsx` — Current state
- Auto-advance already implemented in `handleDetect()`
- Fields are indexed via `fieldIdx` state
- Overlay is full-screen with header, field area, skip button

### CSS classes available
- `.cta-btn` — orange primary button
- `.ghost-btn` — dark surface secondary button  
- `.form-input` — dark input field
- Use inline styles for one-off component styles, CSS classes for reused patterns

---

## Quality Bar

Every component must:
1. Feel native on iPhone (375–430px viewport) — large tap targets (min 44px)
2. Work in bright sunlight — no low-contrast text
3. Auto-advance without requiring confirm taps
4. Animate entrances (200ms fade-up from `translateY(8px)`)
5. Match Design 1 Dark Premium exactly — no improvised colors

Run `npm run build` to verify TypeScript compiles clean before pushing.

---

## Git Workflow

```bash
git add -A
git commit -m "feat: Phase 2 — swipe direction, green map, voice input"
git push origin main
```

Vercel auto-deploys on push. Live at: https://pin-high-three.vercel.app
