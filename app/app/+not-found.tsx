import { Link, Redirect, Stack } from 'expo-router';
import { Platform } from 'react-native';
import { Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';

export default function NotFound() {
  // On web an unknown path (e.g. the app hosted under a sub-path) just lands on home.
  if (Platform.OS === 'web') return <Redirect href="/" />;
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
