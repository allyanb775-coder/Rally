import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ProfileSetup } from '@/components/auth/ProfileSetup';
import { SignIn } from '@/components/auth/SignIn';
import { colors } from '@/constants/theme';
import { friendlyError, notify } from './notify';
import { Store, StoreContext } from './store';
import { clipExtension } from './clips';
import { Community, Court, Highlight, Match, Player, Receipt, Tournament, TournamentEntry } from './types';
import { tr } from './i18n';

type Data = {
  players: Record<string, Player>;
  courts: Court[];
  matches: Match[];
  tournaments: Tournament[];
  joinedTournaments: string[];
  myEntries: Record<string, TournamentEntry>;
  highlights: Highlight[];
  communities: Community[];
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
  const [profiles, courts, matches, tournaments, clips, comms] = await Promise.all([
    sb.from('profiles').select('id,name,city,level,matches_played,wins'),
    sb.from('courts').select('id,name,city').order('city').order('name'),
    sb
      .from('matches')
      .select('id,host_id,court_id,community_id,starts_at,kind,min_level,max_level,courts(name,city),fee_sar,iban,iban_name,match_players(player_id,joined_at,paid,receipt_path),match_results(winning_team,score,status,reported_by)')
      .gte('starts_at', since)
      .order('starts_at'),
    sb
      .from('tournaments')
      .select('id,name,format,starts_at,min_level,max_level,capacity,fee_sar,whatsapp,iban,iban_name,courts(name,city),tournament_entries(player_id,paid,receipt_path)')
      .gte('starts_at', since)
      .order('starts_at'),
    sb.from('highlights').select('id,player_id,path,caption,created_at').order('created_at', { ascending: false }).limit(300),
    sb.from('communities').select('id,name,kind,city,description,logo_path,whatsapp,iban,iban_name,owner_id,community_members(player_id)').order('created_at').limit(500),
  ]);
  for (const r of [profiles, courts, matches, tournaments, clips, comms]) if (r.error) throw r.error;

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
      communityId: m.community_id ?? undefined,
      fee: m.fee_sar || undefined,
      iban: m.iban ?? undefined,
      ibanName: m.iban_name ?? undefined,
      payments: m.fee_sar
        ? Object.fromEntries(
            m.match_players
              .filter((p: any) => p.player_id !== m.host_id)
              .map((p: any) => [p.player_id, { status: p.paid ? 'confirmed' : 'pending', receipt: p.receipt_path ?? undefined }]),
          )
        : undefined,
    })),
    tournaments: (tournaments.data ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      format: t.format,
      startsAt: t.starts_at,
      venue: [t.courts?.name, t.courts?.city].filter(Boolean).join(tr('، ', ', ')),
      minLevel: num(t.min_level),
      maxLevel: num(t.max_level),
      capacity: t.capacity,
      registered: t.tournament_entries.length,
      fee: t.fee_sar,
      whatsapp: t.whatsapp ?? undefined,
      iban: t.iban ?? undefined,
      ibanName: t.iban_name ?? undefined,
    })),
    highlights: (clips.data ?? []).map((h: any) => ({
      id: h.id,
      playerId: h.player_id,
      url: sb.storage.from('highlights').getPublicUrl(h.path).data.publicUrl,
      caption: h.caption,
      createdAt: h.created_at,
    })),
    communities: (comms.data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      kind: c.kind,
      city: c.city,
      description: c.description,
      logo: c.logo_path ? sb.storage.from('logos').getPublicUrl(c.logo_path).data.publicUrl : undefined,
      ownerId: c.owner_id,
      whatsapp: c.whatsapp ?? undefined,
      iban: c.iban ?? undefined,
      ibanName: c.iban_name ?? undefined,
      memberIds: c.community_members.map((m: any) => m.player_id),
    })),
    myEntries: Object.fromEntries(
      (tournaments.data ?? []).flatMap((t: any) =>
        t.tournament_entries
          .filter((e: any) => e.player_id === uid)
          .map((e: any) => [t.id, { status: e.paid ? 'confirmed' : 'pending', receipt: e.receipt_path ?? undefined } as TournamentEntry]),
      ),
    ),
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
    // Receipts go to a private bucket at <folder>/<your id>.<ext>: only you and the organizer can open them.
    const uploadReceipt = async (folder: string, receipt: Receipt): Promise<string | null> => {
      try {
        const body = await (await fetch(receipt.uri)).arrayBuffer();
        const ext = receipt.mime === 'image/png' ? 'png' : receipt.mime === 'application/pdf' ? 'pdf' : 'jpg';
        const path = `${folder}/${uid}.${ext}`;
        const up = await sb.storage.from('receipts').upload(path, body, { contentType: receipt.mime ?? 'image/jpeg', upsert: true });
        if (up.error) throw up.error;
        return path;
      } catch (e) {
        console.warn(e);
        notify(tr('ما قدرنا نرفع الإيصال. تأكد من الاتصال وحاول مرة ثانية.', "We couldn't upload the receipt. Check your connection and try again."));
        return null;
      }
    };
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
      joinMatch: async (id, receipt) => {
        let receipt_path: string | null = null;
        if (receipt) {
          receipt_path = await uploadReceipt(`m/${id}`, receipt);
          if (!receipt_path) return false;
        }
        return run(() => sb.from('match_players').insert({ match_id: id, player_id: uid, receipt_path }));
      },
      confirmPayment: async (matchId, playerId) =>
        run(() => sb.from('match_players').update({ paid: true }).match({ match_id: matchId, player_id: playerId })),
      receiptUrl: async (path) => {
        const { data: signed } = await sb.storage.from('receipts').createSignedUrl(path, 600);
        return signed?.signedUrl ?? null;
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
            community_id: m.communityId ?? null,
            fee_sar: m.fee ?? 0,
            iban: m.iban || null,
            iban_name: m.ibanName || null,
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
          notify(tr('ما قدرنا نرفع المقطع. تأكد من الاتصال وحاول مرة ثانية.', "We couldn't upload the clip. Check your connection and try again."));
          return false;
        }
      },
      deleteHighlight: async (id) => {
        const { data: row } = await sb.from('highlights').select('path').eq('id', id).single();
        const ok = await run(() => sb.from('highlights').delete().eq('id', id));
        if (ok && row?.path) await sb.storage.from('highlights').remove([row.path]);
        return ok;
      },
      createCommunity: async (c) => {
        let logo_path: string | null = null;
        if (c.logoUri) {
          try {
            const body = await (await fetch(c.logoUri)).arrayBuffer();
            const path = `${uid}/${Date.now()}.${c.logoMime === 'image/png' ? 'png' : 'jpg'}`;
            const up = await sb.storage.from('logos').upload(path, body, { contentType: c.logoMime ?? 'image/jpeg' });
            if (!up.error) logo_path = path;
          } catch (e) {
            console.warn(e);
          }
        }
        const { data: row, error } = await sb
          .from('communities')
          .insert({ owner_id: uid, name: c.name, kind: c.kind, city: c.city, description: c.description, logo_path, whatsapp: c.whatsapp || null, iban: c.iban || null, iban_name: c.ibanName || null })
          .select('id')
          .single();
        if (error || !row) {
          notify(friendlyError(error));
          return null;
        }
        await run(() => sb.from('community_members').insert({ community_id: row.id, player_id: uid, role: 'owner' }));
        return row.id as string;
      },
      joinCommunity: async (id) => {
        await run(() => sb.from('community_members').insert({ community_id: id, player_id: uid }));
      },
      leaveCommunity: async (id) => {
        await run(() => sb.from('community_members').delete().match({ community_id: id, player_id: uid }));
      },
      joinTournament: async (id, receipt) => {
        // Receipts go to a private bucket: only you and the tournament's organizer can open them.
        let receipt_path: string | null = null;
        if (receipt) {
          receipt_path = await uploadReceipt(id, receipt);
          if (!receipt_path) return false;
        }
        return run(() => sb.from('tournament_entries').insert({ tournament_id: id, player_id: uid, receipt_path }));
      },
    };
  }, [sb, uid, data, refresh]);

  if (session === undefined) return <Loading />;
  if (!session) return <SignIn client={sb} />;
  if (!data) return loadError ? <SignIn client={sb} error={tr('تعذّر تحميل البيانات. تأكد من الاتصال.', "Couldn't load data. Check your connection.")} onRetry={refresh} /> : <Loading />;
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
