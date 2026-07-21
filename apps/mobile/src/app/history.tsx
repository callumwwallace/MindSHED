import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Display, Heading } from '@/components/ms/text';
import { MOODS, MS } from '@/constants/mindshed';
import type { Checkin } from '@/store/wellness';
import { useWellness } from '@/store/wellness';

const LABELS = ['Rough', 'Low', 'Okay', 'Good', 'Great'];
const FILTERS = [
  { id: 'all', label: 'All time' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
] as const;
type HistoryFilter = (typeof FILTERS)[number]['id'];

function localDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Body size={9.5} color={MS.color.muted}>{label}</Body>
        <BodyBold size={9.5} color={MS.color.inkSoft}>{value}/10</BodyBold>
      </View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: `${MS.color.forest}12`, marginTop: 5, overflow: 'hidden' }}>
        <View style={{ width: `${value * 10}%`, height: '100%', borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

function RecordIntro({ checkins }: { checkins: Checkin[] }) {
  const latest = checkins[0];

  return (
    <View style={{ marginTop: 22, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: `${MS.color.forest}18`, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Display size={32} color={MS.color.inkSoft}>{checkins.length}</Display>
          <Body size={10.5} color={MS.color.muted} style={{ marginLeft: 7 }}>moment{checkins.length === 1 ? '' : 's'} recorded</Body>
        </View>
        <Body size={9.5} color={MS.color.faint} style={{ marginTop: 1 }}>Context, never a score.</Body>
      </View>
      <View style={{ width: 1, height: 45, marginHorizontal: 15, backgroundColor: `${MS.color.forest}18` }} />
      <View style={{ flex: 1 }}>
        <BodyBold size={8.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.05 }}>MOST RECENT</BodyBold>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, marginRight: 7, backgroundColor: MOODS[latest.mood - 1]?.color }} />
          <BodyBold size={11.5} color={MS.color.inkSoft}>{LABELS[latest.mood - 1]}</BodyBold>
        </View>
        <Body size={9} color={MS.color.muted} style={{ marginTop: 2 }}>{localDate(latest.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</Body>
      </View>
    </View>
  );
}

function HistoryRow({ item, expanded, onToggle }: { item: Checkin; expanded: boolean; onToggle: () => void }) {
  const mood = MOODS[item.mood - 1];
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: `${MS.color.forest}14` }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded }} style={({ pressed }) => ({ minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingVertical: 13, opacity: pressed ? 0.58 : 1 })}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: mood?.color }} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <BodyBold size={12.5} color={MS.color.inkSoft}>{localDate(item.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' })}</BodyBold>
          <Body size={9.5} color={MS.color.forestMuted} style={{ marginTop: 3 }}>{LABELS[item.mood - 1]}</Body>
        </View>
        <View style={{ alignItems: 'flex-end', marginRight: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Feather name="sun" size={10} color="#99752E" /><Body size={9} color={MS.color.muted}>Energy {item.energy}</Body></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}><Feather name="wind" size={10} color="#98605D" /><Body size={9} color={MS.color.muted}>Pressure {item.stress}</Body></View>
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={MS.color.forestMuted} />
      </Pressable>

      {expanded && <View style={{ paddingLeft: 24, paddingRight: 4, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <MetricBar label="Energy" value={item.energy} color="#D6B24F" />
          <MetricBar label="Pressure" value={item.stress} color="#C78680" />
        </View>
        {!!item.needs?.length && <View style={{ marginTop: 14 }}><BodyBold size={9.5} color={MS.color.forestMuted}>WHAT FELT NEEDED</BodyBold><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>{item.needs.map((need) => <View key={need} style={{ borderRadius: 999, backgroundColor: MS.color.sageSoft, paddingHorizontal: 10, paddingVertical: 6 }}><Body size={9.5} color={MS.color.forest}>{need}</Body></View>)}</View></View>}
        {!!item.note && <View style={{ backgroundColor: MS.color.surfaceWarm, borderLeftWidth: 3, borderLeftColor: MS.color.sage, borderRadius: 12, padding: 12, marginTop: 12 }}><BodyBold size={9.5} color={MS.color.forestMuted}>A NOTE TO SELF</BodyBold><Body size={11.5} color={MS.color.inkSoft} style={{ marginTop: 4, lineHeight: 17 }}>{item.note}</Body></View>}
        {!item.note && !item.needs?.length && <Body size={10.5} color={MS.color.faint}>No optional reflection was added.</Body>}
      </View>}
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const checkins = useWellness((state) => state.checkins);
  const [openDate, setOpenDate] = useState<string>();
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const ordered = useMemo(() => [...checkins].sort((a, b) => b.date.localeCompare(a.date)), [checkins]);
  const filtered = useMemo(() => {
    if (filter === 'all') return ordered;
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - Number(filter) + 1);
    return ordered.filter((item) => localDate(item.date) >= cutoff);
  }, [filter, ordered]);
  const sections = useMemo(() => {
    const grouped = new Map<string, Checkin[]>();
    filtered.forEach((item) => grouped.set(monthKey(item.date), [...(grouped.get(monthKey(item.date)) ?? []), item]));
    return [...grouped.entries()].map(([key, data]) => ({
      key,
      title: localDate(`${key}-15`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      data,
    }));
  }, [filtered]);

  if (!ordered.length) {
    return (
      <View style={{ flex: 1, backgroundColor: MS.color.cream, paddingTop: insets.top + 12, paddingHorizontal: 18 }}>
        <ScreenHeader eyebrow="Your record" title="Check-in history" description="A simple record of what you chose to notice. Individual days are context, not a score." fallback="/(tabs)/insights" />
        <View style={{ alignItems: 'center', paddingHorizontal: 34, marginTop: 72 }}><View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="calendar" size={27} color={MS.color.forestMuted} /></View><Heading size={18} color={MS.color.inkSoft} style={{ marginTop: 18 }}>Nothing to look back on yet</Heading><Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 5 }}>Your check-ins will appear here without streaks, missed-day marks or judgement.</Body></View>
      </View>
    );
  }

  return (
    <SectionList
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 38 }}
      sections={sections}
      keyExtractor={(item) => item.date}
      stickySectionHeadersEnabled
      initialNumToRender={12}
      maxToRenderPerBatch={16}
      windowSize={9}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<View style={{ paddingTop: insets.top + 12 }}>
        <ScreenHeader eyebrow="Your record" title="Check-in history" description="A simple record of what you chose to notice. Individual days are context, not a score." fallback="/(tabs)/insights" />
        <RecordIntro checkins={ordered} />
        {ordered.length > 30 && <View style={{ flexDirection: 'row', marginTop: 15 }}>
          {FILTERS.map((option) => <Pressable key={option.id} onPress={() => { setFilter(option.id); setOpenDate(undefined); }} accessibilityRole="radio" accessibilityState={{ selected: filter === option.id }} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: filter === option.id ? 2 : 1, borderBottomColor: filter === option.id ? MS.color.forest : `${MS.color.forest}16` }}><BodyBold size={9.5} color={filter === option.id ? MS.color.forest : MS.color.muted}>{option.label}</BodyBold></Pressable>)}
        </View>}
      </View>}
      ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: 54 }}><Feather name="calendar" size={24} color={MS.color.forestMuted} /><BodyBold size={12} color={MS.color.inkSoft} style={{ marginTop: 12 }}>No check-ins in this period</BodyBold><Body size={10.5} color={MS.color.muted} style={{ marginTop: 3 }}>Choose a wider view to look further back.</Body></View>}
      renderSectionHeader={({ section }) => (
        <View style={{ backgroundColor: MS.color.cream, paddingTop: 18, paddingBottom: 7, flexDirection: 'row', alignItems: 'center' }}>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>{section.title.toUpperCase()}</BodyBold>
          <View style={{ flex: 1, height: 1, backgroundColor: `${MS.color.forest}12`, marginHorizontal: 10 }} />
          <Body size={9.5} color={MS.color.faint}>{section.data.length} {section.data.length === 1 ? 'moment' : 'moments'}</Body>
        </View>
      )}
      renderItem={({ item }) => <HistoryRow item={item} expanded={openDate === item.date} onToggle={() => setOpenDate(openDate === item.date ? undefined : item.date)} />}
    />
  );
}
