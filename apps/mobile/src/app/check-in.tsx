import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse } from 'react-native-svg';

import { Bramble } from '@/components/ms/bramble';
import { MoodPicker } from '@/components/ms/mood-picker';
import { PillButton } from '@/components/ms/pill-button';
import { Body, Heading } from '@/components/ms/text';
import { TapSlider } from '@/components/ms/tap-slider';
import { MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mood?: string }>();
  const submitCheckin = useWellness((s) => s.submitCheckin);

  const [mood, setMood] = useState<number | undefined>(
    params.mood ? Number(params.mood) : undefined,
  );
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [note, setNote] = useState('');

  const brambleMood = mood === undefined ? 'calm' : mood >= 4 ? 'happy' : 'calm';

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.cream }}>
      <View
        style={{
          backgroundColor: MS.color.sky,
          borderBottomWidth: MS.border,
          borderColor: MS.color.ink,
          alignItems: 'center',
          paddingTop: insets.top + 8,
        }}>
        <Svg
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          viewBox="0 0 340 160"
          preserveAspectRatio="xMidYMid slice">
          <Circle cx="244" cy="58" r="18" fill={MS.color.yellow} stroke={MS.color.ink} strokeWidth="2.5" />
          <Ellipse cx="58" cy="46" rx="24" ry="10" fill={MS.color.white} stroke={MS.color.ink} strokeWidth="2" />
          <Ellipse cx="80" cy="39" rx="16" ry="8" fill={MS.color.white} stroke={MS.color.ink} strokeWidth="2" />
        </Svg>
        <Bramble size={132} mood={brambleMood} />
        <Pressable
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 14,
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            backgroundColor: MS.color.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Feather name="x" size={15} color={MS.color.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <Heading size={16} style={{ marginBottom: 10, textAlign: 'center' }}>
          How are you feeling?
        </Heading>
        <MoodPicker value={mood} onChange={setMood} />
        <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 10 }}>
          Bramble feels it with you — pick honestly, he doesn&apos;t judge.
        </Body>

        <Heading size={14} style={{ marginTop: 18, marginBottom: 8 }}>
          Energy
        </Heading>
        <TapSlider value={energy} onChange={setEnergy} fillColor={MS.color.mint} />

        <Heading size={14} style={{ marginTop: 18, marginBottom: 8 }}>
          Stress
        </Heading>
        <TapSlider value={stress} onChange={setStress} fillColor={MS.color.yellow} />

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Anything on your mind? (optional)"
          placeholderTextColor={MS.color.faint}
          multiline
          style={{
            marginTop: 20,
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            borderRadius: MS.radius.lg,
            backgroundColor: MS.color.white,
            padding: 12,
            minHeight: 64,
            fontFamily: MS.font.body,
            fontSize: 14,
            color: MS.color.ink,
          }}
        />

        <PillButton
          label={mood === undefined ? 'Pick a mood first' : 'Done — see what blooms'}
          color={mood === undefined ? MS.color.white : MS.color.mint}
          onPress={() => {
            if (mood !== undefined) {
              submitCheckin({ mood, energy, stress, note: note || undefined });
              router.back();
            }
          }}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </View>
  );
}
