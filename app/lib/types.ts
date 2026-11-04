export type Player = {
  id: string;
  name: string;
  level: number; // 0.0 – 7.0
  matchesPlayed: number;
  wins: number;
  city: string;
};

export type Court = { id: string; name: string; city: string };

export type MatchKind = 'friendly' | 'competitive';

export type Team = 1 | 2;

/** A reported result. Levels change only once a player from the other team confirms it. */
export type MatchResult = {
  winningTeam: Team;
  score: string; // e.g. "6-4 3-6 6-2", may be empty
  status: 'pending' | 'confirmed';
  reportedBy: string;
};

export type Match = {
  id: string;
  hostId: string;
  courtId: string;
  court: string; // court name, denormalized for display
  city: string; // court's city
  startsAt: string; // ISO
  kind: MatchKind;
  minLevel: number;
  maxLevel: number;
  playerIds: string[]; // up to 4, in join order
  distanceKm: number;
  result?: MatchResult;
};

export type TournamentFormat = 'knockout16' | 'americano';

export type Tournament = {
  id: string;
  name: string;
  format: TournamentFormat;
  startsAt: string;
  venue: string;
  minLevel: number;
  maxLevel: number;
  capacity: number;
  registered: number;
  fee: number; // SAR
};

export const MATCH_SIZE = 4;
