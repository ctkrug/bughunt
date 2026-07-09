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

- A practice-mode archive of past puzzles, filterable by category, that doesn't touch the
  daily streak.
- An expanded bug bank (30+ curated puzzles) and a first-time onboarding walkthrough.

## Stack

TypeScript, [Vite](https://vitejs.dev/) for the build, [Vitest](https://vitest.dev/) for
tests. No backend — the whole game ships as a static site; all state (streak, mute) lives in
`localStorage`.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # run the test suite
npm run lint     # eslint
npm run build    # typecheck + production build to dist/
```

## Status

The core loop and streak/sharing are built: click-to-reveal wow moment, deterministic daily
puzzle, an 8-language curated bug bank, local streak tracking, and a spoiler-free share card.
See [`docs/VISION.md`](docs/VISION.md) for the design rationale,
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan, and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a map of the codebase.

## License

MIT — see [`LICENSE`](LICENSE).
