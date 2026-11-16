import { locale, tr } from './i18n.ts';
export const fmtLevel = (n: number) => n.toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const fmtNum = (n: number) => n.toLocaleString(locale());
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' });
export const fmtWhen = (iso: string) => `${fmtDay(iso)} · ${fmtTime(iso)}`;
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' });

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** اليوم / بكرة / weekday name */
export function fmtDay(iso: string, now = new Date()) {
  const d = new Date(iso);
  if (dayKey(d) === dayKey(now)) return tr('اليوم', 'Today');
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  if (dayKey(d) === dayKey(t)) return tr('بكرة', 'Tomorrow');
  return d.toLocaleDateString(locale(), { weekday: 'long' });
}

export const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? tr('صباح الخير', 'Good morning') : tr('مساء الخير', 'Good evening');
}

/** Keep "2.0–3.5" or "11/16" reading left-to-right inside Arabic text (Unicode LTR isolate). */
export const ltr = (s: string) => `⁦${s}⁩`;
export const fmtRange = (min: number, max: number) => ltr(`${fmtLevel(min)}–${fmtLevel(max)}`);
