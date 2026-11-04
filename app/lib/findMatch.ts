import { levelFits } from './level.ts';
import { MATCH_SIZE, type Match } from './types.ts';

/**
 * "العب الحين": open matches a player can join, best first.
 * Joinable = level within range, not full, not already in, starts in the future.
 * Score prefers close level, nearly-full matches, soon start, short distance.
 */
export function rankMatches(matches: Match[], player: { id: string; level: number }, now: Date = new Date()): Match[] {
  const scored: { m: Match; score: number }[] = [];
  for (const m of matches) {
    const open = MATCH_SIZE - m.playerIds.length;
    const start = new Date(m.startsAt).getTime();
    if (open <= 0) continue;
    if (m.playerIds.includes(player.id)) continue;
    if (!levelFits(player.level, m)) continue;
    if (start <= now.getTime()) continue;

    const hoursAway = (start - now.getTime()) / 36e5;
    const mid = (m.minLevel + m.maxLevel) / 2;
    const score =
      Math.abs(player.level - mid) * 3 + // level fit
      open * 1 + // fewer missing = completes sooner
      Math.min(hoursAway, 72) / 12 + // sooner is better
      m.distanceKm / 3; // closer is better
    scored.push({ m, score });
  }
  return scored.sort((a, b) => a.score - b.score).map((x) => x.m);
}

export function findBestMatch(matches: Match[], player: { id: string; level: number }, now: Date = new Date()): Match | null {
  return rankMatches(matches, player, now)[0] ?? null;
}
