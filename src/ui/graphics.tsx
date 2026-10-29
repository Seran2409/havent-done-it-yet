import { BlurView } from 'expo-blur';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Pattern, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';
import { T } from './Text';

/* ---------- color helpers ---------- */

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** color-mix(in srgb, a p, b) */
export function mix(a: string, b: string, p: number): string {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return '#' + x.map((v, i) => Math.round(v * p + y[i] * (1 - p)).toString(16).padStart(2, '0')).join('');
}

/** Split "rgba(r,g,b,a)" for SVG stops, which take color and opacity separately. */
function rgba(s: string): { color: string; opacity: number } {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return { color: s, opacity: 1 };
  const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim());
  return { color: `rgb(${r},${g},${b})`, opacity: Number(a) };
}

/* ---------- hazard stripes ---------- */

/** Diagonal black/yellow stripes, the hazard motif (logo ends, quote card edge). */
export function HazardStripes({ width, height, a, b, band = 9, gap }: { width: number | `${number}%`; height: number; a?: string; b?: string; band?: number; gap?: number }) {
  const { c } = useTheme();
  const id = 'hz' + useId().replace(/:/g, '');
  const g = gap ?? band;
  const p = band + g;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={p} height={p} patternTransform="rotate(45)">
          <Rect x={0} y={0} width={band} height={p} fill={a ?? c.hazard} />
          <Rect x={band} y={0} width={g} height={p} fill={b ?? c.hazardInk} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height={height} fill={`url(#${id})`} />
    </Svg>
  );
}

/** Empty-state picture: a checklist with one tick, crossed by warning tape. `ground` matches the card behind it. */
export function EmptyArt({ ground, width = 140 }: { ground?: string; width?: number }) {
  const { c } = useTheme();
  const id = 'et' + useId().replace(/:/g, '');
  const rows = [22, 37];
  return (
    <Svg width={width} height={(width * 90) / 140} viewBox="0 0 140 90" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={12} height={12} patternTransform="rotate(45)">
          <Rect x={0} y={0} width={6} height={12} fill="#F5C21B" />
          <Rect x={6} y={0} width={6} height={12} fill="#1C1A0F" />
        </Pattern>
      </Defs>
      <Rect x={38} y={6} width={64} height={78} rx={10} fill={ground ?? c.surface} stroke={c.ink} strokeWidth={2.5} />
      {rows.map((y, i) => (
        <G key={y}>
          <Rect x={48} y={y - 5} width={11} height={11} rx={3} fill={i === 0 ? c.hazard : 'none'} stroke={c.ink} strokeWidth={2} />
          {i === 0 ? <Path d={`M50.5 ${y + 0.5} l2.6 2.6 l4.6 -5`} fill="none" stroke={c.hazardInk} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /> : null}
          <Rect x={64} y={y - 2} width={i === 0 ? 28 : 22} height={4.5} rx={2.25} fill={c.lineStrong} />
        </G>
      ))}
      <G transform="rotate(-11 70 62)">
        <Rect x={10} y={55} width={120} height={15} fill={`url(#${id})`} />
        <Rect x={10} y={55} width={120} height={15} fill="none" stroke="#1C1A0F" strokeWidth={1.5} />
      </G>
    </Svg>
  );
}

/* ---------- logo ---------- */

/** "DON'T FALL FOR [TRAPS]" on yellow warning tape, slightly tilted, frayed edges. Stays yellow/black in dark mode. */
export function TapeLogo({ label, partA, partB, scale = 1 }: { label: string; partA: string; partB: string; scale?: number }) {
  const { width: vw } = useWindowDimensions();
  const [w, setW] = useState(0);
  const id = 'tp' + useId().replace(/:/g, '');
  const hazard = '#F5C21B';
  const ink = '#1C1A0F';
  const h = 27 * scale;
  const fs = Math.max(12.5, Math.min(15, vw * 0.037)) * scale;
  const pts = [
    [0, 0], [1, 0], [0.984, 0.22], [1, 0.46], [0.986, 0.72], [1, 1], [0, 1], [0.014, 0.76], [0, 0.52], [0.016, 0.26],
  ].map(([x, y]) => `${x * w},${y * h}`).join(' ');
  const end = 13 * scale;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ alignSelf: 'flex-start', transform: [{ rotate: '-2.5deg' }], transformOrigin: 'left center', filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.18))' }}
    >
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: h, paddingHorizontal: 18 * scale, flexDirection: 'row', alignItems: 'center' }}>
        {w > 0 ? (
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            <Defs>
              <ClipPath id={id + 'c'}>
                <Polygon points={pts} />
              </ClipPath>
              <Pattern id={id} patternUnits="userSpaceOnUse" width={9 * scale} height={9 * scale} patternTransform="rotate(45)">
                <Rect x={0} y={0} width={4 * scale} height={9 * scale} fill={ink} />
                <Rect x={4 * scale} y={0} width={5 * scale} height={9 * scale} fill={hazard} />
              </Pattern>
            </Defs>
            <G clipPath={`url(#${id}c)`}>
              <Rect x={0} y={0} width={w} height={h} fill={hazard} />
              <Rect x={0} y={0} width={end} height={h} fill={`url(#${id})`} />
              <Rect x={w - end} y={0} width={end} height={h} fill={`url(#${id})`} />
              <Rect x={0} y={0} width={w} height={2 * scale} fill={ink} />
              <Rect x={0} y={h - 2 * scale} width={w} height={2 * scale} fill={ink} />
            </G>
          </Svg>
        ) : null}
        <T style={{ fontFamily: fonts.tape, fontSize: fs, lineHeight: fs * 1.15, letterSpacing: fs * 0.05, textTransform: 'uppercase', color: ink, paddingTop: 2 }}>
          {partA}
        </T>
        <View style={{ backgroundColor: ink, borderRadius: 2, paddingHorizontal: 5 * scale, paddingTop: 3 * scale, paddingBottom: 2 * scale, marginLeft: 4 * scale }}>
          <T style={{ fontFamily: fonts.tape, fontSize: fs, lineHeight: fs * 1.15, letterSpacing: fs * 0.05, textTransform: 'uppercase', color: hazard }}>{partB}</T>
        </View>
      </View>
    </View>
  );
}

/* ---------- level emblem ---------- */

export function HexBadge({ level, size = 56 }: { level: number; size?: number }) {
  const { c } = useTheme();
  const fs = (level > 99 ? 13 : level > 9 ? 17 : 21) * (size / 56);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width={size} height={size} viewBox="0 0 56 56" style={StyleSheet.absoluteFill}>
        <Polygon points="28,3 50,15.5 50,40.5 28,53 6,40.5 6,15.5" fill={c.hazard} stroke={c.hazardInk} strokeWidth={3} strokeLinejoin="round" />
      </Svg>
      <T style={{ fontFamily: fonts.displayHeavy, fontSize: fs, lineHeight: fs * 1.2, color: c.hazardInk }}>{level}</T>
    </View>
  );
}

/* ---------- daily goal ring ---------- */

export function Ring({ value, goal, children }: { value: number; goal: number; children?: ReactNode }) {
  const { c } = useTheme();
  const r = 34;
  const circ = 2 * Math.PI * r;
  const p = goal ? Math.min(1, value / goal) : 0;
  return (
    <View style={{ width: 84, height: 84, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={84} height={84} viewBox="0 0 84 84" style={StyleSheet.absoluteFill}>
        <Circle cx={42} cy={42} r={r} fill="none" stroke={c.track} strokeWidth={9} />
        {p > 0 ? (
          <Circle
            cx={42}
            cy={42}
            r={r}
            fill="none"
            stroke={p >= 1 ? c.go : c.accent}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={`${(circ * p).toFixed(1)} ${circ.toFixed(1)}`}
            transform="rotate(-90 42 42)"
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

/* ---------- XP bar ---------- */

/** Striped yellow XP bar (game layer). */
export function XpBar({ pct, height = 12, label }: { pct: number; height?: number; label?: string }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const w = useSharedValue(pct);
  useEffect(() => {
    w.value = reduce ? pct : withTiming(pct, { duration: 600 });
  }, [pct, reduce, w]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(100, w.value))}%` }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}
      style={{ height, borderRadius: 99, backgroundColor: c.track, overflow: 'hidden' }}
    >
      <Animated.View style={[{ height, borderRadius: 99, overflow: 'hidden' }, fill]}>
        <HazardStripes width="100%" height={height} a={c.hazard} b={mix(c.hazard, c.hazardInk, 0.78)} band={8} gap={8} />
      </Animated.View>
    </View>
  );
}

/* ---------- heatmap ---------- */

export function Heatmap({ cells, label }: { cells: { key: string; level: 0 | 1 | 2 | 3 | 4 | -1; today: boolean }[]; label: string }) {
  const { c } = useTheme();
  const colors = [c.surface2, c.heat1, c.heat2, c.heat3, c.heat4];
  const weeks = Math.ceil(cells.length / 7);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: weeks }, (_, wi) => (
        <View key={wi} style={{ flex: 1, gap: 3 }}>
          {cells.slice(wi * 7, wi * 7 + 7).map((cell) => (
            <View
              key={cell.key}
              style={{
                aspectRatio: 1,
                borderRadius: 3,
                backgroundColor: cell.level < 0 ? 'transparent' : colors[cell.level],
                boxShadow: cell.today ? `0px 0px 0px 2px ${c.hazard}` : undefined,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/* ---------- background ---------- */

/** Very soft color blobs behind everything: plum top left, yellow top right, plum bottom. Fixed while scrolling. */
export function Backdrop() {
  const { c } = useTheme();
  const { width: w, height: h } = useWindowDimensions();
  const blobs = [
    { id: 'a', col: rgba(c.shadeA), cx: 0, cy: 0, rx: 1.1 * w, ry: 0.55 * h, stop: 0.62 },
    { id: 'b', col: rgba(c.shadeB), cx: w, cy: 0.04 * h, rx: 0.85 * w, ry: 0.45 * h, stop: 0.64 },
    { id: 'c', col: rgba(c.shadeC), cx: w / 2, cy: 1.08 * h, rx: 0.9 * w, ry: 0.5 * h, stop: 0.7 },
  ];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.bg }]}>
      <Svg width={w} height={h}>
        <Defs>
          {blobs.map((b) => (
            <RadialGradient key={b.id} id={'bg' + b.id} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fx={b.cx} fy={b.cy} gradientUnits="userSpaceOnUse">
              <Stop offset={0} stopColor={b.col.color} stopOpacity={b.col.opacity} />
              <Stop offset={b.stop} stopColor={b.col.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {blobs.map((b) => (
          <Ellipse key={b.id} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={`url(#bg${b.id})`} />
        ))}
      </Svg>
    </View>
  );
}

/* ---------- glass ---------- */

/** Translucent surface with blur behind it. Android gets the opaque fallback (blur there is experimental). */
export function Glass({ tone, style, children }: { tone: 'bar' | 'top'; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const { c, dark } = useTheme();
  const canBlur = Platform.OS !== 'android';
  const bg = canBlur ? (tone === 'bar' ? c.glass : c.glassTop) : c.glassSolid;
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      {canBlur ? <BlurView intensity={40} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />
      {children}
    </View>
  );
}
