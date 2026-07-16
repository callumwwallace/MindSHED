import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBramble, type CompanionState } from '@/components/ms/animated-bramble';
import { BrambleDialogue } from '@/components/ms/bramble-dialogue';
import { Garden } from '@/components/ms/garden';
import { MoodPicker } from '@/components/ms/mood-picker';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { TapSlider } from '@/components/ms/tap-slider';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { getGardenRestState } from '@/lib/garden-progress';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { getCareSuggestion } from '@/lib/wellbeing-guidance';
import { queuePilotCheckin } from '@/store/pilot-queue';
import { useTodayCheckin, useWellness } from '@/store/wellness';

function valueLabel(value: number, low: string, middle: string, high: string) {
  return value <= 3 ? low : value >= 7 ? high : middle;
}

const STEP_LABELS = ['Mood', 'Details', 'Optional', 'Done'] as const;
const NEEDS = ['Calm', 'Grounding', 'Rest', 'Connection', 'Focus', 'Nothing yet'] as const;

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const params = useLocalSearchParams<{ mood?: string }>();
  const existing = useTodayCheckin();
  const submitCheckin = useWellness((state) => state.submitCheckin);
  const gardenGrowth = useWellness((state) => state.gardenGrowth);
  const checkins = useWellness((state) => state.checkins);
  const gardenRest = getGardenRestState(checkins.map((item) => item.date));
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const parameterMood = params.mood ? Number(params.mood) : undefined;
  const [mood, setMood] = useState<number | undefined>(parameterMood && parameterMood >= 1 && parameterMood <= 5 ? parameterMood : existing?.mood);
  const [energy, setEnergy] = useState(existing?.energy ?? 5);
  const [stress, setStress] = useState(existing?.stress ?? 5);
  const [note, setNote] = useState(existing?.note ?? '');
  const [needs, setNeeds] = useState<string[]>(existing?.needs ?? []);
  const [companionState, setCompanionState] = useState<CompanionState>('listen');
  const [speechVersion, setSpeechVersion] = useState(0);
  const compact = height <= 620;

  const brambleMood = mood === undefined || mood <= 3 ? 'calm' : 'happy';
  const speech =
    step === 0
      ? mood
        ? 'I see you. No need to make it sound better.'
        : 'Take your time. Pick the closest one.'
      : step === 1
        ? 'Just notice what is there. Nothing to fix.'
        : step === 2
          ? 'This part is only for you.'
          : 'We can make the next step smaller.';

  const suggestion = getCareSuggestion(mood ? { date: '', mood, energy, stress, note, needs } : undefined);

  const moveTo = (nextStep: number) => {
    feedback.select();
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep(nextStep);
    setCompanionState('listen');
    setSpeechVersion((version) => version + 1);
  };

  const selectMood = (nextMood: number) => {
    feedback.select();
    setMood(nextMood);
    setCompanionState('notice');
    setSpeechVersion((version) => version + 1);
    setTimeout(() => setCompanionState('listen'), 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.cream }}>
      <View style={{ height: compact ? 206 : 258, backgroundColor: MS.color.skyPale, overflow: 'hidden' }}>
        <Garden growth={gardenGrowth} mode="home" restState={gardenRest.id} />
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(238,245,227,0.2)' }} />

        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close check-in"
          style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 16,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255, 254, 247, 0.82)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Feather name="x" size={17} color={MS.color.forest} />
        </Pressable>

        <View style={{ position: 'absolute', top: insets.top + 10, left: 198, right: 18, alignItems: 'center', backgroundColor: 'rgba(255,254,247,0.82)', borderRadius: 17, paddingVertical: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(49,91,69,0.1)' }}>
          <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.4 }}>HOW YOU FEEL TODAY</BodyBold>
          <Heading size={17} color={MS.color.inkSoft}>Daily check-in</Heading>
        </View>

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: compact ? 8 : 20, alignItems: 'center' }}>
          <AnimatedBramble
            size={126}
            mood={brambleMood}
            state={mood === 1 && companionState === 'listen' ? 'curl' : companionState}
            onPress={() => {
              setCompanionState('greet');
              setSpeechVersion((version) => version + 1);
              setTimeout(() => setCompanionState('listen'), 1000);
            }}
          />
          <BrambleDialogue message={speech} messageVersion={speechVersion} width={154} tailSide="left" style={{ position: 'absolute', right: 22, bottom: 52 }} />
        </View>
      </View>

      <ScrollView
        style={{
          flex: 1,
          marginTop: compact ? 0 : -22,
          backgroundColor: MS.color.cream,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          borderTopWidth: 1,
          borderColor: `${MS.color.ink}12`,
        }}
        contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 28, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          {STEP_LABELS.map((label, index) => (
            <View key={label} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: index === step ? 24 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: index <= step ? MS.color.forest : `${MS.color.forest}22`,
                }}
              />
              <BodyBold size={8.5} color={index === step ? MS.color.forest : MS.color.faint}>{label}</BodyBold>
            </View>
          ))}
        </View>

        {step === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 28 }}>
            <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, textAlign: 'center' }}>RIGHT NOW</BodyBold>
            <Heading size={23} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 3 }}>How does today feel?</Heading>
            <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 5, marginBottom: 18 }}>
              Choose what feels closest. It does not need to be exact.
            </Body>
            <MoodPicker value={mood} onChange={selectMood} showLabels />
            <PillButton
              label={mood ? 'Continue' : 'Choose a feeling'}
              disabled={!mood}
              onPress={() => mood && moveTo(1)}
              style={{ marginTop: 26 }}
            />
          </View>
        )}

        {step === 1 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 20 }}>
            <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, textAlign: 'center' }}>YOUR CAPACITY</BodyBold>
            <Heading size={23} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 3 }}>Add two useful details</Heading>
            <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 5, marginBottom: 18 }}>
              These sit beside your mood in Insights. They are never combined into a hidden score.
            </Body>

            <View style={{ backgroundColor: MS.color.surface, borderRadius: MS.radius.xl, padding: 17, gap: 24 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: MS.color.mintSoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Feather name="battery-charging" size={15} color={MS.color.forest} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <BodyBold size={13}>Energy</BodyBold>
                    <Body size={10.5} color={MS.color.muted}>How much capacity do you have?</Body>
                  </View>
                  <BodyBold size={10.5} color={MS.color.forest}>{valueLabel(energy, 'Low', 'Steady', 'High')}</BodyBold>
                </View>
                <TapSlider label="Energy" value={energy} onChange={setEnergy} fillColor={MS.color.mint} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 }}>
                  <Body size={9.5} color={MS.color.faint}>Running low</Body>
                  <Body size={9.5} color={MS.color.faint}>Full of energy</Body>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: `${MS.color.ink}0F` }} />

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: '#FBE7B2', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Feather name="activity" size={15} color={MS.color.inkSoft} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <BodyBold size={13}>Pressure</BodyBold>
                    <Body size={10.5} color={MS.color.muted}>How much tension is around?</Body>
                  </View>
                  <BodyBold size={10.5} color={MS.color.inkSoft}>{valueLabel(stress, 'Calm', 'Present', 'Heavy')}</BodyBold>
                </View>
                <TapSlider label="Pressure" value={stress} onChange={setStress} fillColor={MS.color.yellow} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 }}>
                  <Body size={9.5} color={MS.color.faint}>At ease</Body>
                  <Body size={9.5} color={MS.color.faint}>Under pressure</Body>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable onPress={() => moveTo(0)} accessibilityRole="button" accessibilityLabel="Back to feeling" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="arrow-left" size={17} color={MS.color.forest} />
              </Pressable>
              <PillButton label="Continue" onPress={() => moveTo(2)} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, textAlign: 'center' }}>OPTIONAL REFLECTION</BodyBold>
            <Heading size={23} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 3 }}>Anything to leave here?</Heading>
            <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 5, marginBottom: 18 }}>
              A sentence, a few words, or nothing at all.
            </Body>

            <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.1, marginBottom: 9 }}>WHAT MIGHT HELP? · OPTIONAL</BodyBold>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {NEEDS.map((item) => {
                const selected = needs.includes(item);
                return <Pressable key={item} onPress={() => setNeeds((current) => selected ? current.filter((value) => value !== item) : item === 'Nothing yet' ? ['Nothing yet'] : [...current.filter((value) => value !== 'Nothing yet'), item])} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} style={{ borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: selected ? MS.color.forest : MS.color.surface }}><BodyBold size={10.5} color={selected ? MS.color.surface : MS.color.forest}>{item}</BodyBold></Pressable>;
              })}
            </View>

            <TextInput
              value={note}
              onChangeText={setNote}
              accessibilityLabel="Optional check-in note"
              placeholder="Today felt…"
              placeholderTextColor={MS.color.faint}
              multiline
              maxLength={500}
              autoFocus={false}
              style={{
                minHeight: 148,
                borderRadius: MS.radius.xl,
                backgroundColor: MS.color.surface,
                padding: 16,
                fontFamily: MS.font.body,
                fontSize: 14,
                lineHeight: 21,
                color: MS.color.ink,
                textAlignVertical: 'top',
              }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 10 }}>
              <Feather name="hard-drive" size={10} color={MS.color.faint} />
              <Body size={10} color={MS.color.faint}>Encrypted on this device · never included in pilot uploads</Body>
            </View>

            {(mood === 1 || stress >= 9) && (
              <Pressable
                onPress={() => router.push('/support')}
                accessibilityRole="button"
                accessibilityLabel="See confidential and urgent support options from real people"
                style={{ marginTop: 18, borderRadius: 18, backgroundColor: '#F8DFD7', padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(255,254,247,0.72)', alignItems: 'center', justifyContent: 'center' }}><Feather name="life-buoy" size={16} color={MS.color.danger} /></View>
                <View style={{ flex: 1 }}><BodyBold size={12.5} color={MS.color.inkSoft}>Would real-person support help?</BodyBold><Body size={10.5} color={MS.color.muted}>You can see confidential and urgent options now.</Body></View>
                <Feather name="chevron-right" size={16} color={MS.color.forestMuted} />
              </Pressable>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              <Pressable onPress={() => moveTo(1)} accessibilityRole="button" accessibilityLabel="Back to capacity" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="arrow-left" size={17} color={MS.color.forest} />
              </Pressable>
              <PillButton
                label="See what might help"
                onPress={() => {
                  if (!mood) return;
                  feedback.success();
                  submitCheckin({ mood, energy, stress, note: note.trim() || undefined, needs });
                  void queuePilotCheckin({ mood, energy, stress, note: note.trim() || undefined, needs });
                  if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setCompanionState('celebrate');
                  setStep(3);
                }}
                style={{ flex: 1 }}
                size={13}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 20 }}>
            <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, textAlign: 'center' }}>BASED ON WHAT YOU SHARED</BodyBold>
            <Heading size={23} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 3 }}>Meet today where it is</Heading>
            <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 6 }}>This is a gentle suggestion, not a judgement or diagnosis. Choose it, ignore it, or come back later.</Body>

            <View style={{ marginTop: 22, borderRadius: MS.radius.xl, backgroundColor: suggestion.tone, padding: 18 }}>
              <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,254,247,0.72)', alignItems: 'center', justifyContent: 'center' }}><Feather name={suggestion.icon as never} size={18} color={MS.color.forest} /></View>
              <Heading size={19} color={MS.color.inkSoft} style={{ marginTop: 18 }}>{suggestion.title}</Heading>
              <Body size={11.5} color={MS.color.muted} style={{ marginTop: 5 }}>{suggestion.detail}</Body>
              <Pressable onPress={() => router.replace(suggestion.route)} accessibilityRole="button" style={({ pressed }) => ({ alignSelf: 'flex-start', marginTop: 16, borderRadius: 999, backgroundColor: MS.color.forest, paddingVertical: 10, paddingHorizontal: 15, opacity: pressed ? 0.7 : 1 })}><BodyBold size={11} color={MS.color.surface}>{suggestion.action}</BodyBold></Pressable>
            </View>

            {(mood === 1 || stress >= 9) && <Pressable onPress={() => router.replace('/support')} accessibilityRole="button" accessibilityLabel="See confidential and urgent UK support options from real people" style={{ marginTop: 12, borderRadius: 18, backgroundColor: '#F8DFD7', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 }}><Feather name="life-buoy" size={17} color={MS.color.danger} /><View style={{ flex: 1 }}><BodyBold size={11.5} color={MS.color.inkSoft}>Support from a real person is here too</BodyBold><Body size={10.5} color={MS.color.muted}>Confidential and urgent UK options.</Body></View><Feather name="chevron-right" size={16} color={MS.color.forestMuted} /></Pressable>}

            <PillButton label="See this in your wellbeing picture" onPress={() => router.replace('/(tabs)/insights')} style={{ marginTop: 18 }} />
            <PillButton label="Return to the garden" onPress={() => router.back()} color={MS.color.surface} textColor={MS.color.forest} style={{ marginTop: 18 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
