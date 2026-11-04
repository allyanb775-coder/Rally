import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ClipGrid, ClipsHeader } from '@/components/Clips';
import { PlayerCard } from '@/components/PlayerCard';
import { Icon, Row, Screen, T } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useStore } from '@/lib/store';

/** Another player's card and clips. */
export default function PlayerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { players, highlights, me } = useStore();
  if (id === me.id) return <Redirect href="/profile" />;
  const p = players[id];
  const clips = highlights.filter((h) => h.playerId === id);
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h1">{p?.name ?? 'لاعب'}</T>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.back} accessibilityLabel="رجوع">
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrow" size={20} />
            </View>
          </Pressable>
        </Row>
        {p ? <PlayerCard player={p} /> : <T variant="muted">اللاعب غير موجود.</T>}
        <ClipsHeader count={clips.length} />
        <ClipGrid clips={clips} />
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
