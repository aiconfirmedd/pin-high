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
> **Luxury Dark Metal** — like a premium golf watch. Copper/bronze accents on near-black steel. Every element earns its place. Sparse, confident, weighted.

---

## Pin High Design System

### Color Tokens (from `src/index.css`)
```css
--bg: #18181A;           /* near-black steel background */
--card: #222224;         /* card surface */
--surface2: #2C2C2E;     /* elevated surface */
--topbar: #101012;       /* deepest black */
--copper: #C4762A;       /* primary accent */
--copper-lt: #D48B3A;    /* lighter copper */
--copper-shine: #E0A550; /* highlight copper */
--green: #2D8A35;        /* fairway green */
--green-lt: #3DAA45;
--white: #F5F5F7;
--sec: #8E8E93;          /* secondary text */
--muted: #48484A;        /* muted/disabled */
--grad-copper: linear-gradient(135deg, #D48B3A 0%, #C4762A 50%, #8B4E1A 100%);
--grad-topbar: linear-gradient(180deg, #1E1E20 0%, #101012 100%);
```

### Typography
- **Brand font**: `'Oswald', sans-serif` (loaded from Google Fonts) — tall, condensed, commanding
- **UI font**: system-ui / -apple-system for body text
- **Copper gradient text technique**:
  ```css
  background: var(--grad-copper);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ```
- **NEVER use**: Inter, Roboto, Arial, generic sans-serif for headings

### Spacing & Layout
- Mobile-first: max-width 430px, full-height viewport
- Bottom nav: 56px fixed, content area scrolls above it
- Card radius: 12–14px
- Grid lines: `1px solid var(--grid)` (`#3A3A3C`)
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
  <div style={{ background: "var(--grad-topbar)", borderBottom: "1px solid var(--grid)", padding: "14px 16px" }}>
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
  background: var(--grad-copper);
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
- Large copper-gradient text for scores (48–72px)
- Birdie: `var(--copper-shine)` — eagle: gold glow
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
- Selected direction glows copper; haptic feedback
- Auto-advances after 400ms hold or swipe release
- Store as `hole.missDirection: string` alongside `hole.miss: string`

### 2. Green Map for Approaches
Activated for approach shots from ≤100 yards:
- Canvas element rendering overhead view of a generic putting green (oval, flag at center-right)
- If course preset uploaded: use actual green shape SVG
- Tap to place: pin location marker (copper dot), approach landing zone (circle)
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
- Supabase sync happens in `App.tsx` `handleRoundChange()` — it already upserts the full round including `holes` array as JSONB
- No additional Supabase schema changes needed for Phase 2 (all new data lives inside the `holes` JSONB column)
- Follow existing patterns: no class components, hooks only, inline styles matching design tokens
- Test on mobile viewport (375px wide) — this is primary target
