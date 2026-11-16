import { createContext, useContext } from 'react';
import { Community, Court, Highlight, Match, NewCommunity, PickedClip, Player, Receipt, Team, Tournament, TournamentEntry } from './types';

export type NewMatch = Pick<Match, 'courtId' | 'startsAt' | 'kind' | 'minLevel' | 'maxLevel' | 'communityId' | 'fee' | 'iban' | 'ibanName'>;

export type Store = {
  me: Player;
  players: Record<string, Player>;
  courts: Court[];
  matches: Match[];
  tournaments: Tournament[];
  joinedTournaments: string[];
  myEntries: Record<string, TournamentEntry>; // by tournament id
  highlights: Highlight[]; // newest first
  communities: Community[];
  createCommunity: (c: NewCommunity) => Promise<string | null>;
  joinCommunity: (id: string) => Promise<void>;
  leaveCommunity: (id: string) => Promise<void>;
  /** Owner sets or clears the club's public link. */
  setCommunityLink: (id: string, link: string | null) => Promise<boolean>;
  addHighlight: (clip: PickedClip, caption: string) => Promise<boolean>;
  deleteHighlight: (id: string) => Promise<boolean>;
  setMyLevel: (level: number) => Promise<void>;
  /** Join a match. A paid match needs the transfer receipt; the spot stays pending until the host confirms. */
  joinMatch: (id: string, receipt?: Receipt) => Promise<boolean>;
  /** Host of a paid match accepts a player's transfer. */
  confirmPayment: (matchId: string, playerId: string) => Promise<boolean>;
  /** A viewable link to a receipt (receipts are private). */
  receiptUrl: (receipt: string) => Promise<string | null>;
  leaveMatch: (id: string) => Promise<void>;
  createMatch: (m: NewMatch) => Promise<string | null>;
  /** Register for a tournament with the transfer receipt (an image picked from the phone). */
  joinTournament: (id: string, receipt?: Receipt) => Promise<boolean>;
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
