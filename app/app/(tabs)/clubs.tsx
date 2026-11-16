import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { CommunityLogo, KIND_LABEL } from '@/components/CommunityLogo';
import { Button, Chip, Heading, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { CommunityKind } from '@/lib/types';
import { tr } from '@/lib/i18n';
import { cityLabel, regionOf } from '@/lib/cities';
import { RegionChips } from '@/components/RegionPicker';
import { waLink } from '@/lib/whatsapp';
import { RALLY_WHATSAPP } from '@/constants/contact';

/** Communities, courts and academies anyone can add; yours first. */
export default function Clubs() {
  const { communities, me } = useStore();
  const [kind, setKind] = useState<CommunityKind | null>(null);
  const [cityOnly, setCityOnly] = useState(false);
  const [region, setRegion] = useState<string | null>(null);
  const list = communities
    .filter((c) => (kind ? c.kind === kind : true))
    .filter((c) => (cityOnly ? c.city === me.city : true))
    .filter((c) => (region ? regionOf(c.city)?.id === region : true))
    .sort((a, b) => Number(b.memberIds.includes(me.id)) - Number(a.memberIds.includes(me.id)) || b.memberIds.length - a.memberIds.length);

  const contactUs = () => {
    const msg = tr(
      `السلام عليكم، أبي أضيف مجتمعي/ملعبي في Rally.\nالاسم: \nالنوع (مجتمع / ملعب / أكاديمية): \nالمدينة: ${me.city}`,
      `Hi, I'd like to add my community/court to Rally.\nName: \nType (community / court / academy): \nCity: ${cityLabel(me.city)}`,
    );
    const url = waLink(RALLY_WHATSAPP, msg);
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen tabBar>
      <Heading en="Clubs" ar={tr('مجتمعات وملاعب وأكاديميات البادل', 'Padel communities, courts and academies')} size="xl" />
      <Lined style={{ gap: space(2) }}>
        <T variant="h3">{tr('عندك مجتمع أو ملعب أو أكاديمية؟', 'Run a community, court or academy?')}</T>
        <T variant="muted">{tr('تواصل معنا ونضيفه لك في Rally.', 'Get in touch and we will add it to Rally.')}</T>
        <Button title={tr('تواصل معنا', 'Contact us')} icon="chat" onPress={contactUs} />
      </Lined>

      <Row style={{ flexWrap: 'wrap' }}>
        <Chip label={tr('الكل', 'All')} active={!kind} onPress={() => setKind(null)} />
        {(Object.keys(KIND_LABEL) as CommunityKind[]).map((k) => (
          <Chip key={k} label={KIND_LABEL[k]} active={kind === k} onPress={() => setKind(kind === k ? null : k)} />
        ))}
        <Chip label={tr('بمدينتي', 'My city')} active={cityOnly} onPress={() => setCityOnly(!cityOnly)} />
      </Row>
      <RegionChips value={region} onChange={setRegion} all first={regionOf(me.city)?.id} />

      {list.length === 0 && (
        <Lined style={{ alignItems: 'center', paddingVertical: space(8) }}>
          <T variant="h3">{tr('ما فيه شي هنا للحين', 'Nothing here yet')}</T>
          <T variant="muted">{tr('تواصل معنا ونضيف مجتمعك.', 'Contact us to add your community.')}</T>
        </Lined>
      )}

      {list.map((c) => {
        const member = c.memberIds.includes(me.id);
        return (
          <Pressable key={c.id} onPress={() => router.push({ pathname: '/club/[id]', params: { id: c.id } })}>
            <Lined style={s.card}>
              <CommunityLogo community={c} size={64} />
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <T variant="h3" numberOfLines={1}>{c.name}</T>
                <T variant="small">
                  {KIND_LABEL[c.kind]} · {cityLabel(c.city)} · {c.memberIds.length} {tr('عضو', c.memberIds.length === 1 ? 'member' : 'members')}
                </T>
                {!!c.description && (
                  <T variant="small" numberOfLines={1} style={{ color: colors.muted }}>
                    {c.description}
                  </T>
                )}
              </View>
              {member && <T style={s.member}>{c.ownerId === me.id ? 'OWNER' : 'MEMBER'}</T>}
            </Lined>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  member: { fontFamily: fonts.display, fontSize: 10, letterSpacing: 1, color: '#FFFFFF', backgroundColor: colors.blue, paddingHorizontal: 8, borderRadius: 999, overflow: 'hidden', lineHeight: 18 },
});
