import type { Stats } from './compute';
import { periodKey, shiftPeriod } from './dates';
import type { AppData, DayKey, Routine, RoutineScope } from './types';

export const targetOf = (r: Routine) => Math.max(1, r.target || 1);

export function activeRoutines(routines: Record<string, Routine>): Routine[] {
  return Object.entries(routines)
    .filter(([, r]) => !r.archived)
    .map(([id, r]) => ({ ...r, id }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/** Check-ins of a routine in the period that contains day d. */
export function periodCount(st: Stats, r: Routine, d: DayKey): number {
  return st.pc.get(r.id + '|' + periodKey(r.scope, d)) || 0;
}

export function todayCount(days: AppData['days'], r: Routine, today: DayKey): number {
  return days[today]?.routines?.[r.id] || 0;
}

/** Daily routine with target 1 behaves like a checkbox. */
export const isToggleOnly = (r: Routine) => r.scope === 'tag' && targetOf(r) === 1;

export interface ReviewEntry {
  /** a day inside that period */
  day: DayKey;
  count: number;
  hit: boolean;
}

/** Look back: the last 6 finished periods, hits among them and the current run of hits. */
export function routineReview(st: Stats, r: Routine, today: DayKey) {
  const target = targetOf(r);
  const entries: ReviewEntry[] = [];
  for (let i = 6; i >= 1; i--) {
    const day = shiftPeriod(r.scope, today, -i);
    const count = periodCount(st, r, day);
    entries.push({ day, count, hit: count >= target });
  }
  let run = 0;
  for (let i = 1; i <= 12; i++) {
    if (periodCount(st, r, shiftPeriod(r.scope, today, -i)) >= target) run++;
    else break;
  }
  return { entries, hits: entries.filter((e) => e.hit).length, run };
}

/** "This week: 1 of 2 met · Last week: 2 of 2" */
export function scopeSummary(st: Stats, list: Routine[], scope: RoutineScope, today: DayKey) {
  const prev = shiftPeriod(scope, today, -1);
  return {
    total: list.length,
    metNow: list.filter((r) => periodCount(st, r, today) >= targetOf(r)).length,
    metPrev: list.filter((r) => periodCount(st, r, prev) >= targetOf(r)).length,
  };
}

/** Routines still open in their current period, per scope (badge counts on the tabs). */
export function openRoutineCount(st: Stats, list: Routine[], scope: RoutineScope, today: DayKey): number {
  return list.filter((r) => r.scope === scope && periodCount(st, r, today) < targetOf(r)).length;
}
