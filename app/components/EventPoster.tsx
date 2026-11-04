import { useState } from 'react';
import { Image, ImageSourcePropType, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/constants/theme';
import { Icon } from './ui';

/** A promo poster shown whole; tap to see it full screen. Sized in pixels so it's never cropped. */
export function EventPoster({ source, aspect, label }: { source: ImageSourcePropType; aspect: number; label: string }) {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(0);
  const win = useWindowDimensions();
  const fullW = Math.min(win.width - space(4), (win.height - 160) * aspect);
  return (
    <>
      <Pressable
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        onPress={() => setOpen(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel={label}
        style={({ pressed }) => [s.poster, pressed && { opacity: 0.9 }]}>
        {w > 0 && <Image source={source} style={{ width: w, height: w / aspect }} resizeMode="contain" />}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.backdrop}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={s.top}>
              <Pressable onPress={() => setOpen(false)} style={s.close} accessibilityLabel="إغلاق">
                <Icon name="close" size={20} />
              </Pressable>
            </View>
            <Pressable style={s.full} onPress={() => setOpen(false)}>
              <Image source={source} style={{ width: fullW, height: fullW / aspect }} resizeMode="contain" />
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  poster: { width: '100%', overflow: 'hidden', borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)' },
  top: { flexDirection: 'row', justifyContent: 'flex-end', padding: space(4) },
  close: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  full: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: space(8) },
});
