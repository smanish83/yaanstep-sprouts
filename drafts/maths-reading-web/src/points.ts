// Draft rules for review by Leela (age fit) and Omar (reward design). Not final.
export interface Progress {
  points: number;
  lastDay: number | null; // day number (days since 1 Jan 2026), no dates stored
  streak: number;
  restDaysUsed: { week: number; used: number };
  milestones: Record<string, boolean>; // band -> passed
}
export const newProgress = (): Progress => ({ points: 0, lastDay: null, streak: 0, restDaysUsed: { week: -1, used: 0 }, milestones: {} });

export const POINTS_PER_CORRECT = 10;
export const SET_BONUS = 5;

// Finishing a daily set. Points never go down. One missed day per week is forgiven.
export function finishDailySet(p: Progress, day: number, correct: number): Progress {
  const n: Progress = JSON.parse(JSON.stringify(p));
  if (n.lastDay === day) return n; // same day again: no double reward
  n.points += correct * POINTS_PER_CORRECT + SET_BONUS;
  const gap = n.lastDay === null ? 0 : day - n.lastDay;
  if (n.lastDay === null || gap === 1) n.streak += 1;
  else if (gap === 2) {
    const week = Math.floor(day / 7);
    if (n.restDaysUsed.week !== week) n.restDaysUsed = { week, used: 0 };
    if (n.restDaysUsed.used < 1) { n.restDaysUsed.used += 1; n.streak += 1; }
    else n.streak = 1;
  } else n.streak = 1; // restart gently; points are kept
  n.lastDay = day;
  return n;
}

export const MILESTONE_SIZE = 10;
export const MILESTONE_PASS = 8;
export function finishMilestone(p: Progress, band: string, correct: number): { progress: Progress; passed: boolean } {
  const n: Progress = JSON.parse(JSON.stringify(p));
  const passed = correct >= MILESTONE_PASS;
  if (passed) n.milestones[band] = true; // retry is always allowed; a miss changes nothing
  return { progress: n, passed };
}

// Endless play (no fixed sets): points per question and a forgiving day streak, once per day.
export const POINTS_FIRST_TRY = 10;
export const POINTS_RETRY = 5;
function touchDay(n: Progress, day: number): void {
  if (n.lastDay === day) return;
  const gap = n.lastDay === null ? 0 : day - n.lastDay;
  if (n.lastDay === null || gap === 1) n.streak += 1;
  else if (gap === 2) {
    const week = Math.floor(day / 7);
    if (n.restDaysUsed.week !== week) n.restDaysUsed = { week, used: 0 };
    if (n.restDaysUsed.used < 1) { n.restDaysUsed.used += 1; n.streak += 1; } else n.streak = 1;
  } else n.streak = 1;
  n.lastDay = day;
}
export function recordAnswer(p: Progress, day: number, firstTry: boolean): Progress {
  const n: Progress = JSON.parse(JSON.stringify(p));
  n.points += firstTry ? POINTS_FIRST_TRY : POINTS_RETRY; // points never go down
  touchDay(n, day);
  return n;
}
