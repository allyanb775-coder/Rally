import { createContext, useContext } from 'react';
import { Court, Highlight, Match, PickedClip, Player, Team, Tournament } from './types';

export type NewMatch = Pick<Match, 'courtId' | 'startsAt' | 'kind' | 'minLevel' | 'maxLevel'>;

export type Store = {
  me: Player;
  players: Record<string, Player>;
  courts: Court[];
  matches: Match[];
  tournaments: Tournament[];
  joinedTournaments: string[];
  highlights: Highlight[]; // newest first
  addHighlight: (clip: PickedClip, caption: string) => Promise<boolean>;
  deleteHighlight: (id: string) => Promise<boolean>;
  setMyLevel: (level: number) => Promise<void>;
  joinMatch: (id: string) => Promise<void>;
  leaveMatch: (id: string) => Promise<void>;
  createMatch: (m: NewMatch) => Promise<string | null>;
  joinTournament: (id: string) => Promise<void>;
  /** Any of the four players reports who won; returns false if it was rejected. */
  reportResult: (matchId: string, winningTeam: Team, score: string) => Promise<boolean>;
  /** A player from the other team confirms (levels update) or disputes (result is cleared). */
  confirmResult: (matchId: string, accept: boolean) => Promise<boolean>;
  refresh: () => Promise<void>;
  signOut?: () => Promise<void>;
};

export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
