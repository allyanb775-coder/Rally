// Scoreboard on the court: the app lives on blue padel turf, white court lines divide
// the layout, and numbers glow on black stadium boards in dot-matrix yellow.
export const colors = {
  turf: '#1747C8',
  turfDeep: '#1239A8',
  turfDark: '#0E2E8A', // raised cards on the turf
  ink: '#060B1A', // scoreboard panels
  line: 'rgba(255,255,255,0.92)', // court lines
  lineSoft: 'rgba(255,255,255,0.18)',
  text: '#FFFFFF',
  muted: '#A9BCEB',
  inkMuted: '#6C7AA3', // muted text on ink
  led: '#FFD400',
  ledOff: '#1A2036', // unlit dots
  danger: '#FF7A7A',
  // legacy aliases used by shared code
  bg: '#1747C8',
  accent: '#FFD400',
  accentInk: '#060B1A',
  surface: '#0E2E8A',
  surface2: '#060B1A',
  border: 'rgba(255,255,255,0.18)',
  court: '#1747C8',
  courtLine: 'rgba(255,255,255,0.92)',
  gold: '#FFD400',
};

export const fonts = {
  black: 'NotoKufiArabic_900Black',
  extra: 'NotoKufiArabic_800ExtraBold',
  kufi: 'NotoKufiArabic_700Bold',
  bold: 'IBMPlexSansArabic_700Bold',
  medium: 'IBMPlexSansArabic_500Medium',
  body: 'IBMPlexSansArabic_400Regular',
};

// Square-ish corners: scoreboards and court glass, not soft bubbles.
export const radius = { sm: 3, md: 6, lg: 8, pill: 999 };
export const space = (n: number) => n * 4;
