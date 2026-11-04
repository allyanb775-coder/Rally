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
