# Bughunt

A daily Wordle-style puzzle for developers: one short function, exactly one planted bug.
Find the buggy line, see why it's wrong, keep your streak, share your score.

## Why

Code review is a skill, and skills get sharper with daily reps. Bughunt turns "spot the bug"
into a 60-second ritual: a new hand-crafted snippet every day, syntax-highlighted, with a
single deliberately planted defect. Click the line you think is broken. Get an instant
red/green verdict and a plain-English "here's why." Keep your streak. Share your result like
a Wordle grid, without spoiling the bug for anyone else.

## How it works

- **One puzzle a day**, the same for everyone — a deterministic daily seed picks today's
  snippet from a curated bug bank spanning multiple languages.
- **Click, don't type.** Every line is a candidate; find the one that's wrong.
- **Instant feedback.** The line you click flashes red or green and a reveal panel explains
  the bug and the fix.
- **Streaks and sharing.** Solve today's puzzle to extend your streak; share a compact,
  spoiler-free result card.

## Planned features

- Curated, hand-written bug bank across several languages (off-by-one errors, null checks,
  type coercion, scoping mistakes, and more), each with syntax highlighting and a written
  explanation.
- Deterministic daily puzzle selection so every player sees the same challenge on the same day.
- Local streak tracking and a shareable, Wordle-style result card.
- A practice-mode archive of past puzzles, filterable by category.
- Fully keyboard-playable, with synthesized sound effects and a persistent mute toggle.

## Stack

TypeScript, [Vite](https://vitejs.dev/) for the build, [Vitest](https://vitest.dev/) for
tests. No backend — the whole game ships as a static site.

## Status

Early scaffold. See [`docs/VISION.md`](docs/VISION.md) for the full design rationale and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## License

MIT — see [`LICENSE`](LICENSE).
