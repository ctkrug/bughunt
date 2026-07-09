# Design direction

## Aesthetic direction

**Blueprint/technical.** Bughunt is a diagnostic readout on an engineer's drafting table: deep
blueprint-navy paper, hairline cyan grid lines, code presented like a schematic under
inspection, annotations in a crisp technical monospace. Debugging *is* reading a schematic —
the visual language should make that literal, not lean on the generic "dark IDE" look every
code-adjacent tool defaults to.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b2545` | page background (blueprint navy) |
| `--surface-1` | `#123a63` | panel background (code card, controls) |
| `--surface-2` | `#1b4b7a` | raised surface (hover state, active panel) |
| `--text` | `#eaf2ff` | primary text |
| `--text-muted` | `#9db8d9` | secondary text, line numbers, captions |
| `--accent` | `#5ec8f2` | primary accent — cyan blueprint ink (links, focus ring, wordmark) |
| `--accent-support` | `#ffb454` | amber — highlights, streak flame, "attempt used" marker |
| `--success` | `#6ee7a8` | correct-line flash, win state |
| `--danger` | `#ff6b6b` | wrong-line flash |
| Display font | **Space Grotesk** (system fallback: `ui-sans-serif, system-ui`) | wordmark, headings |
| UI/code font | **JetBrains Mono** (system fallback: `ui-monospace, "SFMono-Regular", monospace`) | code panel, body UI text, buttons |
| Spacing unit | 8px scale (4/8/16/24/32/48/64) | all margins/padding |
| Corner radius | 6px | panels and controls — sharp enough to read as technical, not brutalist |
| Shadow/glow | soft cyan glow (`0 0 0 1px rgba(94,200,242,.35), 0 8px 24px rgba(0,0,0,.35)`) on raised/focused panels; layered drop shadow (paper-on-paper) on the code card | depth without a single flat hue |
| Motion | UI transitions 150–200ms ease-out; game feedback (line flash, shake) 80–120ms ease-out | all interactive transitions |

## Layout intent

The **code panel is the hero**: the buggy function, line-numbered and syntax-highlighted, fills
the primary column and takes ~65% of viewport height on desktop (1440×900) — a large, legible
"instrument panel" centered on a subtle blueprint-grid background (faint repeating cyan
hairlines, ~24px pitch, very low opacity). A slim sidebar to the right holds streak, attempts
remaining, and puzzle metadata (number, language, category) styled as annotation callouts with
leader lines, like margin notes on a technical drawing.

At 390×844 (phone), the sidebar collapses to a horizontal strip above the code panel (streak +
attempts as compact pills); the code panel still gets the majority of the viewport, scrolls
internally if the function is tall, and the grid background stays but at reduced density so it
doesn't compete with the smaller code text.

## Signature detail

The wordmark **"bughunt"** is set in Space Grotesk with the "u" in "bug" replaced by a small
circuit-trace glyph (a rounded-corner line that loops through the letterform like a PCB trace)
rendered as inline SVG — one deliberate flourish, not a full icon set. On the puzzle screen, a
crosshair/scan-line cursor sweeps horizontally across the hovered code line (a thin cyan bar
with tick marks, like a caliper measuring the line) before the click — reinforcing "you're
inspecting a schematic," not just hovering a list item.

## Juice plan

- **Movement tween:** the scan-line cursor eases (120ms ease-out) to the hovered line rather
  than snapping; the reveal panel slides up from the bottom of the code card (160ms ease-out).
- **Impact feedback (wrong click):** the clicked line flashes `--danger` red for 100ms, the code
  card does a 4px horizontal shake (2 cycles, ~120ms total), and a small "×" tick mark appears
  in the attempts strip.
- **Goal feedback (correct click):** the clicked line flashes `--success` green, a brief cyan
  particle burst (a dozen small square "solder" specks) fires from the line and fades over
  300ms, and the explanation panel slides in.
- **Win celebration:** on solving (or on running out of attempts), an overlay shows the run's
  stats (attempts used, streak, puzzle number) over a burst of circuit-trace "sparks" tracing
  outward from the center, plus one clear CTA ("Share result" / "Try again tomorrow").
- **Synth SFX (WebAudio, generated in code — no audio files):**
  - hover tick — very short, quiet triangle-wave blip (~40ms, 800Hz)
  - line select — short square-wave click (~30ms, 500Hz)
  - wrong — descending sawtooth buzz (~150ms, 300Hz→150Hz)
  - correct — ascending sine chime (~200ms, 600Hz→1200Hz)
  - streak milestone (7/30/100) — a 3-note ascending arpeggio
  - All SFX are low-volume (peak ≈ -18dB), rate-throttled so rapid hovering can't spam them, and
    the `AudioContext` is created lazily on first user gesture. A mute toggle (top-right, icon
    button with `aria-label`) persists to `localStorage` and is checked before every SFX call so
    it works even on environments without WebAudio (guarded, no throw).
  - `prefers-reduced-motion` disables the shake/particle/scan-sweep animations but keeps the
    color-flash and panel-slide state changes (with a shorter, non-animated transition).
