export type Player = {
  id: string;
  name: string;
  level: number; // 0.0 – 7.0
  matchesPlayed: number;
  wins: number;
  city: string;
};

export type Court = { id: string; name: string };

export type MatchKind = 'friendly' | 'competitive';

export type Match = {
  id: string;
  hostId: string;
  courtId: string;
  court: string; // court name, denormalized for display
  startsAt: string; // ISO
  kind: MatchKind;
  minLevel: number;
  maxLevel: number;
  playerIds: string[]; // up to 4
  distanceKm: number;
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
