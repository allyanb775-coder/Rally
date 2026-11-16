import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CommunityLogo, KIND_LABEL } from '@/components/CommunityLogo';
import { Button, Chip, Heading, Lined, Row, Screen, T } from '@/components/ui';
import { colors, fonts, space } from '@/constants/theme';
import { useStore } from '@/lib/store';
import { CommunityKind } from '@/lib/types';

/** Communities, courts and academies anyone can add; yours first. */
export default function Clubs() {
  const { communities, me } = useStore();
  const [kind, setKind] = useState<CommunityKind | null>(null);
  const [cityOnly, setCityOnly] = useState(false);
  const list = communities
    .filter((c) => (kind ? c.kind === kind : true))
    .filter((c) => (cityOnly ? c.city === me.city : true))
    .sort((a, b) => Number(b.memberIds.includes(me.id)) - Number(a.memberIds.includes(me.id)) || b.memberIds.length - a.memberIds.length);

  return (
    <Screen tabBar>
      <Heading en="Clubs" ar="مجتمعات وملاعب وأكاديميات البادل" size="xl" />
      <Button title="أضف مجتمعك أو ملعبك" icon="plus" onPress={() => router.push('/club/new')} />

      <Row style={{ flexWrap: 'wrap' }}>
        <Chip label="الكل" active={!kind} onPress={() => setKind(null)} />
        {(Object.keys(KIND_LABEL) as CommunityKind[]).map((k) => (
          <Chip key={k} label={KIND_LABEL[k]} active={kind === k} onPress={() => setKind(kind === k ? null : k)} />
        ))}
        <Chip label="بمدينتي" active={cityOnly} onPress={() => setCityOnly(!cityOnly)} />
      </Row>

      {list.length === 0 && (
        <Lined style={{ alignItems: 'center', paddingVertical: space(8) }}>
          <T variant="h3">ما فيه شي هنا للحين</T>
          <T variant="muted">كن أول واحد يضيف مجتمعه.</T>
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
                  {KIND_LABEL[c.kind]} · {c.city} · {c.memberIds.length} عضو
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
