import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ProfileSetup } from '@/components/auth/ProfileSetup';
import { SignIn } from '@/components/auth/SignIn';
import { colors } from '@/constants/theme';
import { friendlyError, notify } from './notify';
import { Store, StoreContext } from './store';
import { Court, Match, Player, Tournament } from './types';

type Data = {
  players: Record<string, Player>;
  courts: Court[];
  matches: Match[];
  tournaments: Tournament[];
  joinedTournaments: string[];
};

const num = (v: unknown) => Number(v ?? 0);

async function fetchAll(sb: SupabaseClient, uid: string): Promise<Data> {
  const since = new Date(Date.now() - 24 * 36e5).toISOString();
  const [profiles, courts, matches, tournaments] = await Promise.all([
    sb.from('profiles').select('id,name,city,level,matches_played,wins'),
    sb.from('courts').select('id,name').order('name'),
    sb
      .from('matches')
      .select('id,host_id,court_id,starts_at,kind,min_level,max_level,courts(name),match_players(player_id,joined_at)')
      .gte('starts_at', since)
      .order('starts_at'),
    sb
      .from('tournaments')
      .select('id,name,format,starts_at,min_level,max_level,capacity,fee_sar,courts(name),tournament_entries(player_id)')
      .gte('starts_at', since)
      .order('starts_at'),
  ]);
  for (const r of [profiles, courts, matches, tournaments]) if (r.error) throw r.error;

  const players = Object.fromEntries(
    (profiles.data ?? []).map((p: any) => [
      p.id,
      { id: p.id, name: p.name, city: p.city, level: num(p.level), matchesPlayed: p.matches_played, wins: p.wins } as Player,
    ]),
  );

  return {
    players,
    courts: courts.data ?? [],
    matches: (matches.data ?? []).map((m: any) => ({
      id: m.id,
      hostId: m.host_id,
      courtId: m.court_id,
      court: m.courts?.name ?? '',
      startsAt: m.starts_at,
      kind: m.kind,
      minLevel: num(m.min_level),
      maxLevel: num(m.max_level),
      playerIds: [...m.match_players]
        .sort((a: any, b: any) => a.joined_at.localeCompare(b.joined_at))
        .map((p: any) => p.player_id),
      distanceKm: 0, // TODO: compute from court coordinates once we have player location
    })),
    tournaments: (tournaments.data ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      format: t.format,
      startsAt: t.starts_at,
      venue: t.courts?.name ?? '',
      minLevel: num(t.min_level),
      maxLevel: num(t.max_level),
      capacity: t.capacity,
      registered: t.tournament_entries.length,
      fee: t.fee_sar,
    })),
    joinedTournaments: (tournaments.data ?? [])
      .filter((t: any) => t.tournament_entries.some((e: any) => e.player_id === uid))
      .map((t: any) => t.id),
  };
}

export function SupabaseStoreProvider({ client: sb, children }: { client: SupabaseClient; children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState(false);
  const uid = session?.user.id;

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  const refresh = useCallback(async () => {
    if (!uid) return;
    try {
      setData(await fetchAll(sb, uid));
      setLoadError(false);
    } catch (e) {
      console.warn(e);
      setLoadError(true);
    }
  }, [sb, uid]);

  useEffect(() => {
    setData(null);
    refresh();
  }, [refresh]);

  // Keep open matches fresh while the app is open.
  useEffect(() => {
    if (!uid) return;
    const ch = sb
      .channel('rally')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_players' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => refresh())
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [sb, uid, refresh]);

  const value = useMemo<Store | null>(() => {
    if (!uid || !data || !data.players[uid]) return null;
    const run = async (fn: () => PromiseLike<{ error: unknown }>) => {
      const { error } = await fn();
      if (error) notify(friendlyError(error));
      await refresh();
      return !error;
    };
    return {
      me: data.players[uid],
      ...data,
      refresh,
      signOut: async () => {
        await sb.auth.signOut();
      },
      setMyLevel: async (level) => {
        await run(() => sb.from('profiles').update({ level }).eq('id', uid));
      },
      joinMatch: async (id) => {
        await run(() => sb.from('match_players').insert({ match_id: id, player_id: uid }));
      },
      leaveMatch: async (id) => {
        await run(() => sb.from('match_players').delete().match({ match_id: id, player_id: uid }));
      },
      createMatch: async (m) => {
        const { data: row, error } = await sb
          .from('matches')
          .insert({
            host_id: uid,
            court_id: m.courtId,
            starts_at: m.startsAt,
            kind: m.kind,
            min_level: m.minLevel,
            max_level: m.maxLevel,
          })
          .select('id')
          .single();
        if (error || !row) {
          notify(friendlyError(error));
          return null;
        }
        await run(() => sb.from('match_players').insert({ match_id: row.id, player_id: uid }));
        return row.id as string;
      },
      joinTournament: async (id) => {
        await run(() => sb.from('tournament_entries').insert({ tournament_id: id, player_id: uid }));
      },
    };
  }, [sb, uid, data, refresh]);

  if (session === undefined) return <Loading />;
  if (!session) return <SignIn client={sb} />;
  if (!data) return loadError ? <SignIn client={sb} error="تعذّر تحميل البيانات. تأكد من الاتصال." onRetry={refresh} /> : <Loading />;
  if (!data.players[session.user.id]) return <ProfileSetup client={sb} session={session} onDone={refresh} />;
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function Loading() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
