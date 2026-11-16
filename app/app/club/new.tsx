import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CommunityLogo, KIND_LABEL } from '@/components/CommunityLogo';
import { Button, Chip, Heading, Icon, Input, Row, Screen, T } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { CITIES } from '@/lib/cities';
import { useStore } from '@/lib/store';
import { waLink } from '@/lib/whatsapp';
import { CommunityKind } from '@/lib/types';

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
          <Heading en="New club" ar="أضف مجتمعك أو ملعبك" size="xl" />
          <Pressable onPress={() => router.back()} style={s.close} accessibilityLabel="إغلاق">
            <Icon name="close" size={20} />
          </Pressable>
        </Row>

        <Pressable onPress={pickLogo} style={{ alignSelf: 'center', alignItems: 'center', gap: 8 }} accessibilityRole="button" accessibilityLabel="اختر الشعار">
          <CommunityLogo community={{ name: name || '+', logo: logo?.uri }} size={112} />
          <T style={{ color: colors.blue, fontSize: 13 }}>{logo ? 'غيّر الشعار' : 'أضف شعار (اختياري)'}</T>
        </Pressable>

        <T variant="label">الاسم</T>
        <Input value={name} onChangeText={setName} placeholder="مثلاً: The Court Club" maxLength={40} />

        <T variant="label">النوع</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {(Object.keys(KIND_LABEL) as CommunityKind[]).map((k) => (
            <Chip key={k} label={KIND_LABEL[k]} active={kind === k} onPress={() => setKind(k)} />
          ))}
        </Row>

        <T variant="label">المدينة</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {CITIES.map((c) => (
            <Chip key={c} label={c} active={city === c} onPress={() => setCity(c)} />
          ))}
        </Row>

        <T variant="label">نبذة</T>
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="وش تسوون؟ مباريات أسبوعية، بطولات، تدريب..."
          maxLength={200}
          multiline
          style={{ height: 100, fontSize: 15, textAlignVertical: 'top', paddingTop: 14 }}
        />

        <T variant="label">رقم واتساب للتواصل (اختياري)</T>
        <Input value={whatsapp} onChangeText={setWhatsapp} placeholder="05XXXXXXXX" keyboardType="phone-pad" />
        {!!whatsapp && !waLink(whatsapp, '') && <T style={{ color: colors.danger, fontSize: 12 }}>اكتب رقم جوال سعودي صحيح</T>}

        <Button title={busy ? '...' : 'أضف'} icon="check" disabled={busy || name.trim().length < 2 || (!!whatsapp && !waLink(whatsapp, ''))} onPress={save} />
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  close: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});
