import { Chip, Row, T } from '@/components/ui';
import { lang, tr } from '@/lib/i18n';
import { switchLang } from '@/lib/langSwitch';

/** العربية / English. Switching restarts the app so text and layout direction both change. */
export function LangSwitch() {
  return (
    <>
      <T variant="label">{tr('اللغة', 'Language')}</T>
      <Row>
        <Chip label="العربية" active={lang() === 'ar'} onPress={() => switchLang('ar')} />
        <Chip label="English" active={lang() === 'en'} onPress={() => switchLang('en')} />
      </Row>
    </>
  );
}
