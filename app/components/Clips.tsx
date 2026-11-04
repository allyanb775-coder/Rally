import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, radius, space } from '@/constants/theme';
import { clipProblem, MAX_CLIP_SECONDS } from '@/lib/clips';
import { notify } from '@/lib/notify';
import { Highlight } from '@/lib/types';
import { Glass } from './Glass';
import { Icon, Row, T } from './ui';

/** Opens the phone's videos; on a valid pick, goes to the post screen. */
export async function pickClip() {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], videoMaxDuration: MAX_CLIP_SECONDS, quality: 1 });
  if (res.canceled || !res.assets?.[0]) return;
  const a = res.assets[0];
  const clip = { uri: a.uri, mimeType: a.mimeType, fileSize: a.fileSize, duration: a.duration };
  const problem = clipProblem(clip);
  if (problem) return notify(problem);
  router.push({ pathname: '/clip/new', params: { uri: clip.uri, mimeType: clip.mimeType ?? '', fileSize: String(clip.fileSize ?? '') } });
}

/** A clip's first frame, muted and paused, used as its tile. */
function Still({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.muted = true;
  });
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} pointerEvents="none" />;
}

/** Two-column wall of a player's clips, with an add tile on your own profile. */
export function ClipGrid({ clips, mine }: { clips: Highlight[]; mine?: boolean }) {
  return (
    <View style={s.grid}>
      {mine && (
        <Pressable onPress={pickClip} style={s.cell} accessibilityRole="button" accessibilityLabel="أضف لقطة">
          <Glass style={s.add}>
            <View style={s.plus}>
              <Icon name="plus" size={26} color={colors.ink} />
            </View>
            <T style={s.addText}>أضف لقطة</T>
            <T style={s.addHint}>حتى {MAX_CLIP_SECONDS} ثانية</T>
          </Glass>
        </Pressable>
      )}
      {clips.map((c) => (
        <Pressable key={c.id} onPress={() => router.push({ pathname: '/clip/[id]', params: { id: c.id } })} style={s.cell}>
          <View style={s.tile}>
            <Still url={c.url} />
            <View style={s.shade} />
            <View style={s.play}>
              <Icon name="play" size={18} color={colors.ink} />
            </View>
            {!!c.caption && (
              <T style={s.caption} numberOfLines={2}>
                {c.caption}
              </T>
            )}
          </View>
        </Pressable>
      ))}
      {!mine && clips.length === 0 && <T variant="muted">ما نزّل لقطات للحين.</T>}
    </View>
  );
}

/** Section header used on profiles. */
export function ClipsHeader({ count }: { count: number }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: space(2) }}>
      <T variant="h2">لقطات اللعب</T>
      <T variant="small">{count} لقطة</T>
    </Row>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  cell: { width: '47.5%', flexGrow: 1, maxWidth: '50%' },
  add: { aspectRatio: 9 / 14, alignItems: 'center', justifyContent: 'center', gap: 6 },
  plus: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.led, alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: fonts.kufi, fontSize: 14, lineHeight: 26, textAlign: 'center' },
  addHint: { fontSize: 11, color: colors.muted, textAlign: 'center' },
  tile: { aspectRatio: 9 / 14, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.ink, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%', backgroundColor: 'rgba(6,11,26,0.55)' },
  play: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.led, alignItems: 'center', justifyContent: 'center' },
  caption: { position: 'absolute', left: 10, right: 10, bottom: 10, fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
});
