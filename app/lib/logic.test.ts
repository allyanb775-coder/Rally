/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBestMatch } from './findMatch.ts';
import { levelFromAnswers, levelQuestions, updatedLevel } from './level.ts';
import type { Match } from './types.ts';

const now = new Date('2026-11-03T12:00:00Z');
const at = (h: number) => new Date(now.getTime() + h * 36e5).toISOString();
const base: Match = { id: 'x', hostId: 'h', courtId: 'c', court: 'c', city: 'x', startsAt: at(2), kind: 'friendly', minLevel: 2, maxLevel: 3, playerIds: ['a'], distanceKm: 1 };

test('questionnaire maps to 0..5.5', () => {
  assert.equal(levelFromAnswers({}), 0);
  const max = Object.fromEntries(levelQuestions.map((q) => [q.id, q.options.length - 1]));
  assert.equal(levelFromAnswers(max), 5.5);
});

test('winning against stronger team raises level more than against weaker', () => {
  const p = { level: 3, matchesPlayed: 20 };
  const vsStrong = updatedLevel(p, 3, 4, true) - 3;
  const vsWeak = updatedLevel(p, 3, 2, true) - 3;
  assert.ok(vsStrong > vsWeak && vsWeak > 0);
  assert.ok(updatedLevel(p, 3, 3, false) < 3);
  assert.equal(updatedLevel({ level: 7, matchesPlayed: 0 }, 7, 0, true), 7);
});

test('findBestMatch skips full, past, out-of-level and joined matches', () => {
  const me = { id: 'me', level: 2.5 };
  const ms: Match[] = [
    { ...base, id: 'full', playerIds: ['a', 'b', 'c', 'd'] },
    { ...base, id: 'past', startsAt: at(-1) },
    { ...base, id: 'lvl', minLevel: 4, maxLevel: 5 },
    { ...base, id: 'in', playerIds: ['me'] },
  ];
  assert.equal(findBestMatch(ms, me, now), null);
  assert.equal(findBestMatch([...ms, { ...base, id: 'ok' }], me, now)?.id, 'ok');
});

test('findBestMatch prefers nearly-full matches', () => {
  const me = { id: 'me', level: 2.5 };
  const ms: Match[] = [{ ...base, id: 'one' }, { ...base, id: 'three', playerIds: ['a', 'b', 'c'] }];
  assert.equal(findBestMatch(ms, me, now)?.id, 'three');
});

import { normalizeSaudiPhone } from './phone.ts';
test('normalizeSaudiPhone', () => {
  assert.equal(normalizeSaudiPhone('0551234567'), '+966551234567');
  assert.equal(normalizeSaudiPhone('+966 55 123 4567'), '+966551234567');
  assert.equal(normalizeSaudiPhone('00966551234567'), '+966551234567');
  assert.equal(normalizeSaudiPhone('٠٥٥١٢٣٤٥٦٧'), '+966551234567');
  assert.equal(normalizeSaudiPhone('0112345678'), null);
  assert.equal(normalizeSaudiPhone('055123'), null);
});

import { rankMatches } from './findMatch.ts';
test('rankMatches orders joinable matches best-first', () => {
  const me = { id: 'me', level: 2.5 };
  const ms: Match[] = [
    { ...base, id: 'later', startsAt: at(40) },
    { ...base, id: 'soon', startsAt: at(1), playerIds: ['a', 'b', 'c'] },
    { ...base, id: 'full', playerIds: ['a', 'b', 'c', 'd'] },
  ];
  assert.deepEqual(rankMatches(ms, me, now).map((m) => m.id), ['soon', 'later']);
});

import { matchRange } from './level.ts';
test('matches only accept players at the host level ± 0.5', () => {
  assert.deepEqual(matchRange(2.5), { minLevel: 2, maxLevel: 3 });
  assert.deepEqual(matchRange(0.2), { minLevel: 0, maxLevel: 0.7 });
  assert.deepEqual(matchRange(6.8), { minLevel: 6.3, maxLevel: 7 });
});

import { levelFits } from './level.ts';
test('a small level gap (up to 0.25 outside the range) is accepted', () => {
  const r = { minLevel: 2, maxLevel: 3 };
  assert.ok(levelFits(2.5, r));
  assert.ok(levelFits(3.25, r));
  assert.ok(levelFits(1.75, r));
  assert.ok(!levelFits(3.3, r));
  assert.ok(!levelFits(1.7, r));
});

import { formatScore, levelChanges, needsResult, teamOf, teams } from './result.ts';
test('teams follow join order: 1st+3rd vs 2nd+4th', () => {
  const m = { playerIds: ['a', 'b', 'c', 'd'] };
  assert.deepEqual(teams(m), { 1: ['a', 'c'], 2: ['b', 'd'] });
  assert.equal(teamOf(m, 'd'), 2);
  assert.equal(teamOf(m, 'x'), null);
});
test('levelChanges: winners go up, losers down, upset moves more', () => {
  const m = { playerIds: ['a', 'b', 'c', 'd'] };
  const ps = { a: { level: 2, matchesPlayed: 40 }, b: { level: 3, matchesPlayed: 40 }, c: { level: 2, matchesPlayed: 40 }, d: { level: 3, matchesPlayed: 40 } };
  const upset = levelChanges(m, ps, 1); // weaker team 1 wins
  const expected = levelChanges(m, ps, 2);
  assert.ok(upset.a.after > 2 && upset.b.after < 3);
  assert.ok(upset.a.after - 2 > expected.b.after - 3);
});
test('needsResult only for started, full, competitive matches without a confirmed result', () => {
  const m: Match = { ...base, kind: 'competitive', playerIds: ['a', 'b', 'c', 'd'], startsAt: at(-2) };
  assert.ok(needsResult(m, now));
  assert.ok(!needsResult({ ...m, kind: 'friendly' }, now));
  assert.ok(!needsResult({ ...m, startsAt: at(2) }, now));
  assert.ok(!needsResult({ ...m, result: { winningTeam: 1, score: '', status: 'confirmed', reportedBy: 'a' } }, now));
});
test('formatScore', () => {
  assert.equal(formatScore([['6', '4'], ['3', '6'], ['', '']]), '6-4 3-6');
});
