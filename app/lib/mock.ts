import { Court, Match, Player, Tournament } from './types';

const inHours = (h: number) => new Date(Date.now() + h * 36e5).toISOString();

export const ME_ID = 'me';

export const seedCourts: Court[] = [
  { id: 'c1', name: 'ملاعب الريم' },
  { id: 'c2', name: 'نادي الصفوة' },
  { id: 'c3', name: 'بادل زون' },
];
const courtId = (name: string) => seedCourts.find((c) => c.name === name)!.id;

export const seedPlayers: Player[] = [
  { id: ME_ID, name: 'أنت', level: 2.5, matchesPlayed: 0, wins: 0, city: 'عنيزة' },
  { id: 'p1', name: 'فهد', level: 3.1, matchesPlayed: 42, wins: 25, city: 'عنيزة' },
  { id: 'p2', name: 'عبدالله', level: 2.4, matchesPlayed: 18, wins: 9, city: 'عنيزة' },
  { id: 'p3', name: 'سلطان', level: 4.2, matchesPlayed: 77, wins: 51, city: 'عنيزة' },
  { id: 'p4', name: 'نواف', level: 1.2, matchesPlayed: 5, wins: 1, city: 'عنيزة' },
  { id: 'p5', name: 'تركي', level: 2.8, matchesPlayed: 30, wins: 16, city: 'عنيزة' },
  { id: 'p6', name: 'خالد', level: 5.0, matchesPlayed: 120, wins: 88, city: 'عنيزة' },
];

export const seedMatches: Match[] = [
  { id: 'm1', hostId: 'p1', courtId: courtId('ملاعب الريم'), court: 'ملاعب الريم', startsAt: inHours(3), kind: 'competitive', minLevel: 2, maxLevel: 3.5, playerIds: ['p1', 'p2', 'p5'], distanceKm: 2.1 },
  { id: 'm2', hostId: 'p4', courtId: courtId('نادي الصفوة'), court: 'نادي الصفوة', startsAt: inHours(5), kind: 'friendly', minLevel: 0, maxLevel: 2.5, playerIds: ['p4'], distanceKm: 4.5 },
  { id: 'm3', hostId: 'p3', courtId: courtId('بادل زون'), court: 'بادل زون', startsAt: inHours(26), kind: 'competitive', minLevel: 3.5, maxLevel: 5, playerIds: ['p3', 'p6'], distanceKm: 6 },
  { id: 'm4', hostId: 'p5', courtId: courtId('ملاعب الريم'), court: 'ملاعب الريم', startsAt: inHours(28), kind: 'friendly', minLevel: 1.5, maxLevel: 4, playerIds: ['p5', 'p2'], distanceKm: 2.1 },
];

export const seedTournaments: Tournament[] = [
  { id: 't1', name: 'بطولة عنيزة الشهرية', format: 'knockout16', startsAt: inHours(24 * 9), venue: 'بادل زون', minLevel: 2, maxLevel: 5, capacity: 16, registered: 11, fee: 150 },
  { id: 't2', name: 'ليلة أمريكانو', format: 'americano', startsAt: inHours(24 * 3), venue: 'نادي الصفوة', minLevel: 0, maxLevel: 3, capacity: 12, registered: 8, fee: 60 },
];
