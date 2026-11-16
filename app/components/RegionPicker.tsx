import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Chip, Row, T } from '@/components/ui';
import { space } from '@/constants/theme';
import { cityLabel, REGIONS, regionLabel, regionOf } from '@/lib/cities';
import { tr } from '@/lib/i18n';

/** Pick the region first, then a city in it. */
export function CityPicker({ city, onChange }: { city: string; onChange: (city: string) => void }) {
  const [regionId, setRegionId] = useState(regionOf(city)?.id ?? REGIONS[0].id);
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];
  return (
    <View style={{ gap: space(2) }}>
      <T variant="small">{tr('المنطقة', 'Region')}</T>
      <RegionChips value={regionId} onChange={(id) => id && setRegionId(id)} />
      <T variant="small">{tr('المدينة', 'City')}</T>
      <Row style={{ flexWrap: 'wrap' }}>
        {region.cities.map(([c]) => (
          <Chip key={c} label={cityLabel(c)} active={city === c} onPress={() => onChange(c)} />
        ))}
      </Row>
    </View>
  );
}

/** Horizontal row of region chips. With `all`, a first chip clears the choice (null). */
export function RegionChips({ value, onChange, all, first }: { value: string | null; onChange: (id: string | null) => void; all?: boolean; first?: string }) {
  const regions = first ? [...REGIONS].sort((a, b) => Number(b.id === first) - Number(a.id === first)) : REGIONS;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2) }} style={{ flexGrow: 0, marginHorizontal: -space(4) }}>
      <View style={{ width: space(2) }} />
      {all && <Chip label={tr('كل المناطق', 'All regions')} active={!value} onPress={() => onChange(null)} />}
      {regions.map((r) => (
        <Chip key={r.id} label={regionLabel(r)} active={value === r.id} onPress={() => onChange(all && value === r.id ? null : r.id)} />
      ))}
      <View style={{ width: space(2) }} />
    </ScrollView>
  );
}
