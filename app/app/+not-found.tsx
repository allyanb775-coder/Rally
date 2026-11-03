import { Link, Stack } from 'expo-router';
import { Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'غير موجود' }} />
      <Screen>
        <T variant="h2">الصفحة غير موجودة.</T>
        <Link href="/">
          <T style={{ color: colors.accent }}>ارجع للرئيسية</T>
        </Link>
      </Screen>
    </>
  );
}
