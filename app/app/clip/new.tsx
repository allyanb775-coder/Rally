import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, Input, Row, Screen, T } from '@/components/ui';
import { colors, radius, space } from '@/constants/theme';
import { MAX_CAPTION } from '@/lib/clips';
import { useStore } from '@/lib/store';

/** Preview the picked clip, add a caption, post it to your profile. */
export default function NewClip() {
  const { uri, mimeType, fileSize } = useLocalSearchParams<{ uri: string; mimeType?: string; fileSize?: string }>();
  const { addHighlight } = useStore();
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const player = useVideoPlayer(uri ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const post = async () => {
    if (!uri) return;
    setBusy(true);
    const ok = await addHighlight({ uri, mimeType: mimeType || undefined, fileSize: fileSize ? Number(fileSize) : undefined }, caption.trim());
    setBusy(false);
    if (ok) router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="h1">لقطة جديدة</T>
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </Row>
        <View style={s.video}>
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls />
        </View>
        <Input value={caption} onChangeText={setCaption} placeholder="وش صار في اللقطة؟ (اختياري)" maxLength={MAX_CAPTION} style={{ fontSize: 16 }} />
        <T variant="small">تظهر في ملفك لكل لاعبين Rally.</T>
        <Button title={busy ? 'جاري الرفع...' : 'انشر اللقطة'} icon="video" disabled={busy || !uri} onPress={post} />
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', aspectRatio: 9 / 12, backgroundColor: colors.ink, borderRadius: radius.sm, overflow: 'hidden', marginBottom: space(1) },
});
