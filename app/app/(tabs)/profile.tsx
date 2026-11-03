import { router } from 'expo-router';
import { Platform, Share, View } from 'react-native';
import { LevelMeter } from '@/components/LevelMeter';
import { PlayerCard } from '@/components/PlayerCard';
import { Button, Card, Screen, T } from '@/components/ui';
import { space } from '@/constants/theme';
import { fmtLevel } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Profile() {
  const { me, signOut } = useStore();
  const share = () => {
    const message = `مستواي في البادل ${fmtLevel(me.level)} على Rally 🎾`;
    if (Platform.OS === 'web') (navigator as any).share?.({ text: message });
    else Share.share({ message });
  };
  return (
    <Screen tabBar>
      <T variant="h1">ملفي</T>
      <PlayerCard player={me} />
      <View style={{ gap: space(3) }}>
        <Button title="شارك بطاقتك ستوري" icon="share" onPress={share} />
      </View>
      <Card style={{ padding: space(5) }}>
        <LevelMeter level={me.level} />
        <T variant="muted">
          {me.matchesPlayed === 0
            ? 'مستواك مبدئي من الاستبيان، ويتعدل تلقائياً بعد كل مباراة تنافسية.'
            : 'يتعدل تلقائياً بعد كل مباراة تنافسية حسب نتيجتك ومستوى خصومك.'}
        </T>
        {me.matchesPlayed === 0 && <Button title="أعد الاستبيان" variant="ghost" onPress={() => router.push('/level')} />}
      </Card>
      {signOut && <Button title="تسجيل الخروج" variant="dark" onPress={signOut} />}
    </Screen>
  );
}
