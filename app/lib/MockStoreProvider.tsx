import { ReactNode, useMemo, useState } from 'react';
import { ME_ID, seedCourts, seedMatches, seedPlayers, seedTournaments } from './mock';
import { Store, StoreContext } from './store';
import { levelChanges, teamOf } from './result';
import { Match, MATCH_SIZE, Team } from './types';

/** In-memory demo data, used when Supabase isn't configured. Resets on reload. */
export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState(() => Object.fromEntries(seedPlayers.map((p) => [p.id, p])));
  const [matches, setMatches] = useState(seedMatches);
  const [tournaments, setTournaments] = useState(seedTournaments);
  const [joinedTournaments, setJoined] = useState<string[]>([]);

  // Applies a result to everyone's level, as the database does on confirmation.
  const confirm = (m: Match) => {
    if (!m.result) return;
    const changes = levelChanges(m, players, m.result.winningTeam);
    setPlayers((ps) => {
      const next = { ...ps };
      for (const [id, c] of Object.entries(changes)) {
        next[id] = { ...next[id], level: c.after, matchesPlayed: next[id].matchesPlayed + 1, wins: next[id].wins + (c.won ? 1 : 0) };
      }
      return next;
    });
    setMatches((ms) => ms.map((x) => (x.id === m.id && x.result ? { ...x, result: { ...x.result, status: 'confirmed' } } : x)));
  };

  const value = useMemo<Store>(
    () => ({
      me: players[ME_ID],
      players,
      courts: seedCourts,
      matches,
      tournaments,
      joinedTournaments,
      refresh: async () => {},
      setMyLevel: async (level) => setPlayers((ps) => ({ ...ps, [ME_ID]: { ...ps[ME_ID], level } })),
      joinMatch: async (id) =>
        setMatches((ms) =>
          ms.map((m) =>
            m.id === id && m.playerIds.length < MATCH_SIZE && !m.playerIds.includes(ME_ID)
              ? { ...m, playerIds: [...m.playerIds, ME_ID] }
              : m,
          ),
        ),
      leaveMatch: async (id) =>
        setMatches((ms) => ms.map((m) => (m.id === id ? { ...m, playerIds: m.playerIds.filter((p) => p !== ME_ID) } : m))),
      createMatch: async (m) => {
        const id = `m${Date.now()}`;
        const c = seedCourts.find((x) => x.id === m.courtId);
        setMatches((ms) => [...ms, { ...m, id, court: c?.name ?? '', city: c?.city ?? '', hostId: ME_ID, playerIds: [ME_ID], distanceKm: 0 }]);
        return id;
      },
      reportResult: async (matchId, winningTeam: Team, score) => {
        const m = matches.find((x) => x.id === matchId);
        if (!m || m.result) return false;
        const reported: Match = { ...m, result: { winningTeam, score, status: 'pending', reportedBy: ME_ID } };
        setMatches((ms) => ms.map((x) => (x.id === matchId ? reported : x)));
        // Demo only: the other team "confirms" a moment later.
        setTimeout(() => confirm(reported), 2500);
        return true;
      },
      confirmResult: async (matchId, accept) => {
        const m = matches.find((x) => x.id === matchId);
        if (!m?.result || m.result.status !== 'pending') return false;
        if (teamOf(m, ME_ID) === teamOf(m, m.result.reportedBy)) return false;
        if (accept) confirm(m);
        else setMatches((ms) => ms.map((x) => (x.id === matchId ? { ...x, result: undefined } : x)));
        return true;
      },
      joinTournament: async (id) => {
        if (joinedTournaments.includes(id)) return;
        setJoined((j) => [...j, id]);
        setTournaments((ts) => ts.map((t) => (t.id === id && t.registered < t.capacity ? { ...t, registered: t.registered + 1 } : t)));
      },
    }),
    [players, matches, tournaments, joinedTournaments],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
