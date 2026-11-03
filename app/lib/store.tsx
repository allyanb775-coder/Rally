import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { ME_ID, seedMatches, seedPlayers, seedTournaments } from './mock';
import { Match, MATCH_SIZE, Player, Tournament } from './types';

type Store = {
  me: Player;
  players: Record<string, Player>;
  matches: Match[];
  tournaments: Tournament[];
  joinedTournaments: string[];
  setMyLevel: (level: number) => void;
  joinMatch: (id: string) => void;
  leaveMatch: (id: string) => void;
  createMatch: (m: Omit<Match, 'id' | 'hostId' | 'playerIds' | 'distanceKm'>) => string;
  joinTournament: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);

/** Demo in-memory store. Swap the setters for Supabase calls once the backend is wired. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState(() => Object.fromEntries(seedPlayers.map((p) => [p.id, p])));
  const [matches, setMatches] = useState(seedMatches);
  const [tournaments, setTournaments] = useState(seedTournaments);
  const [joinedTournaments, setJoined] = useState<string[]>([]);

  const value = useMemo<Store>(
    () => ({
      me: players[ME_ID],
      players,
      matches,
      tournaments,
      joinedTournaments,
      setMyLevel: (level) => setPlayers((ps) => ({ ...ps, [ME_ID]: { ...ps[ME_ID], level } })),
      joinMatch: (id) =>
        setMatches((ms) =>
          ms.map((m) =>
            m.id === id && m.playerIds.length < MATCH_SIZE && !m.playerIds.includes(ME_ID)
              ? { ...m, playerIds: [...m.playerIds, ME_ID] }
              : m,
          ),
        ),
      leaveMatch: (id) =>
        setMatches((ms) =>
          ms.map((m) => (m.id === id ? { ...m, playerIds: m.playerIds.filter((p) => p !== ME_ID) } : m)),
        ),
      createMatch: (m) => {
        const id = `m${Date.now()}`;
        setMatches((ms) => [...ms, { ...m, id, hostId: ME_ID, playerIds: [ME_ID], distanceKm: 0 }]);
        return id;
      },
      joinTournament: (id) => {
        if (joinedTournaments.includes(id)) return;
        setJoined((j) => [...j, id]);
        setTournaments((ts) => ts.map((t) => (t.id === id && t.registered < t.capacity ? { ...t, registered: t.registered + 1 } : t)));
      },
    }),
    [players, matches, tournaments, joinedTournaments],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
