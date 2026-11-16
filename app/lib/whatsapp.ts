import { tr } from './i18n.ts';
import { normalizeSaudiPhone } from './phone.ts';

/** wa.me link to a Saudi mobile with a prefilled message, or null if the number isn't valid. */
export function waLink(phone: string | undefined, text: string): string | null {
  const p = phone ? normalizeSaudiPhone(phone) : null;
  if (!p) return null;
  return `https://wa.me/${p.slice(1)}?text=${encodeURIComponent(text)}`;
}

/** The message a player sends the organizer to register and pay for a tournament. */
export function tournamentMessage(t: { name: string; fee: number }, player: { name: string; level: number }): string {
  return tr(
    `السلام عليكم، أبي أسجّل في «${t.name}» عن طريق Rally.\nالاسم: ${player.name}\nالمستوى: ${player.level.toFixed(1)}\nالرسوم: ${t.fee} ر.س، وش طريقة الدفع؟`,
    `Hi, I'd like to register for "${t.name}" via Rally.\nName: ${player.name}\nLevel: ${player.level.toFixed(1)}\nFee: SAR ${t.fee}. How do I pay?`,
  );
}
