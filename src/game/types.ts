/** Data model, identical to the prototype so its export imports 1:1. Internal scope keys stay German. */

export type Scope = 'ewig' | 'tag' | 'woche' | 'monat' | 'jahr';
export type RoutineScope = 'tag' | 'woche' | 'monat' | 'jahr';
export type PeriodScope = RoutineScope;
export type Diff = 1 | 2 | 3;
/** Calendar day in the user's time zone, "YYYY-MM-DD". */
export type DayKey = string;

export interface Sub {
  id: string;
  title: string;
  done: boolean;
  doneOn: DayKey | null;
}

export interface Todo {
  id: string;
  title: string;
  /** 'ewig' = no date, 'tag' = day to-do (both live in the "Now" tab). */
  scope: Scope;
  /** ewig: null · tag: "2026-10-26" · woche: "2026-W44" · monat: "2026-10" · jahr: "2026" */
  period: string | null;
  diff: Diff;
  subs: Sub[];
  done: boolean;
  doneOn: DayKey | null;
  /** Deleted, but still counts towards XP. */
  archived?: boolean;
  createdAt: string;
  order: number;
}

export interface Routine {
  id: string;
  title: string;
  emoji: string;
  scope: RoutineScope;
  /** Times per period, >= 1. */
  target: number;
  archived?: boolean;
  createdAt: string;
  order: number;
}

export interface Day {
  date: DayKey;
  /** routineId -> number of check-ins on this day */
  routines: Record<string, number>;
}

export type Language = 'system' | 'de' | 'en';
export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  name: string;
  language: Language;
  timezone: string;
  dailyGoal: number;
  mail: { enabled: boolean; time?: string };
  /** Local reminders on the phone. Times are "HH:MM" in device time. */
  push?: { enabled: boolean; time?: string; evening?: boolean; eveningTime?: string };
  theme?: ThemePref;
  /** Welcome screen was shown. */
  onboarded?: boolean;
}

/** Export/import format and the in-memory state shape. */
export interface AppData {
  settings: Settings;
  todos: Record<string, Todo>;
  routines: Record<string, Routine>;
  days: Record<DayKey, Day>;
}
