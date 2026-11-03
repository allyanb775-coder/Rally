import { Tabs } from 'expo-router';
import { Icon, IconName } from '@/components/ui';
import { colors } from '@/constants/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: unknown }) => <Icon name={icon} color={String(color)} size={24} />,
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tabs.Screen name="index" options={tab('الرئيسية', 'home')} />
      <Tabs.Screen name="matches" options={tab('المباريات', 'tennis')} />
      <Tabs.Screen name="tournaments" options={tab('البطولات', 'trophy')} />
      <Tabs.Screen name="profile" options={tab('ملفي', 'person')} />
    </Tabs>
  );
}
