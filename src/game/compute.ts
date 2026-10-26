import { ACHIEVEMENTS } from './achievements';
import { addDays, periodKey } from './dates';
import { levelInfo, type LevelInfo } from './level';
import { GOAL_BONUS, ROUT_BONUS, ROUT_XP, SUB_XP } from './rules';
import { todoXp } from './todos';
import type { AppData, DayKey, RoutineScope } from './types';

export interface Stats {
  xpByDay: Map<DayKey, number>;
  total: number;
  level: LevelInfo;
  streak: number;
  best: number;
  todosDone: number;
  subsDone: number;
  yearlyDone: number;
  /** "routineId|periodKey" -> check-ins in that period */
  pc: Map<string, number>;
  checkins: number;
  checkinsByDay: Map<DayKey, number>;
  perfectDays: number;
  perfect: Set<DayKey>;
  met: Record<RoutineScope, number>;
  unlocked: Set<string>;
}

type ComputeInput = Pick<AppData, 'todos' | 'routines' | 'days'>;

/** XP is never stored; it is always derived from the data. */
export function compute(data: ComputeInput, today: DayKey, dailyGoal: number): Stats {
  const xpByDay = new Map<DayKey, number>();
  const add = (day: DayKey | null, x: number) => {
    if (!day || !x) return;
    xpByDay.set(day, (xpByDay.get(day) || 0) + x);
  };

  let todosDone = 0;
  let subsDone = 0;
  let yearlyDone = 0;
  for (const t of Object.values(data.todos)) {
    for (const s of t.subs || []) {
      if (s.done && s.doneOn) {
        add(s.doneOn, SUB_XP);
        subsDone++;
      }
    }
    if (t.done && t.doneOn) {
      add(t.doneOn, todoXp(t));
      todosDone++;
      if (t.scope === 'jahr') yearlyDone++;
    }
  }

  const pc = new Map<string, number>();
  const checkinsByDay = new Map<DayKey, number>();
  const perfect = new Set<DayKey>();
  const met: Record<RoutineScope, number> = { tag: 0, woche: 0, monat: 0, jahr: 0 };
  let checkins = 0;
  for (const dk of Object.keys(data.days).sort()) {
    const r = data.days[dk]?.routines || {};
    let dayCount = 0;
    for (const rid of Object.keys(r)) {
      const c = Number(r[rid]) || 0;
      const rt = data.routines[rid];
      if (!rt || c <= 0) continue;
      add(dk, (ROUT_XP[rt.scope] ?? 10) * c);
      checkins += c;
      dayCount += c;
      const k = rid + '|' + periodKey(rt.scope, dk);
      const before = pc.get(k) || 0;
      const after = before + c;
      pc.set(k, after);
      const target = Math.max(1, rt.target || 1);
      if (before < target && after >= target) {
        add(dk, ROUT_BONUS[rt.scope] ?? 0);
        met[rt.scope]++;
      }
    }
    checkinsByDay.set(dk, dayCount);
    if (dailyGoal > 0 && dayCount >= dailyGoal) {
      add(dk, GOAL_BONUS);
      perfect.add(dk);
    }
  }

  let total = 0;
  for (const v of xpByDay.values()) total += v;

  let streak = 0;
  let d = today;
  if (!((xpByDay.get(d) || 0) > 0)) d = addDays(d, -1);
  while ((xpByDay.get(d) || 0) > 0) {
    streak++;
    d = addDays(d, -1);
  }

  const active = [...xpByDay.keys()].filter((k) => (xpByDay.get(k) || 0) > 0).sort();
  let best = 0;
  let run = 0;
  let prev: DayKey | null = null;
  for (const k of active) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  }

  const st: Stats = {
    xpByDay,
    total,
    level: levelInfo(total),
    streak,
    best,
    todosDone,
    subsDone,
    yearlyDone,
    pc,
    checkins,
    checkinsByDay,
    perfectDays: perfect.size,
    perfect,
    met,
    unlocked: new Set(),
  };
  st.unlocked = new Set(ACHIEVEMENTS.filter((a) => a.ok(st)).map((a) => a.key));
  return st;
}
