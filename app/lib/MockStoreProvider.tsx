import { ReactNode, useMemo, useState } from 'react';
import { ME_ID, seedCourts, seedMatches, seedPlayers, seedTournaments } from './mock';
import { Store, StoreContext } from './store';
import { MATCH_SIZE } from './types';

/** In-memory demo data, used when Supabase isn't configured. Resets on reload. */
export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState(() => Object.fromEntries(seedPlayers.map((p) => [p.id, p])));
  const [matches, setMatches] = useState(seedMatches);
  const [tournaments, setTournaments] = useState(seedTournaments);
  const [joinedTournaments, setJoined] = useState<string[]>([]);

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
        const court = seedCourts.find((c) => c.id === m.courtId)?.name ?? '';
        setMatches((ms) => [...ms, { ...m, id, court, hostId: ME_ID, playerIds: [ME_ID], distanceKm: 0 }]);
        return id;
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
