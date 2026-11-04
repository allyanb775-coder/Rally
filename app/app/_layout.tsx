import { IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import 'react-native-reanimated';
import { TeamComplete } from '@/components/TeamComplete';
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

SplashScreen.preventAutoHideAsync();

export const unstable_settings = { anchor: '(tabs)' };

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, primary: colors.accent, text: colors.text, border: colors.border },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Anton_400Regular,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_700Bold,
  });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <StoreProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="match/[id]" />
          <Stack.Screen name="create-match" options={{ presentation: 'modal' }} />
          <Stack.Screen name="level" options={{ presentation: 'modal' }} />
          <Stack.Screen name="result/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="clip/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="clip/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="player/[id]" />
        </Stack>
        <TeamComplete />
      </ThemeProvider>
    </StoreProvider>
  );
}
