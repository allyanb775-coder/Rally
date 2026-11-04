import { Court, Match, Player, Tournament } from './types';

/** Evening slot `day` days from now at `hour`:`min`; rolls to the next day if already past. */
const slot = (day: number, hour: number, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + day);
  d.setHours(hour, min, 0, 0);
  if (d.getTime() < Date.now() + 36e5) d.setDate(d.getDate() + 1);
  return d.toISOString();
};

export const ME_ID = 'me';

export const seedCourts: Court[] = [
  { id: 'c1', name: 'ألتميت بادل', city: 'عنيزة' },
  { id: 'c2', name: 'بادل إن', city: 'بريدة' },
  { id: 'c3', name: 'بادل لاند', city: 'بريدة' },
  { id: 'c4', name: 'بادل زون', city: 'عنيزة' },
];

export const seedPlayers: Player[] = [
  { id: ME_ID, name: 'أنت', level: 2.5, matchesPlayed: 0, wins: 0, city: 'عنيزة' },
  { id: 'p1', name: 'فهد', level: 2.9, matchesPlayed: 42, wins: 25, city: 'عنيزة' },
  { id: 'p2', name: 'عبدالله', level: 2.4, matchesPlayed: 18, wins: 9, city: 'عنيزة' },
  { id: 'p3', name: 'سلطان', level: 4.2, matchesPlayed: 77, wins: 51, city: 'عنيزة' },
  { id: 'p4', name: 'نواف', level: 1.2, matchesPlayed: 5, wins: 1, city: 'عنيزة' },
  { id: 'p5', name: 'تركي', level: 2.8, matchesPlayed: 30, wins: 16, city: 'عنيزة' },
  { id: 'p6', name: 'خالد', level: 4.5, matchesPlayed: 120, wins: 88, city: 'عنيزة' },
];

/** Hours ago, for matches that already happened. */
const ago = (h: number) => {
  const d = new Date(Date.now() - h * 36e5);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
};

export const seedMatches: Match[] = [
  { id: 'm0', hostId: 'p1', courtId: 'c1', court: 'ألتميت بادل', city: 'عنيزة', startsAt: ago(2), kind: 'competitive', minLevel: 2.4, maxLevel: 3.4, playerIds: ['p1', ME_ID, 'p2', 'p5'], distanceKm: 0 },
  { id: 'm00', hostId: ME_ID, courtId: 'c4', court: 'بادل زون', city: 'عنيزة', startsAt: ago(26), kind: 'competitive', minLevel: 2, maxLevel: 3, playerIds: [ME_ID, 'p5', 'p2', 'p1'], distanceKm: 0, result: { winningTeam: 2, score: '6-4 7-5', status: 'pending', reportedBy: 'p5' } },
  { id: 'm1', hostId: 'p1', courtId: 'c1', court: 'ألتميت بادل', city: 'عنيزة', startsAt: slot(0, 20), kind: 'competitive', minLevel: 2.4, maxLevel: 3.4, playerIds: ['p1', 'p2', 'p5'], distanceKm: 0 },
  { id: 'm2', hostId: 'p4', courtId: 'c2', court: 'بادل إن', city: 'بريدة', startsAt: slot(0, 22, 30), kind: 'friendly', minLevel: 0.7, maxLevel: 1.7, playerIds: ['p4'], distanceKm: 0 },
  { id: 'm3', hostId: 'p3', courtId: 'c3', court: 'بادل لاند', city: 'بريدة', startsAt: slot(1, 21), kind: 'competitive', minLevel: 3.7, maxLevel: 4.7, playerIds: ['p3', 'p6'], distanceKm: 0 },
  { id: 'm4', hostId: 'p5', courtId: 'c4', court: 'بادل زون', city: 'عنيزة', startsAt: slot(1, 23), kind: 'friendly', minLevel: 2.3, maxLevel: 3.3, playerIds: ['p5', 'p2'], distanceKm: 0 },
  { id: 'm5', hostId: 'p2', courtId: 'c1', court: 'ألتميت بادل', city: 'عنيزة', startsAt: slot(2, 20, 30), kind: 'friendly', minLevel: 1.9, maxLevel: 2.9, playerIds: ['p2', 'p5', 'p1'], distanceKm: 0 },
];

export const seedTournaments: Tournament[] = [
  { id: 't1', name: 'بطولة القصيم الشهرية', format: 'knockout16', startsAt: slot(9, 19), venue: 'بادل لاند، بريدة', minLevel: 2, maxLevel: 5, capacity: 16, registered: 11, fee: 150 },
  { id: 't2', name: 'ليلة أمريكانو', format: 'americano', startsAt: slot(3, 21), venue: 'ألتميت بادل، عنيزة', minLevel: 0, maxLevel: 3, capacity: 12, registered: 8, fee: 60 },
];
