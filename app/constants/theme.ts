// Calm night-blue app with one yellow accent (the ball) and court-blue for the court drawing.
export const colors = {
  turf: '#1747C8',
  turfDeep: '#1239A8',
  turfDark: '#0E2E8A', // raised cards on the turf
  ink: '#0E1834', // darker cards and bars
  line: 'rgba(255,255,255,0.92)', // court lines
  lineSoft: 'rgba(255,255,255,0.18)',
  text: '#FFFFFF',
  muted: '#A9BCEB',
  inkMuted: '#6C7AA3', // muted text on ink
  led: '#FFD400',
  ledOff: '#1A2036', // unlit dots
  danger: '#FF7A7A',
  // legacy aliases used by shared code
  bg: '#0A1328',
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
  black: 'IBMPlexSansArabic_700Bold',
  extra: 'IBMPlexSansArabic_700Bold',
  kufi: 'IBMPlexSansArabic_700Bold',
  bold: 'IBMPlexSansArabic_700Bold',
  medium: 'IBMPlexSansArabic_500Medium',
  body: 'IBMPlexSansArabic_400Regular',
};

export const radius = { sm: 10, md: 14, lg: 18, pill: 999 };
export const space = (n: number) => n * 4;
