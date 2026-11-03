import { router } from 'expo-router';
import { Platform, Share } from 'react-native';
import { PlayerCard } from '@/components/PlayerCard';
import { Button, Screen, T } from '@/components/ui';
import { fmtLevel } from '@/lib/format';
import { useStore } from '@/lib/store';

export default function Profile() {
  const { me, signOut } = useStore();
  const share = () => {
    const message = `مستواي في البادل ${fmtLevel(me.level)} على Rally 🎾`;
    if (Platform.OS === 'web') {
      (navigator as any).share?.({ text: message });
    } else {
      Share.share({ message });
    }
  };
  return (
    <Screen>
      <T variant="h1">ملفي</T>
      <PlayerCard player={me} />
      <Button title="شارك بطاقتك" onPress={share} />
      {me.matchesPlayed === 0 && <Button title="أعد تحديد مستواي" variant="ghost" onPress={() => router.push('/level')} />}
      {signOut && <Button title="تسجيل الخروج" variant="ghost" onPress={signOut} />}
    </Screen>
  );
}
