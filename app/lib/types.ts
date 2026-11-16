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
  communityId?: string; // the community the match was opened in, if any
  /** Paid community match: each player except the host transfers this fee (SAR) and uploads the receipt. */
  fee?: number;
  iban?: string;
  ibanName?: string;
  /** Payment state per player who joined a paid match; the spot is held while pending. */
  payments?: Record<string, Payment>;
};

/** A transfer receipt the organizer still has to check (pending) or has accepted (confirmed). */
export type Payment = { status: 'pending' | 'confirmed'; receipt?: string };
export type Receipt = { uri: string; mime?: string };

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
  fee: number; // SAR, paid to the organizer over WhatsApp
  whatsapp?: string; // organizer's mobile
  iban?: string; // organizer's bank account for the fee
  ibanName?: string; // account holder, so players can check before transferring
};

export const MATCH_SIZE = 4;

/** Your entry in a tournament: pending until the organizer confirms your transfer. */
export type TournamentEntry = Payment;

export type CommunityKind = 'community' | 'court' | 'academy';

/** A padel community, court or academy anyone can add; players join to follow it. */
export type Community = {
  id: string;
  name: string;
  kind: CommunityKind;
  city: string;
  description: string;
  logo?: string | number | object; // image URL, or a bundled image
  ownerId: string;
  memberIds: string[];
  whatsapp?: string; // contact mobile, optional
  iban?: string; // where paid club matches are transferred, set by the owner
  ibanName?: string;
};

export type NewCommunity = Pick<Community, 'name' | 'kind' | 'city' | 'description' | 'whatsapp' | 'iban' | 'ibanName'> & { logoUri?: string; logoMime?: string };

/** A short gameplay clip a player posts on their profile. */
export type Highlight = {
  id: string;
  playerId: string;
  url: string;
  caption: string;
  createdAt: string;
};

/** A video picked from the phone, ready to upload. */
export type PickedClip = { uri: string; mimeType?: string; fileSize?: number; duration?: number | null };
