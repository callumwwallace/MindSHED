import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBramble } from '@/components/ms/animated-bramble';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { goBackOrReplace } from '@/lib/navigation';

const STEPS = [
  { count: 5, sense: 'things you can see', prompt: 'Let your eyes settle. Name five shapes, colours or objects.', icon: 'eye', color: '#DDECEF' },
  { count: 4, sense: 'things you can feel', prompt: 'Notice four points of contact: feet, clothing, chair or air.', icon: 'move', color: MS.color.sageSoft },
  { count: 3, sense: 'things you can hear', prompt: 'Listen for three sounds, close by or further away.', icon: 'volume-2', color: '#F6E8C3' },
  { count: 2, sense: 'things you can smell', prompt: 'Notice two scents—or remember two familiar ones.', icon: 'wind', color: '#F2D7B8' },
  { count: 1, sense: 'thing you can taste', prompt: 'Notice one taste, or take a small sip of water.', icon: 'coffee', color: '#E6E9D2' },
] as const;

export default function GroundingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const current = STEPS[step];

  const next = () => {
    feedback.soft();
    if (step === STEPS.length - 1) setComplete(true);
    else setStep((value) => value + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: complete ? '#DCE8E2' : current.color }}>
      <Pressable onPress={() => goBackOrReplace('/')} accessibilityRole="button" accessibilityLabel="Close grounding exercise" style={{ position: 'absolute', zIndex: 2, top: insets.top + 12, left: 18, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.78)', alignItems: 'center', justifyContent: 'center' }}><Feather name="x" size={18} color={MS.color.forest} /></Pressable>

      {!complete ? (
        <View style={{ flex: 1, paddingTop: insets.top + 82, paddingHorizontal: 22, paddingBottom: insets.bottom + 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3 }}>COME BACK TO THE ROOM</BodyBold><BodyBold size={10} color={MS.color.forestMuted}>{step + 1} / {STEPS.length}</BodyBold></View>
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 12 }}>{STEPS.map((item, index) => <View key={item.count} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: index <= step ? MS.color.forest : 'rgba(49,91,69,0.16)' }} />)}</View>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 246, height: 112, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}><View style={{ width: 86, height: 86, borderRadius: 43, backgroundColor: 'rgba(255,254,247,0.68)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Feather name={current.icon as never} size={30} color={MS.color.forest} /></View><AnimatedBramble size={106} mood="calm" state={step === 1 || step === 2 ? 'listen' : 'notice'} /></View>
            <Display size={58} color={MS.color.forest} style={{ marginTop: 22 }}>{current.count}</Display>
            <Heading size={23} color={MS.color.inkSoft} style={{ textAlign: 'center' }}>{current.sense}</Heading>
            <Body size={13} color={MS.color.muted} style={{ textAlign: 'center', maxWidth: 310, marginTop: 10 }}>{current.prompt}</Body>
            <Body size={11} color={MS.color.forestMuted} style={{ textAlign: 'center', marginTop: 20 }}>There is no timer. Continue when you are ready.</Body>
          </View>

          <PillButton label={step === STEPS.length - 1 ? 'Finish gently' : 'I noticed them'} onPress={next} />
          <Pressable onPress={() => router.push('/support')} accessibilityRole="button" style={{ alignItems: 'center', padding: 13 }}><BodyBold size={11} color={MS.color.forestMuted}>I would rather see support options</BodyBold></Pressable>
        </View>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingBottom: insets.bottom + 20 }}>
          <AnimatedBramble size={150} mood="calm" state="notice" />
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3, marginTop: 26 }}>BACK IN THE ROOM</BodyBold>
          <Display size={29} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 6 }}>You found this moment.</Display>
          <CharacterText size={13} color={MS.color.forestMuted} style={{ textAlign: 'center', marginTop: 10 }}>Nothing else is required. You can stay, leave, or ask for support.</CharacterText>
          <PillButton label="Return to the garden" onPress={() => goBackOrReplace('/')} style={{ alignSelf: 'stretch', marginTop: 28 }} />
          <Pressable onPress={() => router.push('/support')} accessibilityRole="button" style={{ padding: 14 }}><BodyBold size={11.5} color={MS.color.forest}>See support from real people</BodyBold></Pressable>
        </View>
      )}
    </View>
  );
}
