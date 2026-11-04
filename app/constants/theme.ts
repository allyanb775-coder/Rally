export const colors = {
  // Black sports-brand look: full-bleed photos, white type, court blue as the one accent.
  bg: '#000000',
  card: '#0F0F11',
  ink: '#151518', // raised panels and bars
  text: '#FFFFFF',
  muted: '#8B9099',
  inkMuted: '#6B7079',
  line: 'rgba(255,255,255,0.92)',
  lineSoft: 'rgba(255,255,255,0.12)',
  blue: '#2F62FF', // court blue: the accent
  led: '#FFFFFF', // primary actions and active states (white with black text)
  ledOff: '#1E1E22',
  danger: '#FF5A5F',
  turf: '#1D4ED8', // the court drawing
  turfDeep: '#1239A8',
  turfDark: '#0F0F11',
  // aliases used by shared code
  accent: '#FFFFFF',
  accentInk: '#000000',
  surface: '#0F0F11',
  surface2: '#151518',
  border: 'rgba(255,255,255,0.08)',
  court: '#1D4ED8',
  courtLine: 'rgba(255,255,255,0.92)',
  gold: '#FFFFFF',
};

export const fonts = {
  display: 'Anton_400Regular', // English headlines and big numbers
  black: 'IBMPlexSansArabic_700Bold',
  extra: 'IBMPlexSansArabic_700Bold',
  kufi: 'IBMPlexSansArabic_700Bold',
  bold: 'IBMPlexSansArabic_700Bold',
  medium: 'IBMPlexSansArabic_500Medium',
  body: 'IBMPlexSansArabic_400Regular',
};

export const radius = { sm: 10, md: 14, lg: 18, pill: 999 };
export const space = (n: number) => n * 4;
