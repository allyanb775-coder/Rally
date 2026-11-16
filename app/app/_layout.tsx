import { IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { TeamComplete } from '@/components/TeamComplete';
import { colors } from '@/constants/theme';
import { lang, onLangChange } from '@/lib/i18n';
import { loadLang } from '@/lib/langSwitch';
import { StoreProvider } from '@/lib/StoreProvider';

export { ErrorBoundary } from 'expo-router';


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
  // Arabic by default (right-to-left); the saved language is applied before the first screen renders.
  const [langReady, setLangReady] = useState(false);
  const [langKey, setLangKey] = useState(lang());
  useEffect(() => {
    loadLang().finally(() => setLangReady(true));
    return onLangChange(setLangKey);
  }, []);
  useEffect(() => {
    if ((loaded || error) && langReady) SplashScreen.hideAsync();
  }, [loaded, error, langReady]);
  if ((!loaded && !error) || !langReady) return null;

  return (
    <StoreProvider key={langKey}>
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
          <Stack.Screen name="club/[id]" />
          <Stack.Screen name="club/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pay/[id]" options={{ presentation: 'modal' }} />
        </Stack>
        <TeamComplete />
      </ThemeProvider>
    </StoreProvider>
  );
}
