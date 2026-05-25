---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill whenever building or refining UI components, screens, or visual systems for Pin High.
---

# Frontend Design Skill

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.

---

## Design Thinking First

Before writing a single line of code, commit to a **BOLD aesthetic direction**:

- **Purpose**: What emotion should this screen create?
- **Tone** (pick an extreme): brutally minimal · maximalist · retro-futuristic · luxury/refined · brutalist · editorial
- **Differentiation**: What makes this UNFORGETTABLE vs every other golf app?

For Pin High, the committed aesthetic is:
> **Design 1 Dark Premium** — black course-day utility, dark cards, crisp white text, and orange scoring accents. The app should feel focused, durable, and fast on a phone.

---

## Pin High Design System

### Color Tokens (from `src/index.css`)
```css
--bg: #1A1A1A;        /* app background */
--card: #242424;      /* card/surface */
--surface2: #2E2E2E;  /* secondary surface */
--topbar: #111111;    /* top and bottom bars */
--orange: #E87722;    /* buttons, active states, under-par stats */
--orange-lt: #FF9340; /* birdie circles and positive highlights */
--green: #2D8A35;        /* fairway green */
--green-lt: #3DAA45;
--white: #FFFFFF;
--sec: #888888;       /* secondary text */
--muted: #555555;     /* muted/disabled */
--grid: #333333;      /* table/grid lines */
```

### Typography
- **UI font**: system-ui / -apple-system for every screen
- **Display text**: white, compact, and readable in sunlight
- **Accent text**: use `var(--orange)` or `var(--orange-lt)`, not gradients
- **NEVER use**: purple/blue gradients, orange/bronze themes, or marketing-style hero pages

### Spacing & Layout
- Mobile-first: edge-to-edge app shell with `viewport-fit=cover`
- Bottom nav: 60px plus safe-area inset, content area scrolls above it
- Card radius: 12–14px
- Grid lines: `1px solid var(--grid)` (`#333333`)
- Generous whitespace — don't crowd elements

### Motion Principles
- Entrances: subtle fade-up (`translateY(8px) → 0`, opacity 0→1), 200–300ms
- Overlays: slide up from bottom (transform `translateY(100%) → 0`)
- Field transitions: smooth, instant feel — no delay between auto-advance fields
- Avoid: bouncing, excessive spring, loading spinners on fast operations

---

## Component Patterns

### Full-Screen Overlay (GuidedHoleEntry pattern)
```tsx
<div style={{
  position: "fixed", inset: 0,
  background: "var(--bg)",
  zIndex: 100,
  display: "flex", flexDirection: "column"
}}>
  {/* Fixed header */}
  <div style={{ background: "var(--topbar)", borderBottom: "1px solid var(--grid)", padding: "14px 16px" }}>
    ...
  </div>
  {/* Scrollable content */}
  <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
    ...
  </div>
  {/* Fixed footer CTA */}
  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--grid)" }}>
    <button className="cta-btn">Save</button>
  </div>
</div>
```

### Primary CTA Button
```css
.cta-btn {
  background: var(--orange);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  padding: 14px;
  width: 100%;
  border: none;
  cursor: pointer;
}
```

### Ghost Button
```css
.ghost-btn {
  background: var(--surface2);
  border: 1px solid var(--grid);
  color: var(--white);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
}
```

### Number/Score Display
- Large orange text for key scores/stats (48–72px where appropriate)
- Birdie: `var(--orange-lt)` circle; eagle/albatross use double/triple orange rings
- Over par: `var(--sec)` — subtle, not alarming
- Even par: `var(--white)`

---

## UX Principles for Pin High

1. **Zero friction on the course** — golfers are moving. Taps must be large (min 44px), auto-advance eliminates confirm steps.
2. **Glanceable data** — scores visible at a glance from the scorecard. No hunting.
3. **Input confidence** — when a number is entered, it commits. No ambiguity.
4. **Status feedback** — subtle haptic-style micro-animations on save (brief scale pulse on the saved value).
5. **Dark environment** — many rounds happen in bright sunlight. High contrast is non-negotiable.

---

## What to NEVER Build

- Generic white background with blue primary buttons
- Purple/teal gradients (default AI aesthetic)
- Flat, icon-heavy nav bars that look like every food delivery app
- Rounded pill buttons on everything
- Loading skeletons where instant feedback is possible
- Modal dialogs that block the whole screen for simple confirmations
- Predictable grid layouts — consider unexpected asymmetry

---

## Phase 2 Feature Specs (for Codex)

### 1. Swipe Miss Direction
After entering a shot result of "miss", show a directional pad:
- Render a compass-style ring with 8 directions (L, FL, F, FR, R, BR, B, BL)
- User swipes toward miss direction — velocity determines selection
- Selected direction uses orange border/fill; haptic feedback
- Auto-advances after 400ms hold or swipe release
- Store as `hole.missDirection: string` alongside `hole.miss: string`

### 2. Green Map for Approaches
Activated for approach shots from ≤100 yards:
- Canvas element rendering overhead view of a generic putting green (oval, flag at center-right)
- If course preset uploaded: use actual green shape SVG
- Tap to place: pin location marker (orange dot), approach landing zone (circle)
- Store as `hole.approachLanding: { x: number, y: number }` (0–1 normalized coords)
- Second tap moves the marker; long press clears it

### 3. Voice Input (Web Speech API)
- Microphone button in GuidedHoleEntry header
- Activates `SpeechRecognition` API
- User speaks: "Birdie, fairway, 7 iron, par 4" — parse into fields
- Show transcription overlay, then populate fields and advance
- Fallback: if API not supported, hide the mic button

---

## Handoff Notes for Codex / twin.ai

- All new components go in `src/components/`
- Types live in `src/types.ts` — extend `Hole` interface for new fields
- Persistence is local-first. Use localStorage helpers in `src/utils/localStorageStore.ts`; do not add backend auth or Supabase sync unless the user explicitly asks.
- Follow existing patterns: no class components, hooks only, inline styles matching design tokens
- Test on mobile viewport (375px wide) — this is primary target
