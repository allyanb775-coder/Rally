import { router } from 'expo-router';
import { Platform, Share } from 'react-native';
import { ClipGrid, ClipsHeader } from '@/components/Clips';
import { LevelMeter } from '@/components/LevelMeter';
import { PlayerCard } from '@/components/PlayerCard';
import { Button, Screen, T } from '@/components/ui';
import { fmtLevel } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Profile() {
  const { me, signOut, highlights } = useStore();
  const mine = highlights.filter((h) => h.playerId === me.id);
  const share = () => {
    const message = `مستواي في البادل ${fmtLevel(me.level)} على Rally 🎾`;
    if (Platform.OS === 'web') (navigator as any).share?.({ text: message });
    else Share.share({ message });
  };
  return (
    <Screen tabBar>
      <T variant="h1">بطاقتي</T>
      <PlayerCard player={me} />
      <Button title="شارك بطاقتك ستوري" icon="share" onPress={share} />
      <ClipsHeader count={mine.length} />
      <ClipGrid clips={mine} mine />
      <LevelMeter level={me.level} />
      <T variant="muted">
        {me.matchesPlayed === 0
          ? 'مستواك مبدئي من الاستبيان، ويتعدل تلقائياً بعد كل مباراة تنافسية.'
          : 'يتعدل تلقائياً بعد كل مباراة تنافسية حسب نتيجتك ومستوى خصومك.'}
      </T>
      {me.matchesPlayed === 0 && <Button title="أعد الاستبيان" variant="ghost" onPress={() => router.push('/level')} />}
      {signOut && <Button title="تسجيل الخروج" variant="dark" onPress={signOut} />}
    </Screen>
  );
}
