import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, Platform } from 'react-native';
import 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { StoreProvider } from '@/lib/StoreProvider';

export { ErrorBoundary } from 'expo-router';

// Arabic-first app: force right-to-left layout on native (web uses <html dir="rtl">).
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
}

export const unstable_settings = { anchor: '(tabs)' };

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, primary: colors.accent, text: colors.text, border: colors.border },
};

export default function RootLayout() {
  return (
    <StoreProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerBackTitle: 'رجوع', headerTitleStyle: { fontWeight: '700' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="match/[id]" options={{ title: 'تفاصيل المباراة' }} />
          <Stack.Screen name="create-match" options={{ title: 'افتح مباراة', presentation: 'modal' }} />
          <Stack.Screen name="level" options={{ title: 'حدد مستواك', presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
