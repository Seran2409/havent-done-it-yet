/*
 * Takes README screenshots of the static export with sample data (phone size, light + dark).
 * Needs a running `npm run serve:web` on port 8090 and `npx playwright install chromium`.
 * Run: node scripts/screenshots.mjs
 */
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:8090/dont-fall-for-traps/';
const OUT = 'docs/screenshots';
mkdirSync(OUT, { recursive: true });

function sample(today) {
  const day = (n) => {
    const d = new Date(today + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const docs = [];
  const put = (col, id, doc) => docs.push({ key: col + '/' + id, col, id, doc, updatedAt: Date.now() });
  put('settings', 'main', { name: 'Seran', language: 'de', timezone: 'Europe/Berlin', dailyGoal: 3, mail: { enabled: true, time: '07:30' }, theme: 'system' });
  const todo = (id, title, scope, period, diff, subs = [], done = false) =>
    put('todos', id, { title, scope, period, diff, subs, done, doneOn: done ? today : null, createdAt: new Date().toISOString(), order: docs.length });
  todo('t1', 'Steuererklärung abschicken', 'tag', today, 3, [
    { id: 's1', title: 'Belege sammeln', done: true, doneOn: today },
    { id: 's2', title: 'Formular ausfüllen', done: false, doneOn: null },
  ]);
  todo('t2', 'Zahnarzttermin ausmachen', 'ewig', null, 1);
  todo('t3', 'Geschenk für Mama', 'tag', day(-1), 2);
  todo('t4', 'Fahrrad reparieren', 'woche', null, 2);
  todo('t5', 'Wäsche', 'tag', today, 1, [], true);
  put('routines', 'r1', { title: 'Wasser trinken (Glas)', emoji: '💧', scope: 'tag', target: 8, createdAt: '2026-01-01', order: 1 });
  put('routines', 'r2', { title: 'Lesen', emoji: '📚', scope: 'tag', target: 1, createdAt: '2026-01-01', order: 2 });
  put('routines', 'r3', { title: 'Laufen gehen', emoji: '🏃', scope: 'woche', target: 3, createdAt: '2026-01-01', order: 3 });
  for (let i = -90; i <= 0; i++) {
    if (i < -12 && (i * 7) % 5 === 0) continue;
    const r = { r1: 3 + ((i * 13) % 6 + 6) % 6, r2: i % 3 ? 1 : 0 };
    if (i % 2 === 0) r.r3 = 1;
    put('days', day(i), { date: day(i), routines: Object.fromEntries(Object.entries(r).filter(([, v]) => v > 0)) });
  }
  return docs;
}

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ ...devices['Pixel 7'], locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(BASE);
  const today = await page.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date()));
  await page.evaluate(
    (docs) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('dfft', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('docs', { keyPath: 'key' });
        req.onsuccess = () => {
          const tx = req.result.transaction('docs', 'readwrite');
          const s = tx.objectStore('docs');
          s.clear();
          for (const d of docs) s.put(d);
          tx.oncomplete = () => resolve(null);
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      }),
    sample(today),
  );
  for (const [route, name] of [
    ['', 'start'],
    ['todos', 'todos'],
    ['routines', 'routinen'],
    ['level', 'level'],
  ]) {
    await page.goto(BASE + route);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${name}-${scheme}.png` });
    console.log('wrote', `${OUT}/${name}-${scheme}.png`);
  }
  await ctx.close();
}
await browser.close();
