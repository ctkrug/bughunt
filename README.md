# Bughunt

**▶ Live demo — [apps.charliekrug.com/bughunt](https://apps.charliekrug.com/bughunt/)**

[![CI](https://github.com/ctkrug/bughunt/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/bughunt/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sharpen your debugging, one bug a day. Bughunt is a daily puzzle for developers:
one short function, exactly one planted bug. Find the buggy line, read why it is
wrong, keep your streak, and share your score without spoiling the puzzle for
anyone else.

## Why

Code review is a skill, and skills get sharper with daily reps. Bughunt turns
"spot the bug" into a 60-second ritual: a new hand-crafted snippet every day,
syntax-highlighted, with a single deliberately planted defect. Click the line you
think is broken. Get an instant red or green verdict and a plain-English "here is
why." Keep your streak. Share a Wordle-style result grid that never reveals the
bug.

## How it works

- **One puzzle a day, the same for everyone.** A fixed calendar seed maps each
  UTC date to one entry in a curated bug bank, so the whole game runs with no
  backend and everyone provably gets the same puzzle on the same day.
- **Click, don't type.** Every line is a candidate. No editor, no answer
  matching, just "which line is wrong?" so the feedback is instant.
- **Instant feedback.** The line you click flashes red or green, and a reveal
  panel explains the bug and the fix.
- **Streaks and spoiler-free sharing.** Solve today's puzzle to extend your
  streak, then copy a compact result card that shows your score, not the answer.
- **Practice archive.** Browse the last 30 days, filter by bug category, and
  replay any of them. Practice results never touch your daily streak.
- **Keyboard, sound, and motion.** Fully playable by keyboard, with synthesized
  sound effects, a persistent mute toggle, and `prefers-reduced-motion` support.

The bug bank ships with 32 hand-written puzzles across 7 languages (JavaScript,
TypeScript, Python, Go, Rust, Java, C) and all 8 bug categories: off-by-one,
null-check, type-coercion, scoping, mutation, async, comparison, and boundary.

## Sample result card

Sharing copies a spoiler-free grid to your clipboard. A solve on the second of
three attempts, on a four-day streak, looks like this:

```
Bughunt #187 — 2/3
🟥🟩
🔥 streak: 4
```

## Play

The daily puzzle is live at
[apps.charliekrug.com/bughunt](https://apps.charliekrug.com/bughunt/). To run it
locally:

```sh
npm install
npm run dev      # local dev server
```

## Development

```sh
npm test         # run the test suite (Vitest)
npm run test:coverage
npm run lint     # eslint, zero warnings allowed
npm run format   # prettier check
npm run build    # typecheck + production build to site/
```

The suite has 123 tests, including property-based tests (fast-check) over the
daily-seed math, the attempt state machine, syntax tokenizing, and the streak
invariant. Every pure logic module sits at 100% line coverage.

## Stack

TypeScript, [Vite](https://vitejs.dev/) for the build, and
[Vitest](https://vitest.dev/) for tests. No backend: the whole game ships as a
static site, and all state (streak, mute, onboarding-seen) lives in
`localStorage`. See [`docs/VISION.md`](docs/VISION.md) for the design rationale
and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a map of the codebase.

## License

MIT. See [`LICENSE`](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
