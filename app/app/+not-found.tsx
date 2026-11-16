import { Link, Redirect, Stack } from 'expo-router';
import { Platform } from 'react-native';
import { Screen, T } from '@/components/ui';
import { colors } from '@/constants/theme';
import { tr } from '@/lib/i18n';

export default function NotFound() {
  // On web an unknown path (e.g. the app hosted under a sub-path) just lands on home.
  if (Platform.OS === 'web') return <Redirect href="/" />;
  return (
    <>
      <Stack.Screen options={{ title: tr('غير موجود', 'Not found') }} />
      <Screen>
        <T variant="h2">{tr('الصفحة غير موجودة.', 'Page not found.')}</T>
        <Link href="/">
          <T style={{ color: colors.accent }}>{tr('ارجع للرئيسية', 'Back to home')}</T>
        </Link>
      </Screen>
    </>
  );
}
