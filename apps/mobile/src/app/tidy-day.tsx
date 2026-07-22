import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GrowPlayScene } from '@/components/ms/grow-play-scene';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { goBackOrReplace } from '@/lib/navigation';

const THOUGHTS = [
  'Take one small next step',
  'Reply to every message',
  'A worry about next week',
  'Ask someone for help',
] as const;

const BASKETS = [
  { id: 'today', label: 'Today', detail: 'Worth my energy now', icon: 'sun', color: '#D6F7B8' },
  { id: 'later', label: 'Later', detail: 'Save for another day', icon: 'clock', color: '#F2E7C7' },
  { id: 'release', label: 'Let go', detail: 'Not mine to solve now', icon: 'wind', color: '#DDECEF' },
] as const;
type BasketId = (typeof BASKETS)[number]['id'];
type Choice = { thought: string; basket: BasketId };
type Phase = 'intro' | 'sorting' | 'complete';

function PottingHeader({ onBack, label }: { onBack: () => void; label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={label} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="arrow-left" size={18} color={MS.color.forest} /></Pressable><BodyBold size={9.5} color={MS.color.forestMuted} style={{ marginLeft: 12, letterSpacing: 1.25 }}>THE POTTING TABLE</BodyBold></View>;
}

export default function TidyDayScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('intro');
  const [choices, setChoices] = useState<Choice[]>([]);
  const thought = THOUGHTS[choices.length];
  const counts = useMemo(() => Object.fromEntries(BASKETS.map((basket) => [basket.id, choices.filter((choice) => choice.basket === basket.id).length])) as Record<BasketId, number>, [choices]);

  const place = (basket: BasketId) => {
    if (!thought) return;
    const next = [...choices, { thought, basket }];
    setChoices(next);
    if (next.length === THOUGHTS.length) setPhase('complete');
    feedback.soft();
  };

  const restart = () => {
    setChoices([]);
    setPhase('intro');
  };

  if (phase === 'intro') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
        <PottingHeader onBack={() => goBackOrReplace('/(tabs)/places')} label="Back to Places" />
        <View style={{ marginTop: 15 }}><GrowPlayScene variant="potting" height={250} state="notice" eyebrow="A TWO-MINUTE SORTING GAME" message="I’ll bring four everyday thoughts. You choose where each one rests." /></View>
        <Display size={29} color={MS.color.inkSoft} style={{ marginTop: 21 }}>Tidy the day</Display>
        <Body size={11.5} color={MS.color.muted} style={{ marginTop: 5 }}>Put each thought in one of three baskets. There is no right answer, and nothing is saved or scored.</Body>
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 18 }}>
          {BASKETS.map((basket) => <View key={basket.id} style={{ flex: 1, minHeight: 91, borderRadius: 18, backgroundColor: basket.color, padding: 10, alignItems: 'center', justifyContent: 'center' }}><Feather name={basket.icon} size={16} color={MS.color.forest} /><BodyBold size={10.5} color={MS.color.inkSoft} style={{ marginTop: 6 }}>{basket.label}</BodyBold><Body size={8.5} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 2 }}>{basket.detail}</Body></View>)}
        </View>
        <PillButton label="Start sorting" onPress={() => { setChoices([]); setPhase('sorting'); feedback.select(); }} style={{ marginTop: 20 }} />
      </ScrollView>
    );
  }

  if (phase === 'complete') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
        <PottingHeader onBack={restart} label="Back to introduction" />
        <View style={{ marginTop: 15 }}><GrowPlayScene variant="potting" height={235} state="celebrate" eyebrow="THE TABLE IS CLEAR" message="Everything has somewhere to rest—for now." /></View>
        <Display size={27} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 21 }}>A little more room for today.</Display>
        <Body size={11} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 6 }}>This was only a moment of sorting. You can change your mind whenever you need.</Body>
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 18 }}>{BASKETS.map((basket) => <View key={basket.id} style={{ flex: 1, minHeight: 94, borderRadius: 18, backgroundColor: basket.color, padding: 10, alignItems: 'center', justifyContent: 'center' }}><Feather name={basket.icon} size={16} color={MS.color.forest} /><Heading size={21} color={MS.color.inkSoft} style={{ marginTop: 4 }}>{counts[basket.id]}</Heading><BodyBold size={9.5} color={MS.color.forestMuted}>{basket.label}</BodyBold></View>)}</View>
        <PillButton label="Sort another four" onPress={() => { setChoices([]); setPhase('sorting'); }} style={{ marginTop: 20 }} />
        <PillButton label="Return to Places" onPress={() => goBackOrReplace('/(tabs)/places')} color={MS.color.surface} textColor={MS.color.forest} style={{ marginTop: 9 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 22 }} showsVerticalScrollIndicator={false}>
      <PottingHeader onBack={() => setPhase('intro')} label="Back to introduction" />
      <View style={{ marginTop: 13 }}><GrowPlayScene variant="potting" height={180} state="plant" message="Read the thought, then tap the basket that feels right today." /></View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 15 }}>{THOUGHTS.map((item, index) => <View key={item} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: index < choices.length ? MS.color.forest : index === choices.length ? MS.color.orange : `${MS.color.forest}16` }} />)}</View>
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <BodyBold size={9} color={MS.color.forestMuted} style={{ letterSpacing: 1.15 }}>THOUGHT {choices.length + 1} OF {THOUGHTS.length}</BodyBold>
        <View style={{ width: '100%', minHeight: 92, borderRadius: 23, backgroundColor: MS.color.surface, marginTop: 8, paddingHorizontal: 18, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' }}><Heading size={19} color={MS.color.inkSoft} style={{ textAlign: 'center' }}>{thought}</Heading></View>
        <CharacterText size={10.5} color={MS.color.forestMuted} style={{ marginTop: 9 }}>Where should this rest today?</CharacterText>
      </View>
      <View style={{ gap: 8, marginTop: 13 }}>{BASKETS.map((basket) => <Pressable key={basket.id} onPress={() => place(basket.id)} accessibilityRole="button" accessibilityLabel={`Put ${thought} in ${basket.label}`} style={({ pressed }) => ({ minHeight: 60, borderRadius: 19, backgroundColor: basket.color, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11, transform: [{ scale: pressed ? 0.985 : 1 }] })}><View style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: 'rgba(255,254,247,0.76)', alignItems: 'center', justifyContent: 'center' }}><Feather name={basket.icon} size={15} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={12} color={MS.color.inkSoft}>{basket.label}</BodyBold><Body size={9.5} color={MS.color.muted}>{basket.detail}</Body></View></Pressable>)}</View>
      {!!choices.length && <Pressable onPress={() => { setChoices((current) => current.slice(0, -1)); feedback.select(); }} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}><BodyBold size={10.5} color={MS.color.forestMuted}>Undo last choice</BodyBold></Pressable>}
    </ScrollView>
  );
}
