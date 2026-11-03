import { router } from 'expo-router';
import { useState } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { Button, Card, LevelBadge, Row, Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { findBestMatch } from '@/lib/findMatch';
import { levelLabel } from '@/lib/level';
import { useStore } from '@/lib/store';
import { Match } from '@/lib/types';

export default function Home() {
  const { me, matches } = useStore();
  const [found, setFound] = useState<Match | null | undefined>(undefined);
  const mine = matches.filter((m) => m.playerIds.includes(me.id));

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="h1">هلا {me.name === 'أنت' ? '' : me.name}👋</T>
        <Row>
          <T variant="muted">{levelLabel(me.level)}</T>
          <LevelBadge level={me.level} />
        </Row>
      </Row>

      <Card style={{ backgroundColor: colors.surfaceAlt, gap: 12 }}>
        <T variant="h2">جاهز تلعب؟</T>
        <T variant="muted">ضغطة وحدة ونلقى لك أقرب مباراة بمستواك.</T>
        <Button title="لقّني مباراة" icon="bolt" onPress={() => setFound(findBestMatch(matches, me))} />
        <Button title="افتح مباراة جديدة" icon="plus" variant="ghost" onPress={() => router.push('/create-match')} />
      </Card>

      {found === null && (
        <Card>
          <T>ما لقينا مباراة مفتوحة بمستواك حالياً.</T>
          <T variant="muted">افتح مباراة وخل الباقين ينضمون لك.</T>
        </Card>
      )}
      {found && (
        <>
          <T variant="h2">لقينا لك هذي 🎾</T>
          <MatchCard match={found} highlight />
        </>
      )}

      {mine.length > 0 && (
        <>
          <T variant="h2">مبارياتي</T>
          {mine.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </>
      )}

      {me.matchesPlayed === 0 && (
        <Card>
          <T variant="h2">ما حددت مستواك بعد</T>
          <T variant="muted">جاوب على ٥ أسئلة سريعة عشان نطابقك مع لاعبين بمستواك.</T>
          <Button title="ابدأ الاستبيان" variant="ghost" onPress={() => router.push('/level')} />
        </Card>
      )}
    </Screen>
  );
}
