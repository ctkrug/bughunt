# Vision

## The problem

Wordle proved that a tiny, well-crafted daily ritual can hold a huge shared audience — one
puzzle, one shot, five minutes, everyone comparing notes. Developers don't have an equivalent
for the skill they actually practice for a living: reading code and spotting what's wrong with
it. Existing "debug this" content is either a full LeetCode-style grind (too much commitment for
a daily habit) or a one-off blog post (no ritual, no streak, nothing to come back for).

## Who it's for

Developers — professional, student, or hobbyist — who like a quick daily brain-teaser and want
one that's actually about their craft. The bar for entry is low (read a short function, click a
line), but the bar for mastery is real: spotting subtle off-by-one errors, scoping mistakes, and
type-coercion traps is a genuine skill that improves with practice.

## The core idea

Every day, everyone gets the same short, hand-crafted function in one of several languages. It
has exactly one bug. You read it, you click the line you think is wrong, and you get an instant
verdict: the line flashes green with a "here's why" explanation, or red so you can try again.
Solve it and your streak extends; share a compact, spoiler-free result card, Wordle-style.

The format — not the content — is the moat. Bug-finding content already exists everywhere;
turning it into a dated, shared, streak-driven ritual with instant feedback is what makes people
come back tomorrow.

## Key design decisions

- **Curated over generated.** Every puzzle is hand-written, not LLM- or fuzzer-generated. A
  planted bug has to be *interesting* — subtle enough to require real reading, unambiguous
  enough that there's exactly one right answer. That only comes from careful authorship.
- **Click, don't type.** No code editor, no syntax to get right, no "close enough" answer
  matching. The interaction is binary (which line?) so the feedback can be instant and the game
  playable in under a minute.
- **One correct line per puzzle, always.** Ambiguity kills trust in a puzzle game — if two lines
  could reasonably be "the bug," every solve feels like a coin flip instead of a skill test.
- **Deterministic daily seed, no server.** The puzzle for a given UTC date is derived
  algorithmically from a fixed epoch and the bank, so the whole game ships as a static site with
  no backend, and yet everyone provably sees the same puzzle on the same day.
- **Spoiler-free sharing.** The share card reports attempts/streak, never the bug itself, so a
  share doesn't ruin the puzzle for someone who hasn't played yet — same trick that made Wordle's
  green/yellow/gray grid work as free marketing.
- **Static, relative-path build.** No backend, no database, no accounts. State (streak, mute,
  onboarding-seen) lives in `localStorage`. This keeps hosting free and the game instantly
  playable with zero signup friction, and lets it be served from any subpath.

## What "v1 done" looks like

- The wow moment is real: clicking a line gives a crisp red/green verdict with a clear
  explanation, in well under a second.
- A daily puzzle, deterministic and identical for every player on a given UTC date.
- A bug bank of 30+ curated puzzles across at least 5 languages, each with exactly one bug and a
  written explanation.
- Local streak tracking that survives reloads, plus a shareable, spoiler-free result card.
- A practice-mode archive of past puzzles, browsable and filterable, that doesn't touch the
  daily streak.
- Fully playable by keyboard, with synthesized sound effects, a persistent mute toggle, and
  `prefers-reduced-motion` support.
- The visual design matches `docs/DESIGN.md`'s direction end to end — the puzzle screen, the
  archive, and the landing page all read as one considered product, not a functional stub.
