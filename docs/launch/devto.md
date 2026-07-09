---
title: "I built a daily bug-spotting puzzle for developers"
published: false
tags: javascript, typescript, webdev, gamedev
---

# I built a daily bug-spotting puzzle for developers

Wordle proved that a tiny daily ritual can hold a huge audience: one puzzle, one
shot, five minutes, everyone comparing notes. Developers do not have an
equivalent for the skill we actually practice for a living, which is reading code
and spotting what is wrong with it. So I built [Bughunt](https://apps.charliekrug.com/bughunt/):
every day there is one short function with exactly one planted bug, and your job
is to find the buggy line.

You read the function, click the line you think is broken, and get an instant
verdict. A correct line flashes green and explains the fix. A wrong line flashes
red and costs one of your three attempts. Solve it to keep your streak, then
share a spoiler-free grid. The whole thing is a static site with no backend, no
accounts, and no tracking.

Here are the two build decisions I found most interesting.

## A deterministic daily puzzle with no server

Wordle's "same puzzle for everyone today" is what makes it social, and I wanted
that without running a backend. The trick is to derive the puzzle from the date
instead of storing it. I fixed an epoch (puzzle #1 is 2024-01-01 UTC) and count
whole UTC days since then:

```ts
const EPOCH = Date.UTC(2024, 0, 1);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function puzzleNumberForDate(date: Date): number {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.floor((utcMidnight - EPOCH) / MS_PER_DAY) + 1;
}
```

The puzzle number wraps around the bug bank with a modulo, so a far-future date
still maps to a real entry instead of running off the end. Everything reduces to
that one pure function, which makes the behavior trivial to test and means two
people in different timezones still get the same puzzle on the same calendar day.

## Curated bugs, one correct line, always

Every puzzle is hand-written, not generated. That was a deliberate constraint. A
planted bug has to be subtle enough to require real reading but unambiguous
enough that exactly one line is the answer. Ambiguity kills trust in a puzzle
game: if two lines could reasonably be "the bug," every solve feels like a coin
flip. The bank covers the mistakes that actually bite in review, like off-by-one
indexing, missing null checks, integer division hiding inside a float return,
mutation of a caller's array, and a forgotten `await` inside `forEach`.

Because the interaction is "pick a line" rather than "type a fix," the feedback
can be binary and instant. There is no answer matching and no editor to fight.

## What property-based testing caught

I added [fast-check](https://github.com/dubzzz/fast-check) over the date math,
and it immediately found an edge I had waved off: feeding an invalid `Date`
produced a `NaN` index, and the function returned `undefined` while its type
signature promised a `Puzzle`. Production never reaches that path (parsed
practice dates are validated first), but the type was lying. The fix was a
one-line guard that throws on a non-finite puzzle number, matching the existing
empty-bank guard. That is the whole value of property testing in miniature: it
does not care what you think the inputs are.

## What I would do differently

The bug bank is the moat, and 32 puzzles is a start, not a finish. The obvious
next step is a lightweight authoring format so new puzzles are cheap to add and
easy to sanity-check (one bug, one correct line, a written explanation). I would
also like per-category stats so you can see whether async bugs or scoping bugs
trip you up more often.

Play today's puzzle at [apps.charliekrug.com/bughunt](https://apps.charliekrug.com/bughunt/),
and the source is on [GitHub](https://github.com/ctkrug/bughunt). If you try it,
I would love to know which bug category you find hardest.
