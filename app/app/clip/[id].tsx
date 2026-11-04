import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, Row, Screen, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { fmtDate } from '@/lib/format';
import { useStore } from '@/lib/store';

/** Full-screen clip with its owner; your own clips can be deleted (asks once). */
export default function Clip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { highlights, players, me, deleteHighlight } = useStore();
  const clip = highlights.find((h) => h.id === id);
  const [confirming, setConfirming] = useState(false);
  const player = useVideoPlayer(clip?.url ?? null, (p) => {
    p.loop = true;
    p.play();
  });

  if (!clip) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <T variant="h2">اللقطة انحذفت.</T>
        <Button title="رجوع" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }
  const owner = players[clip.playerId];
  const mine = clip.playerId === me.id;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable
            onPress={() => (mine ? router.push('/profile') : router.push({ pathname: '/player/[id]', params: { id: clip.playerId } }))}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={s.avatar}>
              <T style={{ fontFamily: fonts.kufi, color: colors.ink, lineHeight: 24 }}>{owner?.name[0]}</T>
            </View>
            <View>
              <T variant="h3">{owner?.name ?? 'لاعب'}</T>
              <T variant="small">{fmtDate(clip.createdAt)}</T>
            </View>
          </Pressable>
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </Row>
        <View style={s.video}>
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls />
        </View>
        {!!clip.caption && <T style={{ fontSize: 16, lineHeight: 24 }}>{clip.caption}</T>}
        {mine &&
          (confirming ? (
            <Row style={{ gap: space(3) }}>
              <View style={{ flex: 1 }}>
                <Button
                  title="احذفها"
                  icon="trash"
                  onPress={async () => {
                    if (await deleteHighlight(clip.id)) router.back();
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="لا، خلّها" variant="ghost" onPress={() => setConfirming(false)} />
              </View>
            </Row>
          ) : (
            <Button title="احذف اللقطة" variant="ghost" icon="trash" onPress={() => setConfirming(true)} />
          ))}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', aspectRatio: 9 / 14, backgroundColor: '#000', borderRadius: radius.sm, overflow: 'hidden' },
});
