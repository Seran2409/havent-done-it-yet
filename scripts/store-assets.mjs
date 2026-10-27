/*
 * Store graphics with captions, German and English:
 *   App Store  1320×2868 (iPhone 6.9")  → docs/store/screenshots/ios/<lang>/
 *   Google Play 1080×1920               → docs/store/screenshots/android/<lang>/
 *   Play feature graphic 1024×500       → docs/store/feature-graphic-<lang>.png
 * Needs the web export served (npm run export:web && npm run serve:web) and Playwright's Chromium.
 * Run: node scripts/store-assets.mjs [baseUrl]
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'http://localhost:8090/havent-done-it-yet/';
const TODAY = '2026-10-27';
const font = (p) => readFileSync(join(root, 'node_modules/@expo-google-fonts', p)).toString('base64');
const FONTS = `
@font-face{font-family:Unbounded;font-weight:800;src:url(data:font/ttf;base64,${font('unbounded/800ExtraBold/Unbounded_800ExtraBold.ttf')})}
@font-face{font-family:Atkinson;font-weight:400;src:url(data:font/ttf;base64,${font('atkinson-hyperlegible/400Regular/AtkinsonHyperlegible_400Regular.ttf')})}
@font-face{font-family:Anton;src:url(data:font/ttf;base64,${font('anton/400Regular/Anton_400Regular.ttf')})}`;

const SAMPLE = {
  de: {
    name: 'Alex',
    todos: [
      ['t1', 'Steuererklärung abschicken', 'tag', 3, ['Belege sammeln', 'Formular ausfüllen']],
      ['t2', 'Zahnarzttermin ausmachen', 'ewig', 1],
      ['t3', 'Geschenk für Mama', 'tag-1', 2],
      ['t4', 'Fahrrad reparieren', 'woche', 2, ['Schlauch kaufen', 'Reifen wechseln', 'Bremsen prüfen']],
      ['t5', 'Wäsche aufhängen', 'done', 1],
    ],
    routines: [['r4', 'Dehnen', '🧘', 'tag', 1, 'morning'], ['r1', 'Wasser trinken (Glas)', '💧', 'tag', 8], ['r2', 'Lesen', '📚', 'tag', 1, 'evening'], ['r3', 'Laufen gehen', '🏃', 'woche', 3]],
  },
  en: {
    name: 'Alex',
    todos: [
      ['t1', 'File the tax return', 'tag', 3, ['Collect receipts', 'Fill in the form']],
      ['t2', 'Book a dentist appointment', 'ewig', 1],
      ['t3', 'Birthday gift for mom', 'tag-1', 2],
      ['t4', 'Fix the bike', 'woche', 2, ['Buy a tube', 'Change the tire', 'Check the brakes']],
      ['t5', 'Hang up the laundry', 'done', 1],
    ],
    routines: [['r4', 'Stretch', '🧘', 'tag', 1, 'morning'], ['r1', 'Drink water (glass)', '💧', 'tag', 8], ['r2', 'Read', '📚', 'tag', 1, 'evening'], ['r3', 'Go for a run', '🏃', 'woche', 3]],
  },
};

const SHOTS = {
  de: [
    ['', 'light', 'Deine To-dos.<br>Als Spiel.', 'Abhaken bringt XP, Level und Abzeichen.', 'yellow'],
    ['todos', 'light', 'Große Ziele,<br>kleine Schritte.', 'Unterpunkte zeigen deinen Fortschritt.', 'plum'],
    ['routines', 'dark', 'Routinen,<br>die bleiben.', 'Tagesziel, Streak und Bonus-XP.', 'black'],
    ['level', 'light', 'Steig im<br>Level auf.', '14 Abzeichen, Heatmap und Rekorde.', 'yellow'],
    ['', 'dark', 'Ohne Konto.<br>Ohne Werbung.', 'Deine Daten bleiben auf deinem Handy.', 'plum'],
  ],
  en: [
    ['', 'light', 'Your to-dos.<br>As a game.', 'Tick it off, earn XP, level up.', 'yellow'],
    ['todos', 'light', 'Big goals,<br>small steps.', 'Subtasks show your progress.', 'plum'],
    ['routines', 'dark', 'Routines<br>that stick.', 'Daily goal, streak and bonus XP.', 'black'],
    ['level', 'light', 'Level up.', '14 badges, heatmap and records.', 'yellow'],
    ['', 'dark', 'No account.<br>No ads.', 'Your data stays on your phone.', 'plum'],
  ],
};

const THEMES = {
  yellow: { bg: 'linear-gradient(160deg,#FFD84D,#F5C21B)', head: '#1C1A0F', sub: '#3A3115' },
  plum: { bg: 'linear-gradient(160deg,#8A3A7A,#55194A)', head: '#FFFFFF', sub: '#F3D9EC' },
  black: { bg: 'linear-gradient(160deg,#2A272C,#121013)', head: '#F5C21B', sub: '#CBC4CC' },
};

function day(n) {
  const d = new Date(TODAY + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function docs(lang) {
  const s = SAMPLE[lang];
  const out = [];
  const put = (col, id, doc) => out.push({ key: col + '/' + id, col, id, doc, updatedAt: 0 });
  put('settings', 'main', { name: s.name, language: lang, timezone: 'Europe/Berlin', dailyGoal: 3, mail: { enabled: false }, theme: 'system', onboarded: true });
  s.todos.forEach(([id, title, kind, diff, subs = []], i) => {
    const scope = kind === 'done' ? 'tag' : kind === 'tag-1' ? 'tag' : kind;
    const period = scope === 'ewig' ? null : scope === 'woche' ? '2026-W44' : kind === 'tag-1' ? day(-1) : TODAY;
    put('todos', id, {
      title, scope, period, diff, done: kind === 'done', doneOn: kind === 'done' ? TODAY : null, createdAt: '2026-10-01T08:00:00Z', order: i,
      subs: subs.map((t, j) => ({ id: `${id}s${j}`, title: t, done: j === 0, doneOn: j === 0 ? TODAY : null })),
    });
  });
  s.routines.forEach(([id, title, emoji, scope, target, slot], i) => put('routines', id, { title, emoji, scope, target, ...(slot ? { slot } : {}), createdAt: '2026-08-01', order: i }));
  // History: finished (archived) to-dos over the past weeks, so the stats look lived-in.
  for (let i = 1; i <= 46; i++) {
    const d = day(-((i * 2) % 90) - 1);
    put('todos', 'h' + i, { title: 'done', scope: 'ewig', period: null, diff: 1 + (i % 3), subs: [], done: true, doneOn: d, archived: true, createdAt: '2026-08-01', order: 100 + i });
  }
  for (let i = -100; i <= 0; i++) {
    if (i < -14 && (i * 7) % 5 === 0) continue;
    const r = { r4: 1, r1: i === 0 ? 3 : 3 + ((((i * 13) % 6) + 6) % 6), r2: i === 0 ? 0 : i % 3 ? 1 : 0 };
    if (i % 2 === 0) r.r3 = 1;
    put('days', day(i), { date: day(i), routines: Object.fromEntries(Object.entries(r).filter(([, n]) => n > 0)) });
  }
  return out;
}

async function seed(page, lang) {
  await page.evaluate(
    (d) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('dfft', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('docs', { keyPath: 'key' });
        req.onsuccess = () => {
          const tx = req.result.transaction('docs', 'readwrite');
          const st = tx.objectStore('docs');
          st.clear();
          for (const x of d) st.put(x);
          tx.oncomplete = () => resolve(null);
          tx.onerror = () => reject(tx.error);
        };
      }),
    docs(lang),
  );
}

async function raw(browser, lang, route, scheme) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: scheme, locale: lang === 'de' ? 'de-DE' : 'en-US', timezoneId: 'Europe/Berlin' });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date('2026-10-27T08:30:00+01:00'));
  await page.goto(BASE);
  await seed(page, lang);
  await page.goto(BASE + route);
  await page.waitForTimeout(1500);
  const png = await page.screenshot();
  await ctx.close();
  return png.toString('base64');
}

function composeHtml({ w, h, head, sub, theme, img, headSize, subSize, phoneW, top }) {
  const t = THEMES[theme];
  return `<!doctype html><html><head><style>${FONTS}
*{margin:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;background:${t.bg};overflow:hidden;position:relative;font-family:Atkinson,sans-serif;padding-top:${top}px}
.stripes{position:absolute;left:0;right:0;top:0;height:${Math.round(w * 0.018)}px;background:repeating-linear-gradient(-45deg,#F5C21B 0 ${Math.round(w * 0.015)}px,#1C1A0F ${Math.round(w * 0.015)}px ${Math.round(w * 0.03)}px)}
h1{font-family:Unbounded;font-weight:800;color:${t.head};font-size:${headSize}px;line-height:1.08;letter-spacing:-0.02em;text-align:center;padding:0 ${Math.round(w * 0.06)}px}
p{color:${t.sub};font-size:${subSize}px;text-align:center;margin-top:${Math.round(subSize * 0.6)}px;padding:0 ${Math.round(w * 0.08)}px}
.phone{margin:${Math.round(subSize * 1.6)}px auto 0;width:${phoneW}px;border-radius:${Math.round(phoneW * 0.11)}px;background:#121013;padding:${Math.round(phoneW * 0.018)}px;box-shadow:0 ${Math.round(w * 0.02)}px ${Math.round(w * 0.06)}px rgba(0,0,0,.35)}
.phone img{display:block;width:100%;border-radius:${Math.round(phoneW * 0.095)}px}
</style></head><body><div class="stripes"></div><h1>${head}</h1><p>${sub}</p><div class="phone"><img src="data:image/png;base64,${img}"></div></body></html>`;
}

function featureHtml(lang, img) {
  const tag = lang === 'de' ? 'To-dos und Routinen als Spiel' : 'Gamified to-dos and habits';
  return `<!doctype html><html><head><style>${FONTS}
*{margin:0;box-sizing:border-box}
body{width:1024px;height:500px;background:linear-gradient(150deg,#2A272C,#121013);overflow:hidden;position:relative;font-family:Atkinson,sans-serif}
.tape{position:absolute;left:56px;top:150px;transform:rotate(-3deg);background:#F5C21B;color:#1C1A0F;font-family:Anton;font-size:46px;letter-spacing:.05em;text-transform:uppercase;padding:14px 26px 10px;box-shadow:inset 0 4px 0 #1C1A0F,inset 0 -4px 0 #1C1A0F,0 10px 30px rgba(0,0,0,.4)}
.tape b{font-weight:400;background:#1C1A0F;color:#F5C21B;padding:4px 10px 2px;margin-left:10px;border-radius:3px}
.tag{position:absolute;left:64px;top:290px;color:#F2EEF1;font-family:Unbounded;font-weight:800;font-size:30px;letter-spacing:-0.01em}
.phone{position:absolute;right:46px;top:40px;width:250px;border-radius:30px;background:#000;padding:6px;transform:rotate(6deg);box-shadow:0 20px 50px rgba(0,0,0,.5)}
.phone img{display:block;width:100%;border-radius:25px}
</style></head><body><div class="tape">Haven’t done it<b>yet!</b></div><div class="tag">${tag}</div><div class="phone"><img src="data:image/png;base64,${img}"></div></body></html>`;
}

async function render(browser, html, w, h, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, await page.screenshot());
  await page.close();
  console.log('wrote', file.replace(root + '\\', '').replace(root + '/', ''));
}

const browser = await chromium.launch();
for (const lang of ['de', 'en']) {
  const shots = SHOTS[lang];
  let first = null;
  for (let i = 0; i < shots.length; i++) {
    const [route, scheme, head, sub, theme] = shots[i];
    const img = await raw(browser, lang, route, scheme);
    first ??= img;
    const n = `${i + 1}-${route || 'start'}-${scheme}`;
    await render(browser, composeHtml({ w: 1320, h: 2868, head, sub, theme, img, headSize: 112, subSize: 54, phoneW: 1000, top: 190 }), 1320, 2868, join(root, `docs/store/screenshots/ios/${lang}/${n}.png`));
    await render(browser, composeHtml({ w: 1080, h: 1920, head, sub, theme, img, headSize: 74, subSize: 36, phoneW: 640, top: 110 }), 1080, 1920, join(root, `docs/store/screenshots/android/${lang}/${n}.png`));
  }
  await render(browser, featureHtml(lang, first), 1024, 500, join(root, `docs/store/feature-graphic-${lang}.png`));
}
await browser.close();
