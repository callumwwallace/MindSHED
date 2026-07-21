import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBramble } from '@/components/ms/animated-bramble';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { goBackOrReplace } from '@/lib/navigation';
import {
  SWEMWBS_COPYRIGHT,
  SWEMWBS_INTRODUCTION,
  SWEMWBS_ITEMS,
  SWEMWBS_RESPONSES,
  addCalendarDays,
  swemwbsSchedule,
} from '@/lib/swemwbs';
import { queuePilotWellbeingPulse } from '@/store/pilot-queue';
import { todayKey, useWellness } from '@/store/wellness';

type Phase = 'letter' | 'questions' | 'complete';

function LetterScene() {
  return (
    <View style={{ height: 218, borderRadius: 30, overflow: 'hidden', backgroundColor: '#9DBAA7', marginTop: 18 }}>
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#AEC9B2' }} />
      <View style={{ position: 'absolute', left: -34, right: -34, bottom: -75, height: 178, borderRadius: 100, backgroundColor: '#6F9476' }} />
      <View style={{ position: 'absolute', left: 26, top: 28, width: 214, height: 144, borderRadius: 10, backgroundColor: '#F8F0D5', transform: [{ rotate: '-3deg' }], shadowColor: '#29443A', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 5 }}>
        <View style={{ height: 30, borderBottomWidth: 1, borderBottomColor: '#C8B98F', justifyContent: 'center', paddingHorizontal: 14 }}><BodyBold size={8.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>A LETTER FOR YOU</BodyBold></View>
        <View style={{ padding: 14 }}><CharacterText size={15} color={MS.color.inkSoft}>A small chance to notice how the last two weeks have felt.</CharacterText><View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#C97C5D', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginTop: 9 }}><Feather name="feather" size={15} color={MS.color.surface} /></View></View>
      </View>
      <View style={{ position: 'absolute', right: 8, bottom: 6 }}><AnimatedBramble size={126} state="notice" mood="calm" /></View>
    </View>
  );
}

export default function PulseScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ preview?: string }>();
  const draft = useWellness((state) => state.pulseDraft);
  const wellbeingPulses = useWellness((state) => state.wellbeingPulses);
  const researchConsent = useWellness((state) => state.researchConsent);
  const savePulseDraft = useWellness((state) => state.savePulseDraft);
  const completeWellbeingPulse = useWellness((state) => state.completeWellbeingPulse);
  const initialResponses = useMemo<(number | null)[]>(
    () => draft?.responses.length === SWEMWBS_ITEMS.length ? [...draft.responses] : Array(SWEMWBS_ITEMS.length).fill(null),
    [draft],
  );
  const [phase, setPhase] = useState<Phase>(
    __DEV__ && params.preview === 'complete'
      ? 'complete'
      : __DEV__ && params.preview === 'questions'
        ? 'questions'
        : 'letter',
  );
  const [responses, setResponses] = useState(initialResponses);
  const [questionIndex, setQuestionIndex] = useState(() => {
    const firstEmpty = initialResponses.findIndex((response) => response === null);
    return firstEmpty === -1 ? 0 : firstEmpty;
  });
  const [nextDueDate, setNextDueDate] = useState<string>();
  const selected = responses[questionIndex];
  const uploadApproved = process.env.EXPO_PUBLIC_ENABLE_SWEMWBS_UPLOADS === 'true';
  const schedule = swemwbsSchedule(wellbeingPulses.map((pulse) => pulse.completedDate), todayKey());

  const close = () => {
    if (responses.some((response) => response !== null)) savePulseDraft(responses);
    goBackOrReplace('/(tabs)/insights');
  };

  const choose = (value: number) => {
    const next = responses.map((response, index) => index === questionIndex ? value : response);
    setResponses(next);
    savePulseDraft(next);
    feedback.select();
  };

  const next = () => {
    if (selected === null) return;
    if (questionIndex < SWEMWBS_ITEMS.length - 1) {
      setQuestionIndex((index) => index + 1);
      return;
    }
    if (responses.some((response) => response === null)) return;
    const completed = completeWellbeingPulse(responses as number[]);
    void queuePilotWellbeingPulse(completed);
    setNextDueDate(addCalendarDays(completed.completedDate, 14));
    setPhase('complete');
    feedback.success();
  };

  if (phase === 'complete') {
    return (
      <View style={{ flex: 1, backgroundColor: MS.color.cream, paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: insets.bottom + 22 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 106, height: 106, borderRadius: 53, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><AnimatedBramble size={122} state="celebrate" mood="happy" /></View>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.4, marginTop: 26 }}>LETTER SAFELY FILED</BodyBold>
          <Display size={29} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 8 }}>Thank you for checking in with the bigger picture</Display>
          <Body size={12.5} color={MS.color.muted} style={{ textAlign: 'center', lineHeight: 20, marginTop: 10, maxWidth: 330 }}>This is a wellbeing measure, not a diagnosis or judgement. Bramble celebrates the time you gave it—not the answers you chose.</Body>
          <View style={{ marginTop: 24, borderRadius: 20, backgroundColor: MS.color.surface, padding: 15, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="calendar" size={17} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1 }}>NEXT LETTER</BodyBold><Heading size={15} color={MS.color.inkSoft}>{nextDueDate ? new Date(`${nextDueDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'In two weeks'}</Heading></View></View>
        </View>
        <PillButton label="See your wellbeing picture" onPress={() => router.replace('/(tabs)/insights')} />
      </View>
    );
  }

  if (!schedule.due && !draft && !(__DEV__ && params.preview === 'questions')) {
    return (
      <View style={{ flex: 1, backgroundColor: MS.color.cream, paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: insets.bottom + 22 }}>
        <Pressable onPress={() => goBackOrReplace('/(tabs)/insights')} accessibilityRole="button" accessibilityLabel="Go back" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="arrow-left" size={18} color={MS.color.forest} /></Pressable>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 54 }}>
          <View style={{ width: 78, height: 78, borderRadius: 28, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="check-circle" size={29} color={MS.color.forest} /></View>
          <Display size={27} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 22 }}>This fortnight’s letter is already filed</Display>
          <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', lineHeight: 19, marginTop: 8, maxWidth: 320 }}>Your next wellbeing check will be ready on {new Date(`${schedule.nextDueDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}. There is nothing to keep up with before then.</Body>
        </View>
        <PillButton label="See your wellbeing picture" onPress={() => router.replace('/(tabs)/insights')} />
      </View>
    );
  }

  if (phase === 'letter') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close wellbeing pulse" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="x" size={18} color={MS.color.forest} /></Pressable><View style={{ flex: 1 }} /><View style={{ borderRadius: 999, backgroundColor: MS.color.sageSoft, paddingVertical: 7, paddingHorizontal: 11 }}><BodyBold size={9.5} color={MS.color.forestMuted}>ABOUT 2 MINUTES</BodyBold></View></View>
        <LetterScene />
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.4, marginTop: 25 }}>YOUR FORTNIGHTLY WELLBEING CHECK</BodyBold>
        <Display size={29} color={MS.color.inkSoft} style={{ marginTop: 6 }}>A view of the last two weeks</Display>
        <Body size={12.5} color={MS.color.muted} style={{ marginTop: 9, lineHeight: 20 }}>{SWEMWBS_INTRODUCTION}</Body>
        <View style={{ marginTop: 18, borderRadius: 20, backgroundColor: '#E7E9D5', padding: 15 }}><BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.1 }}>HOW THIS FITS YOUR PICTURE</BodyBold><View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}><View style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="sun" size={15} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={11.5} color={MS.color.inkSoft}>Daily check-ins are about today</BodyBold><Body size={10.5} color={MS.color.muted}>Mood, energy and pressure help you notice individual days.</Body></View></View><View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}><View style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="calendar" size={15} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={11.5} color={MS.color.inkSoft}>This check is about two weeks</BodyBold><Body size={10.5} color={MS.color.muted}>The seven SWEMWBS statements provide a separate, wider view.</Body></View></View></View>
        <View style={{ marginTop: 18, borderRadius: 20, backgroundColor: MS.color.surface, padding: 15, flexDirection: 'row', gap: 12 }}><View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="shield" size={17} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={11.5} color={MS.color.inkSoft}>Private by default</BodyBold><Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>{researchConsent && uploadApproved ? 'With your research consent, structured response scores are queued without your name or exact completion time.' : 'This assessment stays encrypted on this device. Research upload is currently switched off.'}</Body></View></View>
        {!!draft && <View style={{ marginTop: 10, borderRadius: 18, backgroundColor: '#F2E7C7', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Feather name="bookmark" size={16} color={MS.color.forestMuted} /><Body size={11} color={MS.color.inkSoft} style={{ flex: 1 }}>Your unfinished letter is ready to continue.</Body></View>}
        <PillButton label={draft ? 'Continue the letter' : 'Open the letter'} onPress={() => setPhase('questions')} style={{ marginTop: 18 }} />
        <Body size={8.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 15 }}>{SWEMWBS_COPYRIGHT}</Body>
      </ScrollView>
    );
  }

  const progress = (questionIndex + 1) / SWEMWBS_ITEMS.length;
  return (
    <View style={{ flex: 1, backgroundColor: '#E8DDC2', paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 10, flexDirection: 'row', alignItems: 'center' }}><Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Save and close wellbeing pulse" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.88)', alignItems: 'center', justifyContent: 'center' }}><Feather name="x" size={18} color={MS.color.forest} /></Pressable><View style={{ flex: 1, marginHorizontal: 14 }}><View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(49,91,69,0.14)', overflow: 'hidden' }}><View style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 3, backgroundColor: MS.color.forest }} /></View></View><BodyBold size={10} color={MS.color.forestMuted}>{questionIndex + 1} OF 7</BodyBold></View>
      <View style={{ flex: 1, marginTop: 14, marginHorizontal: 14, backgroundColor: '#FFFDF4', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 24, shadowColor: '#493F2D', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: -4 }, elevation: 5 }}>
        <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.25 }}>OVER THE LAST 2 WEEKS</BodyBold>
        <Heading size={24} color={MS.color.inkSoft} style={{ marginTop: 12, lineHeight: 32 }}>{SWEMWBS_ITEMS[questionIndex]}</Heading>
        <View accessibilityRole="radiogroup" style={{ marginTop: 24, gap: 9 }}>
          {SWEMWBS_RESPONSES.map((label, index) => {
            const value = index + 1;
            const active = selected === value;
            return <Pressable key={label} onPress={() => choose(value)} accessibilityRole="radio" accessibilityState={{ selected: active }} style={({ pressed }) => ({ minHeight: 52, borderRadius: 17, borderWidth: 1.5, borderColor: active ? MS.color.forest : `${MS.color.ink}16`, backgroundColor: active ? MS.color.sageSoft : MS.color.surface, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: active ? MS.color.forest : MS.color.faint, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>{active && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: MS.color.forest }} />}</View><BodyBold size={12.5} color={active ? MS.color.forest : MS.color.inkSoft}>{label}</BodyBold></Pressable>;
          })}
        </View>
        <View style={{ marginTop: 'auto', paddingBottom: insets.bottom + 18 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {questionIndex > 0 && <Pressable onPress={() => setQuestionIndex((index) => index - 1)} accessibilityRole="button" style={({ pressed }) => ({ width: 54, height: 54, borderRadius: 20, backgroundColor: MS.color.surfaceWarm, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}><Feather name="arrow-left" size={19} color={MS.color.forest} /></Pressable>}
            <Pressable onPress={next} disabled={selected === null} accessibilityRole="button" accessibilityState={{ disabled: selected === null }} style={({ pressed }) => ({ flex: 1, height: 54, borderRadius: 20, backgroundColor: selected === null ? '#D7D7C9' : MS.color.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: pressed ? 0.72 : 1 })}><BodyBold size={13} color={selected === null ? MS.color.faint : MS.color.surface}>{questionIndex === SWEMWBS_ITEMS.length - 1 ? 'File this letter' : 'Next statement'}</BodyBold><Feather name={questionIndex === SWEMWBS_ITEMS.length - 1 ? 'check' : 'arrow-right'} size={17} color={selected === null ? MS.color.faint : MS.color.surface} /></Pressable>
          </View>
          <Body size={8} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 10 }}>{SWEMWBS_COPYRIGHT}</Body>
        </View>
      </View>
    </View>
  );
}
