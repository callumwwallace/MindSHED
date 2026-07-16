import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MOODS, MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

const LABELS = ['Rough', 'Low', 'Okay', 'Good', 'Great'];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const checkins = useWellness((state) => state.checkins);
  const [openDate, setOpenDate] = useState<string>();
  const ordered = [...checkins].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 38 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="Your record" title="Check-in history" description="A simple record of what you chose to notice. Individual days are context, not a score." />

      {ordered.length ? (
        <View style={{ marginTop: 24, backgroundColor: MS.color.surface, borderRadius: MS.radius.xl, paddingHorizontal: 15 }}>
          {ordered.map((item, index) => {
            const expanded = openDate === item.date;
            return (
              <View key={item.date} style={{ borderBottomWidth: index < ordered.length - 1 ? 1 : 0, borderBottomColor: `${MS.color.ink}0F` }}>
                <Pressable onPress={() => setOpenDate(expanded ? undefined : item.date)} accessibilityRole="button" accessibilityState={{ expanded }} style={({ pressed }) => ({ minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, opacity: pressed ? 0.64 : 1 })}>
                  <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: MOODS[item.mood - 1]?.color, alignItems: 'center', justifyContent: 'center' }}><Heading size={15} color={MS.color.inkSoft}>{item.mood}</Heading></View>
                  <View style={{ flex: 1 }}><BodyBold size={12.5} color={MS.color.inkSoft}>{new Date(`${item.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</BodyBold><Body size={10.5} color={MS.color.muted}>{LABELS[item.mood - 1]} · Energy {item.energy}/10 · Pressure {item.stress}/10</Body></View>
                  <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={MS.color.faint} />
                </Pressable>
                {expanded && <View style={{ paddingLeft: 54, paddingRight: 6, paddingBottom: 16 }}>
                  {!!item.needs?.length && <Body size={11} color={MS.color.forestMuted}>Wanted: {item.needs.join(', ')}</Body>}
                  {!!item.note && <View style={{ backgroundColor: MS.color.surfaceWarm, borderRadius: 14, padding: 12, marginTop: 8 }}><Body size={11.5} color={MS.color.inkSoft}>{item.note}</Body></View>}
                  {!item.note && !item.needs?.length && <Body size={10.5} color={MS.color.faint}>No optional reflection was added.</Body>}
                </View>}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingHorizontal: 34, marginTop: 72 }}><View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="calendar" size={27} color={MS.color.forestMuted} /></View><Heading size={18} color={MS.color.inkSoft} style={{ marginTop: 18 }}>Nothing to look back on yet</Heading><Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 5 }}>Your check-ins will appear here without streaks, missed-day marks or judgement.</Body></View>
      )}
    </ScrollView>
  );
}
