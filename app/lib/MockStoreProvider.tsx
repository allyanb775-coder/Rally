import { ReactNode, useMemo, useState } from 'react';
import { ME_ID, seedCommunities, seedCourts, seedMatches, seedPlayers, seedTournaments } from './mock';
import { Store, StoreContext } from './store';
import { levelChanges, teamOf } from './result';
import { Community, Highlight, Match, MATCH_SIZE, Team, TournamentEntry } from './types';

/** In-memory demo data, used when Supabase isn't configured. Resets on reload. */
export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState(() => Object.fromEntries(seedPlayers.map((p) => [p.id, p])));
  const [matches, setMatches] = useState(seedMatches);
  const [tournaments, setTournaments] = useState(seedTournaments);
  const [myEntries, setEntries] = useState<Record<string, TournamentEntry>>({});
  const joinedTournaments = Object.keys(myEntries);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [communities, setCommunities] = useState<Community[]>(seedCommunities);

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
      myEntries,
      refresh: async () => {},
      setMyLevel: async (level) => setPlayers((ps) => ({ ...ps, [ME_ID]: { ...ps[ME_ID], level } })),
      joinMatch: async (id, receipt) => {
        const m = matches.find((x) => x.id === id);
        if (!m || m.playerIds.length >= MATCH_SIZE || m.playerIds.includes(ME_ID)) return false;
        const paid = !!m.fee && m.hostId !== ME_ID;
        if (paid && !receipt) return false;
        setMatches((ms) =>
          ms.map((x) =>
            x.id === id
              ? { ...x, playerIds: [...x.playerIds, ME_ID], payments: paid ? { ...x.payments, [ME_ID]: { status: 'pending', receipt: receipt!.uri } } : x.payments }
              : x,
          ),
        );
        return true;
      },
      leaveMatch: async (id) =>
        setMatches((ms) =>
          ms.map((m) => {
            if (m.id !== id) return m;
            const { [ME_ID]: _gone, ...payments } = m.payments ?? {};
            return { ...m, playerIds: m.playerIds.filter((p) => p !== ME_ID), payments };
          }),
        ),
      confirmPayment: async (matchId, playerId) => {
        const m = matches.find((x) => x.id === matchId);
        if (!m || m.hostId !== ME_ID || !m.payments?.[playerId]) return false;
        setMatches((ms) => ms.map((x) => (x.id === matchId ? { ...x, payments: { ...x.payments, [playerId]: { ...x.payments![playerId], status: 'confirmed' } } } : x)));
        return true;
      },
      receiptUrl: async (r) => r,
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
      highlights,
      communities,
      createCommunity: async (c) => {
        const id = `cm${Date.now()}`;
        setCommunities((cs) => [
          { id, name: c.name, kind: c.kind, city: c.city, description: c.description, logo: c.logoUri, ownerId: ME_ID, memberIds: [ME_ID], whatsapp: c.whatsapp, iban: c.iban, ibanName: c.ibanName },
          ...cs,
        ]);
        return id;
      },
      joinCommunity: async (id) =>
        setCommunities((cs) => cs.map((c) => (c.id === id && !c.memberIds.includes(ME_ID) ? { ...c, memberIds: [...c.memberIds, ME_ID] } : c))),
      leaveCommunity: async (id) =>
        setCommunities((cs) => cs.map((c) => (c.id === id && c.ownerId !== ME_ID ? { ...c, memberIds: c.memberIds.filter((m) => m !== ME_ID) } : c))),
      addHighlight: async (clip, caption) => {
        setHighlights((hs) => [{ id: `h${Date.now()}`, playerId: ME_ID, url: clip.uri, caption, createdAt: new Date().toISOString() }, ...hs]);
        return true;
      },
      deleteHighlight: async (id) => {
        setHighlights((hs) => hs.filter((h) => h.id !== id));
        return true;
      },
      joinTournament: async (id, receipt) => {
        if (myEntries[id]) return false;
        setEntries((e) => ({ ...e, [id]: { status: 'pending', receipt: receipt?.uri } }));
        setTournaments((ts) => ts.map((t) => (t.id === id && t.registered < t.capacity ? { ...t, registered: t.registered + 1 } : t)));
        return true;
      },
    }),
    [players, matches, tournaments, myEntries, highlights, communities],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
