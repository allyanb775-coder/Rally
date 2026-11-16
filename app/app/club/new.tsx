import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CommunityLogo, KIND_LABEL } from '@/components/CommunityLogo';
import { Button, Chip, Heading, Icon, Input, Row, Screen, T } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { CITIES, cityLabel } from '@/lib/cities';
import { useStore } from '@/lib/store';
import { waLink } from '@/lib/whatsapp';
import { CommunityKind } from '@/lib/types';
import { tr } from '@/lib/i18n';

/** Add a community, court or academy: name, type, city, a line about it, and a logo. */
export default function NewClub() {
  const { me, createCommunity } = useStore();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CommunityKind>('community');
  const [city, setCity] = useState(me.city);
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [logo, setLogo] = useState<{ uri: string; mime?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const pickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!res.canceled && res.assets?.[0]) setLogo({ uri: res.assets[0].uri, mime: res.assets[0].mimeType ?? undefined });
  };

  const save = async () => {
    setBusy(true);
    const id = await createCommunity({ name: name.trim(), kind, city, description: description.trim(), whatsapp: whatsapp.trim() || undefined, logoUri: logo?.uri, logoMime: logo?.mime });
    setBusy(false);
    if (id) router.replace({ pathname: '/club/[id]', params: { id } });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading en="New club" ar={tr('أضف مجتمعك أو ملعبك', 'Add your community or court')} size="xl" />
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel={tr('إغلاق', 'Close')}>
            <Icon name="close" size={20} />
          </Pressable>
        </Row>

        <Pressable onPress={pickLogo} style={{ alignSelf: 'center', alignItems: 'center', gap: 8 }} accessibilityRole="button" accessibilityLabel={tr('اختر الشعار', 'Choose logo')}>
          <CommunityLogo community={{ name: name || '+', logo: logo?.uri }} size={112} />
          <T style={{ color: colors.blue, fontSize: 13 }}>{logo ? tr('غيّر الشعار', 'Change logo') : tr('أضف شعار (اختياري)', 'Add a logo (optional)')}</T>
        </Pressable>

        <T variant="label">{tr('الاسم', 'Name')}</T>
        <Input value={name} onChangeText={setName} placeholder={tr('مثلاً: The Court Club', 'e.g. The Court Club')} maxLength={40} />

        <T variant="label">{tr('النوع', 'Type')}</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {(Object.keys(KIND_LABEL) as CommunityKind[]).map((k) => (
            <Chip key={k} label={KIND_LABEL[k]} active={kind === k} onPress={() => setKind(k)} />
          ))}
        </Row>

        <T variant="label">{tr('المدينة', 'City')}</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {CITIES.map((c) => (
            <Chip key={c} label={cityLabel(c)} active={city === c} onPress={() => setCity(c)} />
          ))}
        </Row>

        <T variant="label">{tr('نبذة', 'About')}</T>
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder={tr('وش تسوون؟ مباريات أسبوعية، بطولات، تدريب...', 'What do you do? Weekly matches, tournaments, coaching...')}
          maxLength={200}
          multiline
          style={{ height: 100, fontSize: 15, textAlignVertical: 'top', paddingTop: 14 }}
        />

        <T variant="label">{tr('رقم واتساب للتواصل (اختياري)', 'WhatsApp number (optional)')}</T>
        <Input value={whatsapp} onChangeText={setWhatsapp} placeholder="05XXXXXXXX" keyboardType="phone-pad" />
        {!!whatsapp && !waLink(whatsapp, '') && <T style={{ color: colors.danger, fontSize: 12 }}>{tr('اكتب رقم جوال سعودي صحيح', 'Enter a valid Saudi mobile number')}</T>}

        <Button title={busy ? '...' : tr('أضف', 'Add')} icon="check" disabled={busy || name.trim().length < 2 || (!!whatsapp && !waLink(whatsapp, ''))} onPress={save} />
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});
