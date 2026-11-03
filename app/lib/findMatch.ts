import { MATCH_SIZE, type Match } from './types.ts';

/**
 * "لقّني مباراة": pick the best open match for a player.
 * Only matches the player can join (level within range, not full, not already in,
 * in the future). Score prefers close level, nearly-full matches, soon start, short distance.
 */
export function findBestMatch(
  matches: Match[],
  player: { id: string; level: number },
  now: Date = new Date(),
): Match | null {
  let best: { m: Match; score: number } | null = null;
  for (const m of matches) {
    const open = MATCH_SIZE - m.playerIds.length;
    const start = new Date(m.startsAt).getTime();
    if (open <= 0) continue;
    if (m.playerIds.includes(player.id)) continue;
    if (player.level < m.minLevel || player.level > m.maxLevel) continue;
    if (start <= now.getTime()) continue;

    const hoursAway = (start - now.getTime()) / 36e5;
    const mid = (m.minLevel + m.maxLevel) / 2;
    const score =
      Math.abs(player.level - mid) * 3 + // level fit
      open * 1 + // fewer missing = completes sooner
      Math.min(hoursAway, 72) / 12 + // sooner is better
      m.distanceKm / 3; // closer is better
    if (!best || score < best.score) best = { m, score };
  }
  return best?.m ?? null;
}
