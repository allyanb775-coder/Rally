import { Community, Court, Match, Player, Tournament } from './types';
import { tr } from './i18n';

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
  { id: 'c1', get name() { return tr('Padel Rush · حطين', 'Padel Rush · Hittin'); }, city: 'الرياض' },
  { id: 'c2', get name() { return tr('Hala Padel · العارض', 'Hala Padel · Al Arid'); }, city: 'الرياض' },
  { id: 'c3', get name() { return tr('Valley Padel · وادي حنيفة', 'Valley Padel · Wadi Hanifa'); }, city: 'الرياض' },
  { id: 'c4', get name() { return tr('Quattro Club · العليا', 'Quattro Club · Olaya'); }, city: 'الرياض' },
];

export const seedPlayers: Player[] = [
  { id: ME_ID, get name() { return tr('أنت', 'You'); }, level: 2.5, matchesPlayed: 0, wins: 0, city: 'الرياض' },
  { id: 'p1', name: 'Fahad', level: 2.9, matchesPlayed: 42, wins: 25, city: 'الرياض' },
  { id: 'p2', name: 'Abdullah', level: 2.4, matchesPlayed: 18, wins: 9, city: 'الرياض' },
  { id: 'p3', name: 'Sultan', level: 4.2, matchesPlayed: 77, wins: 51, city: 'الرياض' },
  { id: 'p4', name: 'Nawaf', level: 1.2, matchesPlayed: 5, wins: 1, city: 'الرياض' },
  { id: 'p5', name: 'Turki', level: 2.8, matchesPlayed: 30, wins: 16, city: 'الرياض' },
  { id: 'p6', name: 'Khalid', level: 4.5, matchesPlayed: 120, wins: 88, city: 'الرياض' },
];

/** Hours ago, for matches that already happened. */
const ago = (h: number) => {
  const d = new Date(Date.now() - h * 36e5);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
};

export const seedMatches: Match[] = [
  { id: 'm0', hostId: 'p1', courtId: 'c1', get court() { return tr('Padel Rush · حطين', 'Padel Rush · Hittin'); }, city: 'الرياض', startsAt: ago(2), kind: 'competitive', minLevel: 2.4, maxLevel: 3.4, playerIds: ['p1', ME_ID, 'p2', 'p5'], distanceKm: 0 },
  { id: 'm00', hostId: ME_ID, courtId: 'c4', get court() { return tr('Quattro Club · العليا', 'Quattro Club · Olaya'); }, city: 'الرياض', startsAt: ago(26), kind: 'competitive', minLevel: 2, maxLevel: 3, playerIds: [ME_ID, 'p5', 'p2', 'p1'], distanceKm: 0, result: { winningTeam: 2, score: '6-4 7-5', status: 'pending', reportedBy: 'p5' } },
  { id: 'm1', communityId: 'tcc', hostId: 'p1', courtId: 'c1', get court() { return tr('Padel Rush · حطين', 'Padel Rush · Hittin'); }, city: 'الرياض', startsAt: slot(0, 20), kind: 'competitive', minLevel: 2.4, maxLevel: 3.4, playerIds: ['p1', 'p2', 'p5'], distanceKm: 0, fee: 50, iban: 'SA0000000000000000000000', ibanName: 'The Court Club', payments: { p2: { status: 'confirmed' }, p5: { status: 'confirmed' } } },
  { id: 'm2', hostId: 'p4', courtId: 'c2', get court() { return tr('Hala Padel · العارض', 'Hala Padel · Al Arid'); }, city: 'الرياض', startsAt: slot(0, 22, 30), kind: 'friendly', minLevel: 0.7, maxLevel: 1.7, playerIds: ['p4'], distanceKm: 0 },
  { id: 'm3', hostId: 'p3', courtId: 'c3', get court() { return tr('Valley Padel · وادي حنيفة', 'Valley Padel · Wadi Hanifa'); }, city: 'الرياض', startsAt: slot(1, 21), kind: 'competitive', minLevel: 3.7, maxLevel: 4.7, playerIds: ['p3', 'p6'], distanceKm: 0 },
  { id: 'm4', hostId: 'p5', courtId: 'c4', get court() { return tr('Quattro Club · العليا', 'Quattro Club · Olaya'); }, city: 'الرياض', startsAt: slot(1, 23), kind: 'friendly', minLevel: 2.3, maxLevel: 3.3, playerIds: ['p5', 'p2'], distanceKm: 0 },
  { id: 'm5', hostId: 'p2', courtId: 'c1', get court() { return tr('Padel Rush · حطين', 'Padel Rush · Hittin'); }, city: 'الرياض', startsAt: slot(2, 20, 30), kind: 'friendly', minLevel: 1.9, maxLevel: 2.9, playerIds: ['p2', 'p5', 'p1'], distanceKm: 0 },
  { id: 'm6', communityId: 'tcc', hostId: ME_ID, courtId: 'c4', get court() { return tr('Quattro Club · العليا', 'Quattro Club · Olaya'); }, city: 'الرياض', startsAt: slot(2, 22), kind: 'competitive', minLevel: 2, maxLevel: 3, playerIds: [ME_ID, 'p5', 'p2'], distanceKm: 0, fee: 50, iban: 'SA0000000000000000000000', ibanName: 'The Court Club', payments: { p5: { status: 'pending' }, p2: { status: 'confirmed' } } },
];

export const seedTournaments: Tournament[] = [
  { id: 't1', get name() { return tr('بطولة The Court Club الشهرية', 'The Court Club Monthly'); }, format: 'knockout16', startsAt: slot(9, 19), get venue() { return tr('Padel Rush، حطين', 'Padel Rush, Hittin'); }, minLevel: 2, maxLevel: 5, capacity: 16, registered: 11, fee: 150, whatsapp: '0500000000', iban: 'SA0000000000000000000000', ibanName: 'The Court Club' },
  { id: 't2', get name() { return tr('ليلة أمريكانو', 'Americano Night'); }, format: 'americano', startsAt: slot(3, 21), get venue() { return tr('Quattro Club، العليا', 'Quattro Club, Olaya'); }, minLevel: 0, maxLevel: 3, capacity: 12, registered: 8, fee: 60, whatsapp: '0500000000', iban: 'SA0000000000000000000000', ibanName: 'The Court Club' },
];

export const seedCommunities: Community[] = [
  {
    id: 'tcc',
    name: 'The Court Club',
    kind: 'community',
    city: 'الرياض',
    get description() { return tr('مجتمع بادل في الرياض: مباريات أسبوعية بمستويات متقاربة، ليالي أمريكانو، وبطولة شهرية.', 'A padel community in Riyadh: weekly level-matched games, Americano nights and a monthly tournament.'); },
    logo: require('../assets/images/the-court-club.png'),
    ownerId: ME_ID,
    memberIds: [ME_ID, 'p1', 'p2', 'p3', 'p5'],
    whatsapp: '0500000000',
    iban: 'SA0000000000000000000000',
    ibanName: 'The Court Club',
  },
];
