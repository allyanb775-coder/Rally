import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ProfileSetup } from '@/components/auth/ProfileSetup';
import { SignIn } from '@/components/auth/SignIn';
import { colors } from '@/constants/theme';
import { friendlyError, notify } from './notify';
import { Store, StoreContext } from './store';
import { clipExtension } from './clips';
import { Court, Highlight, Match, Player, Tournament } from './types';

type Data = {
  players: Record<string, Player>;
  courts: Court[];
  matches: Match[];
  tournaments: Tournament[];
  joinedTournaments: string[];
  highlights: Highlight[];
};

const num = (v: unknown) => Number(v ?? 0);

// match_results is one-to-one with matches; PostgREST may return an object or a one-item array.
function toResult(r: any): Match['result'] {
  const x = Array.isArray(r) ? r[0] : r;
  if (!x) return undefined;
  return { winningTeam: x.winning_team, score: x.score ?? '', status: x.status, reportedBy: x.reported_by };
}

async function fetchAll(sb: SupabaseClient, uid: string): Promise<Data> {
  const since = new Date(Date.now() - 3 * 24 * 36e5).toISOString(); // keep recent matches for results
  const [profiles, courts, matches, tournaments, clips] = await Promise.all([
    sb.from('profiles').select('id,name,city,level,matches_played,wins'),
    sb.from('courts').select('id,name,city').order('city').order('name'),
    sb
      .from('matches')
      .select('id,host_id,court_id,starts_at,kind,min_level,max_level,courts(name,city),match_players(player_id,joined_at),match_results(winning_team,score,status,reported_by)')
      .gte('starts_at', since)
      .order('starts_at'),
    sb
      .from('tournaments')
      .select('id,name,format,starts_at,min_level,max_level,capacity,fee_sar,courts(name,city),tournament_entries(player_id)')
      .gte('starts_at', since)
      .order('starts_at'),
    sb.from('highlights').select('id,player_id,path,caption,created_at').order('created_at', { ascending: false }).limit(300),
  ]);
  for (const r of [profiles, courts, matches, tournaments, clips]) if (r.error) throw r.error;

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
      city: m.courts?.city ?? '',
      startsAt: m.starts_at,
      kind: m.kind,
      minLevel: num(m.min_level),
      maxLevel: num(m.max_level),
      playerIds: [...m.match_players]
        .sort((a: any, b: any) => a.joined_at.localeCompare(b.joined_at))
        .map((p: any) => p.player_id),
      distanceKm: 0, // TODO: compute from court coordinates once we have player location
      result: toResult(m.match_results),
    })),
    tournaments: (tournaments.data ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      format: t.format,
      startsAt: t.starts_at,
      venue: [t.courts?.name, t.courts?.city].filter(Boolean).join('، '),
      minLevel: num(t.min_level),
      maxLevel: num(t.max_level),
      capacity: t.capacity,
      registered: t.tournament_entries.length,
      fee: t.fee_sar,
    })),
    highlights: (clips.data ?? []).map((h: any) => ({
      id: h.id,
      playerId: h.player_id,
      url: sb.storage.from('highlights').getPublicUrl(h.path).data.publicUrl,
      caption: h.caption,
      createdAt: h.created_at,
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results' }, () => refresh())
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
      reportResult: async (matchId, winningTeam, score) =>
        run(() => sb.rpc('report_result', { p_match: matchId, p_winning_team: winningTeam, p_score: score })),
      confirmResult: async (matchId, accept) => run(() => sb.rpc('confirm_result', { p_match: matchId, p_accept: accept })),
      addHighlight: async (clip, caption) => {
        try {
          const body = await (await fetch(clip.uri)).arrayBuffer();
          const path = `${uid}/${Date.now()}.${clipExtension(clip.mimeType)}`;
          const up = await sb.storage.from('highlights').upload(path, body, { contentType: clip.mimeType ?? 'video/mp4' });
          if (up.error) throw up.error;
          const ok = await run(() => sb.from('highlights').insert({ player_id: uid, path, caption }));
          if (!ok) await sb.storage.from('highlights').remove([path]);
          return ok;
        } catch (e) {
          console.warn(e);
          notify('ما قدرنا نرفع المقطع. تأكد من الاتصال وحاول مرة ثانية.');
          return false;
        }
      },
      deleteHighlight: async (id) => {
        const { data: row } = await sb.from('highlights').select('path').eq('id', id).single();
        const ok = await run(() => sb.from('highlights').delete().eq('id', id));
        if (ok && row?.path) await sb.storage.from('highlights').remove([row.path]);
        return ok;
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
