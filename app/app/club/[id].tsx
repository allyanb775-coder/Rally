import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { CommunityLogo, KIND_LABEL } from '@/components/CommunityLogo';
import { MatchCard, PlayerRow } from '@/components/MatchCard';
import { Button, Heading, Icon, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { waLink } from '@/lib/whatsapp';

export default function Club() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { communities, matches, me, joinCommunity, leaveCommunity } = useStore();
  const [busy, setBusy] = useState(false);
  const c = communities.find((x) => x.id === id);
  if (!c) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">المجتمع غير موجود.</T>
      </Screen>
    );
  }
  const member = c.memberIds.includes(me.id);
  const owner = c.ownerId === me.id;
  const upcoming = matches.filter((m) => m.communityId === c.id && new Date(m.startsAt) > new Date());
  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };
  const share = () => {
    const message = `انضم لـ ${c.name} على Rally 🎾`;
    if (Platform.OS === 'web') (navigator as any).share?.({ text: message });
    else Share.share({ message });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/clubs'))} style={s.back} accessibilityLabel="رجوع">
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrow" size={20} />
            </View>
          </Pressable>
          <Pressable onPress={share} style={s.back} accessibilityLabel="شارك">
            <Icon name="share" size={18} />
          </Pressable>
        </Row>

        <View style={{ alignItems: 'center', gap: space(3) }}>
          <CommunityLogo community={c} size={132} />
          <T style={s.name}>{c.name}</T>
          <T variant="muted" style={{ textAlign: 'center' }}>
            {KIND_LABEL[c.kind]} · {c.city}
          </T>
        </View>

        <Row style={s.stats}>
          <Stat label="MEMBERS" value={c.memberIds.length} />
          <View style={s.sep} />
          <Stat label="UPCOMING" value={upcoming.length} />
        </Row>

        {!!c.description && <T style={{ fontSize: 15, lineHeight: 24 }}>{c.description}</T>}

        {!owner && waLink(c.whatsapp, '') && (
          <Button
            title="تواصل واتساب"
            icon="chat"
            variant="ghost"
            onPress={() => Linking.openURL(waLink(c.whatsapp, `السلام عليكم، شفت ${c.name} على Rally وأبي أستفسر.`)!).catch(() => {})}
          />
        )}

        {owner ? (
          <Button title="أنت المؤسس · افتح مباراة للمجتمع" icon="plus" onPress={() => router.push({ pathname: '/create-match', params: { communityId: c.id } })} />
        ) : member ? (
          <View style={{ gap: space(3) }}>
            <Button title="افتح مباراة للمجتمع" icon="plus" onPress={() => router.push({ pathname: '/create-match', params: { communityId: c.id } })} />
            <Button title="اطلع من المجتمع" variant="ghost" disabled={busy} onPress={() => act(() => leaveCommunity(c.id))} />
          </View>
        ) : (
          <Button title={busy ? '...' : 'انضم للمجتمع'} icon="check" disabled={busy} onPress={() => act(() => joinCommunity(c.id))} />
        )}

        <Heading en="Matches" ar="مباريات المجتمع" />
        {upcoming.length === 0 ? <T variant="muted">ما فيه مباريات قادمة للمجتمع.</T> : upcoming.map((m) => <MatchCard key={m.id} match={m} />)}

        <Heading en="Members" ar="الأعضاء" />
        <Lined style={{ gap: 0 }}>
          {c.memberIds.map((pid) => (
            <PlayerRow key={pid} id={pid} host={pid === c.ownerId} hostLabel="المؤسس" />
          ))}
        </Lined>
      </Screen>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <T style={s.statValue}>{value}</T>
      <T style={s.statLabel}>{label}</T>
    </View>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, textAlign: 'center' },
  stats: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: space(3), alignItems: 'stretch' },
  sep: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  statValue: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, textAlign: 'center' },
  statLabel: { fontFamily: fonts.display, fontSize: 11, letterSpacing: 1.5, color: colors.muted, textAlign: 'center' },
});
