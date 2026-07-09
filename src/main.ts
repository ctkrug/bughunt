import "./style.css";
import { bugBank } from "./puzzles/bank";
import { puzzleForDate, puzzleNumberForDate } from "./dailySeed";

const app = document.querySelector<HTMLDivElement>("#app")!;
const today = new Date();
const puzzle = puzzleForDate(bugBank, today);
const puzzleNumber = puzzleNumberForDate(today);

app.innerHTML = `
  <h1>Bughunt</h1>
  <p>Daily puzzle #${puzzleNumber} — "${puzzle.title}"</p>
  <p>The full click-to-hunt game lands in the next build pass.</p>
`;
