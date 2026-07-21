import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FiveSensesTrailScene } from '@/components/ms/immersive-place-scene';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { feedback } from '@/lib/haptics';
import { goBackOrReplace } from '@/lib/navigation';

const STEPS = [
  { count: 5, sense: 'things you can see', prompt: 'Let your eyes settle. Name five shapes, colours or objects.', place: 'The lookout' },
  { count: 4, sense: 'things you can feel', prompt: 'Notice four points of contact: feet, clothing, chair or air.', place: 'The mossy stone' },
  { count: 3, sense: 'things you can hear', prompt: 'Listen for three sounds, close by or further away.', place: 'The listening glade' },
  { count: 2, sense: 'things you can smell', prompt: 'Notice two scents—or remember two familiar ones.', place: 'The herb garden' },
  { count: 1, sense: 'thing you can taste', prompt: 'Notice one taste, or take a small sip of water.', place: 'The water rest' },
] as const;

export default function GroundingScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [targetStep, setTargetStep] = useState(0);
  const [travelling, setTravelling] = useState(false);
  const [complete, setComplete] = useState(false);
  const current = STEPS[step];

  useEffect(() => {
    if (!travelling) return;
    const timer = setTimeout(() => {
      setStep(targetStep);
      setTravelling(false);
    }, reduceMotion ? 40 : 1950);
    return () => clearTimeout(timer);
  }, [reduceMotion, targetStep, travelling]);

  const next = () => {
    feedback.soft();
    if (step === STEPS.length - 1) setComplete(true);
    else {
      setTargetStep(step + 1);
      setTravelling(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#B9CF99' }}>
      {!complete && <FiveSensesTrailScene step={targetStep} travelling={travelling} />}
      {complete && <FiveSensesTrailScene step={STEPS.length - 1} travelling={false} />}
      {!complete && <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(31,57,44,0.04)' }} />}
      <Pressable onPress={() => goBackOrReplace('/(tabs)/places')} accessibilityRole="button" accessibilityLabel="Back to Places" style={{ position: 'absolute', zIndex: 5, top: insets.top + 12, left: 18, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.9)', alignItems: 'center', justifyContent: 'center' }}><Feather name="arrow-left" size={18} color={MS.color.forest} /></Pressable>

      {!complete ? (
        <View style={{ flex: 1, paddingTop: insets.top + 15, paddingHorizontal: 18, paddingBottom: insets.bottom + 18 }}>
          <View pointerEvents="none" style={{ marginLeft: 58, marginRight: 2 }}>
            <BodyBold size={9.5} color="rgba(49,91,69,0.75)" style={{ letterSpacing: 1.2 }}>FIVE SENSES TRAIL</BodyBold>
            <Body size={10.5} color={MS.color.inkSoft} style={{ marginTop: 2 }}>{STEPS[targetStep].place}</Body>
            <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>{STEPS.map((item, index) => <View key={item.count} style={{ width: index === targetStep ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: index <= targetStep ? MS.color.forest : 'rgba(255,254,247,0.62)', borderWidth: 1, borderColor: 'rgba(49,91,69,0.12)' }} />)}</View>
          </View>

          <View pointerEvents="none" style={{ flex: 1 }} />

          {travelling ? (
            <View accessible accessibilityRole="text" accessibilityLiveRegion="polite" style={{ position: 'absolute', top: insets.top + 104, alignSelf: 'center' }}>
              <BodyBold size={9.5} color={MS.color.forestMuted}>ON THE WAY TO {STEPS[targetStep].place.toUpperCase()}</BodyBold>
            </View>
          ) : <View>
            <BodyBold size={9} color={MS.color.forestMuted} style={{ letterSpacing: 1.15 }}>CLEARING {step + 1} OF {STEPS.length} · {current.place.toUpperCase()}</BodyBold>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}><Display size={35} color={MS.color.forest}>{current.count}</Display><Heading size={20} color={MS.color.inkSoft} style={{ marginLeft: 8, flex: 1 }}>{current.sense}</Heading></View>
            <CharacterText size={12.5} color={MS.color.inkSoft} style={{ lineHeight: 17, marginTop: 5, maxWidth: 330 }}>{current.prompt}</CharacterText>
            <PillButton label={step === STEPS.length - 1 ? 'Finish here' : 'Continue'} onPress={next} style={{ marginTop: 13 }} />
            <Pressable onPress={() => router.push('/support')} accessibilityRole="button" style={{ alignItems: 'center', paddingTop: 11, paddingBottom: 1 }}><BodyBold size={9.5} color={MS.color.forestMuted}>See support options</BodyBold></Pressable>
          </View>}
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 18, paddingBottom: insets.bottom + 20 }}>
          <View>
            <BodyBold size={9} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>BACK IN THE ROOM</BodyBold>
            <Display size={28} color={MS.color.inkSoft} style={{ marginTop: 5 }}>You found this moment.</Display>
            <CharacterText size={12} color={MS.color.forestMuted} style={{ marginTop: 7, lineHeight: 17, maxWidth: 330 }}>Nothing else is required. Stay here for a moment, or return when you are ready.</CharacterText>
            <PillButton label="Return to the garden" onPress={() => goBackOrReplace('/')} style={{ marginTop: 16 }} />
            <Pressable onPress={() => router.push('/support')} accessibilityRole="button" style={{ alignItems: 'center', paddingTop: 11 }}><BodyBold size={9.5} color={MS.color.forest}>See support from real people</BodyBold></Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
