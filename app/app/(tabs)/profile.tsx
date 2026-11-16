import { router } from 'expo-router';
import { Platform, Share } from 'react-native';
import { ClipGrid, ClipsHeader } from '@/components/Clips';
import { LangSwitch } from '@/components/LangSwitch';
import { LevelMeter } from '@/components/LevelMeter';
import { PlayerCard } from '@/components/PlayerCard';
import { Button, Heading, Screen, T } from '@/components/ui';
import { fmtLevel } from '@/lib/format';
import { useStore } from '@/lib/store';
import { tr } from '@/lib/i18n';

export default function Profile() {
  const { me, signOut, highlights } = useStore();
  const mine = highlights.filter((h) => h.playerId === me.id);
  const share = () => {
    const message = tr(`مستواي في البادل ${fmtLevel(me.level)} على Rally 🎾`, `My padel level is ${fmtLevel(me.level)} on Rally 🎾`);
    if (Platform.OS === 'web') (navigator as any).share?.({ text: message });
    else Share.share({ message });
  };
  return (
    <Screen tabBar>
      <Heading en="My card" ar={tr('بطاقتي', 'My player card')} size="xl" />
      <PlayerCard player={me} />
      <Button title={tr('شارك بطاقتك ستوري', 'Share your card as a story')} icon="share" onPress={share} />
      <ClipsHeader count={mine.length} />
      <ClipGrid clips={mine} mine />
      <LevelMeter level={me.level} />
      <T variant="muted">
        {me.matchesPlayed === 0
          ? tr('مستواك مبدئي من الاستبيان، ويتعدل تلقائياً بعد كل مباراة تنافسية.', 'Your level comes from the questionnaire for now and updates automatically after every competitive match.')
          : tr('يتعدل تلقائياً بعد كل مباراة تنافسية حسب نتيجتك ومستوى خصومك.', "Updates automatically after every competitive match, based on your result and your opponents' level.")}
      </T>
      {me.matchesPlayed === 0 && <Button title={tr('أعد الاستبيان', 'Retake the questionnaire')} variant="ghost" onPress={() => router.push('/level')} />}
      <LangSwitch />
      {signOut && <Button title={tr('تسجيل الخروج', 'Sign out')} variant="dark" onPress={signOut} />}
    </Screen>
  );
}
