import { createContext, useContext } from 'react';
import { Court, Match, Player, Tournament } from './types';

export type NewMatch = Pick<Match, 'courtId' | 'startsAt' | 'kind' | 'minLevel' | 'maxLevel'>;

export type Store = {
  me: Player;
  players: Record<string, Player>;
  courts: Court[];
  matches: Match[];
  tournaments: Tournament[];
  joinedTournaments: string[];
  setMyLevel: (level: number) => Promise<void>;
  joinMatch: (id: string) => Promise<void>;
  leaveMatch: (id: string) => Promise<void>;
  createMatch: (m: NewMatch) => Promise<string | null>;
  joinTournament: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut?: () => Promise<void>;
};

export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
