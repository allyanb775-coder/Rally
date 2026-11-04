import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

const LIGHTS = 9;

/**
 * An indoor padel arena at night, drawn in code: a dark hall, a row of roof lights
 * with beams falling to a blue court in the middle, the stands fading into shadow.
 */
export function Arena() {
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <LinearGradient colors={['#05060C', '#0B0F24', '#120B2A', '#05060C']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />

      {/* roof lights */}
      <View style={s.lights}>
        {Array.from({ length: LIGHTS }, (_, i) => (
          <View key={i} style={s.lamp} />
        ))}
      </View>

      {/* beams */}
      {[-1, 0, 1].map((k) => (
        <LinearGradient
          key={k}
          colors={['rgba(255,244,214,0.20)', 'rgba(255,244,214,0)']}
          style={[s.beam, { left: `${35 + k * 15}%`, transform: [{ rotate: `${k * 12}deg` }] }]}
        />
      ))}

      {/* purple stage haze, like arena lighting */}
      <View style={[s.haze, { left: '-20%', top: '30%', backgroundColor: 'rgba(124,58,237,0.20)' }]} />
      <View style={[s.haze, { right: '-25%', top: '45%', backgroundColor: 'rgba(59,130,246,0.18)' }]} />

      {/* the court, seen from the stands */}
      <View style={s.courtWrap}>
        <View style={s.court}>
          <View style={s.net} />
          <View style={[s.line, { top: '22%' }]} />
          <View style={[s.line, { bottom: '22%' }]} />
          <View style={s.center} />
        </View>
      </View>
      <LinearGradient colors={['rgba(5,6,12,0)', '#05060C']} style={s.fade} />
    </View>
  );
}

const s = StyleSheet.create({
  lights: { position: 'absolute', top: '6%', left: '8%', right: '8%', flexDirection: 'row', justifyContent: 'space-between' },
  lamp: { width: 10, height: 6, borderRadius: 3, backgroundColor: '#FFF4D6', shadowColor: '#FFE7A3', shadowOpacity: 1, shadowRadius: 10 },
  beam: { position: 'absolute', top: '6%', width: '30%', height: '75%' },
  haze: { position: 'absolute', width: '70%', aspectRatio: 1, borderRadius: 999, opacity: 0.9 },
  courtWrap: { position: 'absolute', left: 0, right: 0, top: '44%', alignItems: 'center' },
  court: { width: '58%', aspectRatio: 0.9, backgroundColor: colors.turf, borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)', transform: [{ perspective: 400 }, { rotateX: '58deg' }], shadowColor: '#3B82F6', shadowOpacity: 0.7, shadowRadius: 40 },
  net: { position: 'absolute', left: -6, right: -6, top: '50%', height: 3, backgroundColor: '#E5E7EB' },
  line: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.85)' },
  center: { position: 'absolute', left: '50%', top: '22%', bottom: '22%', width: 2, backgroundColor: 'rgba(255,255,255,0.85)' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '18%' },
});
