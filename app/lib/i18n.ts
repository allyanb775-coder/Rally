/** App language. Arabic is the default; English flips the layout to left-to-right. Pure (no React Native) so lib tests can import it. */
export type Lang = 'ar' | 'en';
export const LANG_KEY = 'rally.lang';

function initial(): Lang {
  const g = globalThis as any;
  let v: string | null | undefined;
  try {
    v = g.localStorage?.getItem(LANG_KEY);
  } catch {}
  // Sandboxed web frames can block storage; window.name survives there.
  if (!v && typeof g.name === 'string' && g.name.startsWith(LANG_KEY + '=')) v = g.name.slice(LANG_KEY.length + 1);
  return v === 'en' ? 'en' : 'ar';
}

let current: Lang = initial();

export const lang = () => current;
export const isAr = () => current === 'ar';
const listeners = new Set<(l: Lang) => void>();
export const onLangChange = (fn: (l: Lang) => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};
export const setCurrentLang = (l: Lang) => {
  if (l === current) return;
  current = l;
  listeners.forEach((fn) => fn(l));
};
/** Pick the string for the current language. */
export const tr = (ar: string, en: string) => (current === 'ar' ? ar : en);
/** Locale for dates and numbers; digits are always Latin. */
export const locale = () => (current === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US');
/** "and" joiner for names. */
export const and = () => tr(' و ', ' & ');
