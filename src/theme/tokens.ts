/*
 * Design tokens, 1:1 from the prototype's :root (light) and dark block.
 * Yellow = game layer only, plum = complement, black = progress/actions, green = done, orange = streak/urgent.
 */

export const light = {
  bg: '#F7F5F1',
  surface: '#FFFFFF',
  surface2: '#EFECE6',
  ink: '#18161A',
  muted: '#67616A',
  line: '#E7E2DB',
  lineStrong: '#BDB5B8',
  hazard: '#F5C21B',
  hazardInk: '#1C1A0F',
  hazardSoft: '#FFF3C9',
  hazardText: '#6F5300',
  go: '#119464',
  goSoft: '#D3F3E4',
  onGo: '#FFFFFF',
  flame: '#E2541A',
  danger: '#C23A27',
  accent: '#18161A',
  accentSoft: '#EFECE6',
  onAccent: '#FFFFFF',
  plum: '#7A2E6B',
  plum2: '#55194A',
  plumText: '#6B2560',
  onPlum: '#FFFFFF',
  plumLabel: '#FFD54A',
  fabBg: '#18161A',
  fabFg: '#FFD84D',
  tabActiveFg: '#7A2E6B',
  tabActive: 'rgba(122,46,107,0.12)',
  wYellow: '#FFF8DF',
  wYellow2: '#FFEFBD',
  wPlum: '#F8EDF4',
  wPlum2: '#EFDAE8',
  wBlack: '#2A272C',
  wBlack2: '#121013',
  wBlackLine: 'transparent',
  onBlack: '#FFFFFF',
  onBlackMuted: '#CBC4CC',
  trackOnBlack: 'rgba(255,255,255,0.16)',
  wGreen: '#E0F5EA',
  wGreen2: '#C8EDDA',
  wOrange: '#FFEADF',
  wOrange2: '#FFD9C4',
  heat1: '#F1DCEA',
  heat2: '#D9A3C8',
  heat3: '#A9558F',
  heat4: '#6B2560',
  track: 'rgba(24,22,26,0.10)',
  shadeA: 'rgba(122,46,107,0.08)',
  shadeB: 'rgba(245,194,27,0.13)',
  shadeC: 'rgba(122,46,107,0.05)',
  quoteShine: 'rgba(255,255,255,0.14)',
  glass: 'rgba(255,255,255,0.72)',
  glassSolid: '#FFFFFF',
  glassLine: 'rgba(24,22,26,0.08)',
  glassTop: 'rgba(247,245,241,0.76)',
  glassShadow: '0px 10px 30px rgba(40,20,36,0.14), 0px 1px 3px rgba(24,22,26,0.08)',
  focus: '#7A2E6B',
  shadow: '0px 1px 2px rgba(40,20,36,0.05), 0px 6px 18px rgba(40,20,36,0.06)',
  scrim: 'rgba(8,14,12,0.5)',
};

export type Colors = typeof light;

export const dark: Colors = {
  bg: '#121014',
  surface: '#1C1A1F',
  surface2: '#27242B',
  ink: '#F2EEF1',
  muted: '#A8A0A8',
  line: '#312D35',
  lineStrong: '#4E4852',
  hazard: '#F7C93A',
  hazardInk: '#1C1A0F',
  hazardSoft: '#3A3115',
  hazardText: '#F7C93A',
  go: '#3BCB98',
  goSoft: '#123B2E',
  onGo: '#121014',
  flame: '#FF7E42',
  danger: '#F27461',
  accent: '#F2EEF1',
  accentSoft: '#2A272E',
  onAccent: '#121014',
  plum: '#6E2A61',
  plum2: '#45163C',
  plumText: '#E7AED7',
  onPlum: '#FFFFFF',
  plumLabel: '#FFD54A',
  fabBg: '#F7C93A',
  fabFg: '#1C1A0F',
  tabActiveFg: '#E7AED7',
  tabActive: 'rgba(231,174,215,0.16)',
  wYellow: '#36301A',
  wYellow2: '#2A2512',
  wPlum: '#34202F',
  wPlum2: '#291826',
  wBlack: '#2D2A31',
  wBlack2: '#19171B',
  wBlackLine: 'rgba(255,255,255,0.08)',
  onBlack: '#FFFFFF',
  onBlackMuted: '#C2BAC2',
  trackOnBlack: 'rgba(255,255,255,0.14)',
  wGreen: '#143F31',
  wGreen2: '#0E3125',
  wOrange: '#46281A',
  wOrange2: '#371E12',
  heat1: '#3A2235',
  heat2: '#6A3A5E',
  heat3: '#A8629A',
  heat4: '#E7AED7',
  track: 'rgba(255,255,255,0.12)',
  shadeA: 'rgba(160,70,140,0.16)',
  shadeB: 'rgba(247,201,58,0.06)',
  shadeC: 'rgba(160,70,140,0.08)',
  quoteShine: 'rgba(255,255,255,0.10)',
  glass: 'rgba(28,26,31,0.66)',
  glassSolid: '#1C1A1F',
  glassLine: 'rgba(255,255,255,0.08)',
  glassTop: 'rgba(18,16,20,0.72)',
  glassShadow: '0px 10px 30px rgba(0,0,0,0.5), 0px 1px 3px rgba(0,0,0,0.3)',
  focus: '#E7AED7',
  shadow: '0px 1px 2px rgba(0,0,0,0.3), 0px 8px 22px rgba(0,0,0,0.25)',
  scrim: 'rgba(0,0,0,0.6)',
};

/** Colors inside black widgets (.w-black overrides ink/muted/track/accent). */
export function onBlackColors(c: Colors): Colors {
  return { ...c, ink: c.onBlack, muted: c.onBlackMuted, track: c.trackOnBlack, accent: c.onBlack, onAccent: c.wBlack2 };
}

export type Tint = 'yellow' | 'plum' | 'black' | 'green' | 'orange';

export function tintColors(c: Colors, tint: Tint): [string, string] {
  switch (tint) {
    case 'yellow':
      return [c.wYellow, c.wYellow2];
    case 'plum':
      return [c.wPlum, c.wPlum2];
    case 'black':
      return [c.wBlack, c.wBlack2];
    case 'green':
      return [c.wGreen, c.wGreen2];
    case 'orange':
      return [c.wOrange, c.wOrange2];
  }
}

export const fonts = {
  display: 'Unbounded_700Bold',
  displayMedium: 'Unbounded_500Medium',
  displayHeavy: 'Unbounded_800ExtraBold',
  body: 'AtkinsonHyperlegible_400Regular',
  bodyBold: 'AtkinsonHyperlegible_700Bold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  tape: 'Anton_400Regular',
};

export const radius = { r: 16, sm: 10 };
export const MAX_WIDTH = 600;
export const GUTTER = 16;
