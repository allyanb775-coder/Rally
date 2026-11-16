import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { CommunityLogo, KIND_LABEL } from '@/components/CommunityLogo';
import { MatchCard, PlayerRow } from '@/components/MatchCard';
import { Button, Heading, Icon, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { waLink } from '@/lib/whatsapp';
import { tr } from '@/lib/i18n';
import { cityLabel } from '@/lib/cities';

export default function Club() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { communities, matches, me, joinCommunity, leaveCommunity } = useStore();
  const [busy, setBusy] = useState(false);
  const c = communities.find((x) => x.id === id);
  if (!c) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">{tr('المجتمع غير موجود.', 'Club not found.')}</T>
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
    const message = tr(`انضم لـ ${c.name} على Rally 🎾`, `Join ${c.name} on Rally 🎾`);
    if (Platform.OS === 'web') (navigator as any).share?.({ text: message });
    else Share.share({ message });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/clubs'))} style={s.back} accessibilityLabel={tr('رجوع', 'Back')}>
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrow" size={20} />
            </View>
          </Pressable>
          <Pressable onPress={share} style={s.back} accessibilityLabel={tr('شارك', 'Share')}>
            <Icon name="share" size={18} />
          </Pressable>
        </Row>

        <View style={{ alignItems: 'center', gap: space(3) }}>
          <CommunityLogo community={c} size={132} />
          <T style={s.name}>{c.name}</T>
          <T variant="muted" style={{ textAlign: 'center' }}>
            {KIND_LABEL[c.kind]} · {cityLabel(c.city)}
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
            title={tr('تواصل واتساب', 'WhatsApp')}
            icon="chat"
            variant="ghost"
            onPress={() => Linking.openURL(waLink(c.whatsapp, tr(`السلام عليكم، شفت ${c.name} على Rally وأبي أستفسر.`, `Hi, I found ${c.name} on Rally and have a question.`))!).catch(() => {})}
          />
        )}

        {owner ? (
          <Button title={tr('أنت المؤسس · افتح مباراة للمجتمع', "You're the founder · open a club match")} icon="plus" onPress={() => router.push({ pathname: '/create-match', params: { communityId: c.id } })} />
        ) : member ? (
          <View style={{ gap: space(3) }}>
            <Button title={tr('افتح مباراة للمجتمع', 'Open a club match')} icon="plus" onPress={() => router.push({ pathname: '/create-match', params: { communityId: c.id } })} />
            <Button title={tr('اطلع من المجتمع', 'Leave club')} variant="ghost" disabled={busy} onPress={() => act(() => leaveCommunity(c.id))} />
          </View>
        ) : (
          <Button title={busy ? '...' : tr('انضم للمجتمع', 'Join club')} icon="check" disabled={busy} onPress={() => act(() => joinCommunity(c.id))} />
        )}

        <Heading en="Matches" ar={tr('مباريات المجتمع', 'Club matches')} />
        {upcoming.length === 0 ? <T variant="muted">{tr('ما فيه مباريات قادمة للمجتمع.', 'No upcoming club matches.')}</T> : upcoming.map((m) => <MatchCard key={m.id} match={m} />)}

        <Heading en="Members" ar={tr('الأعضاء', 'Members')} />
        <Lined style={{ gap: 0 }}>
          {c.memberIds.map((pid) => (
            <PlayerRow key={pid} id={pid} host={pid === c.ownerId} hostLabel={tr('المؤسس', 'Founder')} />
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
