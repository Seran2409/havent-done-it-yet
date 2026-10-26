/*
 * Renders the app icons from the warning-tape logo: app icon (tape across a black square),
 * Android adaptive layers, splash image, favicon and the web/PWA icons.
 * Run: node scripts/make-icons.mjs
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT = join(root, 'node_modules/@expo-google-fonts/anton/400Regular/Anton_400Regular.ttf');
const HAZARD = '#F5C21B';
const INK = '#1C1A0F';
const BLACK = '#121013';

/** The tape: frayed yellow band, striped ends, "DON'T FALL FOR" + inverted "TRAPS". Centered at 0,0. */
function tape({ width, height, fs, mono = false }) {
  const w = width;
  const h = height;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const pts = [
    [0, 0], [1, 0], [0.988, 0.22], [1, 0.46], [0.99, 0.72], [1, 1], [0, 1], [0.01, 0.76], [0, 0.52], [0.012, 0.26],
  ].map(([x, y]) => `${x0 + x * w},${y0 + y * h}`).join(' ');
  const end = h * 0.5;
  const fill = mono ? '#FFFFFF' : HAZARD;
  const ink = mono ? 'none' : INK;
  const band = fs * 0.12;
  const textA = "DON'T FALL FOR";
  const textB = 'TRAPS';
  // Widths are pinned with textLength so the inverted TRAPS box always fits its text.
  const wA = textA.length * fs * 0.47;
  const wBText = textB.length * fs * 0.52;
  const wB = wBText + fs * 0.4;
  const total = wA + fs * 0.25 + wB;
  const tx = -total / 2;
  const base = fs * 0.36;
  return `
    <defs>
      <clipPath id="tp"><polygon points="${pts}"/></clipPath>
      <pattern id="st" patternUnits="userSpaceOnUse" width="${h * 0.34}" height="${h * 0.34}" patternTransform="rotate(45)">
        <rect width="${h * 0.15}" height="${h * 0.34}" fill="${mono ? '#000' : INK}"/>
        <rect x="${h * 0.15}" width="${h * 0.19}" height="${h * 0.34}" fill="${fill}"/>
      </pattern>
    </defs>
    <g clip-path="url(#tp)">
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${fill}"/>
      ${mono ? '' : `<rect x="${x0}" y="${y0}" width="${end}" height="${h}" fill="url(#st)"/>
      <rect x="${x0 + w - end}" y="${y0}" width="${end}" height="${h}" fill="url(#st)"/>
      <rect x="${x0}" y="${y0}" width="${w}" height="${band * 0.6}" fill="${ink}"/>
      <rect x="${x0}" y="${y0 + h - band * 0.6}" width="${w}" height="${band * 0.6}" fill="${ink}"/>`}
    </g>
    ${mono ? '' : `
    <text x="${tx}" y="${base}" font-family="Anton" font-size="${fs}" textLength="${wA}" lengthAdjust="spacing" fill="${INK}">${textA.replace("'", '’')}</text>
    <rect x="${tx + wA + fs * 0.25}" y="${-fs * 0.56}" width="${wB}" height="${fs * 1.08}" rx="${fs * 0.06}" fill="${INK}"/>
    <text x="${tx + wA + fs * 0.25 + fs * 0.2}" y="${base}" font-family="Anton" font-size="${fs}" textLength="${wBText}" lengthAdjust="spacing" fill="${HAZARD}">${textB}</text>`}`;
}

function svg(size, body, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}
    ${body}
  </svg>`;
}

/** Tape crossing the square, slightly tilted, soft shadow. `scale` shrinks it for safe zones. */
function appIcon(size, { scale = 1, bg = BLACK, mono = false } = {}) {
  const s = size * scale;
  const t = tape({ width: s * 1.5, height: s * 0.2, fs: s * 0.092, mono });
  const shadow = mono ? '' : `<filter id="sh" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="${s * 0.012}" stdDeviation="${s * 0.014}" flood-color="#000" flood-opacity="0.45"/></filter>`;
  return svg(
    size,
    `<defs>${shadow}</defs><g transform="translate(${size / 2} ${size / 2}) rotate(-12)" ${mono ? '' : 'filter="url(#sh)"'}>${t}</g>`,
    bg,
  );
}

/** Splash: the full tape logo on transparent, splash background color comes from app.json. */
function splash(size) {
  const t = tape({ width: size * 0.98, height: size * 0.16, fs: size * 0.074 });
  return svg(size, `<g transform="translate(${size / 2} ${size / 2}) rotate(-2.5)">${t}</g>`);
}

function render(file, svgText, width) {
  const png = new Resvg(svgText, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'Anton' },
  })
    .render()
    .asPng();
  const out = join(root, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
  console.log('wrote', file, width + 'px');
}

render('assets/icon.png', appIcon(1024), 1024);
render('assets/android-icon-foreground.png', appIcon(1024, { scale: 0.62, bg: null }), 1024);
render('assets/android-icon-background.png', svg(1024, '', BLACK), 1024);
render('assets/android-icon-monochrome.png', appIcon(1024, { scale: 0.62, bg: null, mono: true }), 1024);
render('assets/splash-icon.png', splash(1024), 1024);
render('assets/favicon.png', appIcon(1024, { scale: 1.25 }), 48);
render('public/icons/icon-192.png', appIcon(1024), 192);
render('public/icons/icon-512.png', appIcon(1024), 512);
render('public/icons/maskable-512.png', appIcon(1024, { scale: 0.8 }), 512);
render('public/icons/apple-touch-icon.png', appIcon(1024), 180);
