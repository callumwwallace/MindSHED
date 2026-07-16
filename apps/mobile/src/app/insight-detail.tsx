import Feather from '@expo/vector-icons/Feather';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

const RULES = [
  { icon: 'calendar', title: 'The week uses seven actual dates', detail: 'A day without a check-in stays blank. It is never replaced with a zero or joined across a gap.' },
  { icon: 'layers', title: 'A comparison needs both sides', detail: 'MindSHED waits for at least three paired days in each group before describing a sleep, movement or feeling difference.' },
  { icon: 'slash', title: 'Counts are not causes', detail: 'MindSHED can describe repeated answers. It does not claim that one activity, need or feeling caused another.' },
  { icon: 'smartphone', title: 'Phone health stays contextual', detail: 'Daily sleep duration and step totals can sit beside check-ins. They never alter an answer or create a hidden wellbeing score.' },
  { icon: 'lock', title: 'Private text is never analysed', detail: 'Journal entries, check-in notes and support-plan content stay outside the insight rules and research event schema.' },
] as const;

export default function InsightDetailScreen() {
  const insets = useSafeAreaInsets();
  const checkins = useWellness((state) => state.checkins);
  const pulses = useWellness((state) => state.wellbeingPulses);
  const health = useWellness((state) => state.healthDailySummaries);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#E7D8B9' }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="Nothing hidden" title="How an insight earns its place" description="Transparent, rule-based descriptions—never diagnosis, prediction or hidden analysis." />
      <View style={{ marginTop: 24, borderRadius: 24, backgroundColor: '#FFFDF4', paddingHorizontal: 16 }}>
        {RULES.map((rule, index) => <View key={rule.title} style={{ flexDirection: 'row', gap: 12, paddingVertical: 16, borderBottomWidth: index < RULES.length - 1 ? 1 : 0, borderBottomColor: `${MS.color.ink}0E` }}><View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: index % 2 ? '#F2E7C7' : MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name={rule.icon} size={16} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={12} color={MS.color.inkSoft}>{rule.title}</BodyBold><Body size={10.5} color={MS.color.muted} style={{ marginTop: 3, lineHeight: 16 }}>{rule.detail}</Body></View></View>)}
      </View>
      <View style={{ marginTop: 12, borderRadius: 22, backgroundColor: MS.color.sageSoft, padding: 17 }}>
        <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>WHAT EXISTS ON THIS DEVICE</BodyBold>
        <View style={{ flexDirection: 'row', marginTop: 14 }}><View style={{ flex: 1 }}><Heading size={21} color={MS.color.forest}>{checkins.length}</Heading><Body size={10} color={MS.color.forestMuted}>daily check-ins</Body></View><View style={{ width: 1, backgroundColor: `${MS.color.forest}20`, marginHorizontal: 10 }} /><View style={{ flex: 1 }}><Heading size={21} color={MS.color.forest}>{pulses.length}</Heading><Body size={10} color={MS.color.forestMuted}>wellbeing checks</Body></View><View style={{ width: 1, backgroundColor: `${MS.color.forest}20`, marginHorizontal: 10 }} /><View style={{ flex: 1 }}><Heading size={21} color={MS.color.forest}>{health.length}</Heading><Body size={10} color={MS.color.forestMuted}>phone-health days</Body></View></View>
      </View>
      <Body size={10} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 18, paddingHorizontal: 22 }}>Daily check-ins, SWEMWBS and phone health remain separate records because they answer different questions and use different time periods.</Body>
    </ScrollView>
  );
}
