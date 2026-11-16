import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevSettings, I18nManager, Platform } from 'react-native';
import { lang, LANG_KEY, setCurrentLang, type Lang } from './i18n';

/** Native: read the saved language before first render and make the layout direction match it. */
export async function loadLang() {
  if (Platform.OS === 'web') {
    document.documentElement.dir = lang() === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang();
    return;
  }
  const saved = (await AsyncStorage.getItem(LANG_KEY).catch(() => null)) as Lang | null;
  setCurrentLang(saved === 'en' ? 'en' : 'ar');
  const rtl = lang() === 'ar';
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  if (I18nManager.isRTL !== rtl) restart();
}

/** Save the language and restart the app so text and direction both switch. */
export async function switchLang(l: Lang) {
  if (l === lang()) return;
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
    window.name = `${LANG_KEY}=${l}`;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
    setCurrentLang(l); // the root layout remounts the app in the new language
    return;
  }
  await AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  setCurrentLang(l);
  I18nManager.allowRTL(l === 'ar');
  I18nManager.forceRTL(l === 'ar');
  restart();
}

function restart() {
  try {
    // expo-updates reloads in release builds; DevSettings covers development.
    const Updates = require('expo-updates');
    if (Updates?.reloadAsync) return void Updates.reloadAsync().catch(() => DevSettings.reload());
  } catch {}
  DevSettings.reload();
}
