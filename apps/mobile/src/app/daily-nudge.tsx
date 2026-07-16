import Feather from '@expo/vector-icons/Feather';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { SettingsRow } from '@/components/ms/settings-row';
import { Body, BodyBold, CharacterText, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { configureDailyNudge, type NudgeResult } from '@/lib/daily-nudge';
import { useWellness } from '@/store/wellness';

const TIMES = ['08:30', '12:30', '18:30', '21:00'];

export default function DailyNudgeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = useWellness((state) => state.nudgeEnabled);
  const time = useWellness((state) => state.nudgeTime);
  const setNudge = useWellness((state) => state.setNudge);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<NudgeResult>();

  const updateNudge = async (nextEnabled: boolean, nextTime = time) => {
    setSaving(true);
    setResult(undefined);
    try {
      const nextResult = await configureDailyNudge(nextEnabled, nextTime);
      setResult(nextResult);
      setNudge(nextResult === 'scheduled', nextTime);
      feedback.select();
    } catch {
      setResult('unavailable');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 38 }}>
      <ScreenHeader eyebrow="A gentle reminder" title="Daily nudge" description="One optional reminder in Bramble’s voice. No repeated prompts and no guilt." />
      <View style={{ marginTop: 24, backgroundColor: MS.color.surface, borderRadius: MS.radius.xl, paddingHorizontal: 15 }}>
        <SettingsRow icon="bell" title="Daily nudge" detail={saving ? 'Updating system reminder…' : enabled ? `Set for ${time}` : 'Currently off'} value={enabled} onValueChange={(value) => { void updateNudge(value); }} last />
      </View>

      <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, marginTop: 26, marginBottom: 9 }}>CHOOSE A TIME</BodyBold>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {TIMES.map((item) => {
          const selected = item === time;
          return (
            <Pressable
              key={item}
              onPress={() => { void updateNudge(true, item); }}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => ({ minWidth: '47%', flexGrow: 1, borderRadius: 18, backgroundColor: selected ? MS.color.forest : MS.color.surface, paddingVertical: 15, paddingHorizontal: 16, opacity: pressed ? 0.72 : 1 })}>
              <BodyBold size={14} color={selected ? MS.color.surface : MS.color.inkSoft}>{item}</BodyBold>
              <Body size={10.5} color={selected ? 'rgba(255,254,247,0.7)' : MS.color.muted}>{item < '12:00' ? 'Morning' : item < '17:00' ? 'Midday' : item < '20:00' ? 'Evening' : 'Later'}</Body>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 24, borderRadius: MS.radius.xl, backgroundColor: MS.color.sageSoft, padding: 17 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Feather name="message-circle" size={16} color={MS.color.forest} />
          <Heading size={15} color={MS.color.forest}>A preview</Heading>
        </View>
        <CharacterText size={14} color={MS.color.inkSoft} style={{ marginTop: 10 }}>“I’m pottering in the garden if a small check-in would help.”</CharacterText>
      </View>
      {result === 'denied' && <View accessibilityRole="alert" style={{ marginTop: 16, borderRadius: 18, backgroundColor: '#F8E8D7', padding: 14 }}><BodyBold size={11} color={MS.color.inkSoft}>Notifications are off in device settings</BodyBold><Body size={10.5} color={MS.color.muted} style={{ marginTop: 3 }}>MindSHED will stay quiet until you allow notifications.</Body><Pressable onPress={() => void Linking.openSettings()} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginTop: 9, paddingVertical: 5 }}><BodyBold size={10.5} color={MS.color.forest}>Open device settings</BodyBold></Pressable></View>}
      {result === 'scheduled' && <Body size={10.5} color={MS.color.forestMuted} style={{ textAlign: 'center', marginTop: 18 }}>Scheduled on this device. MindSHED does not need a push token or account.</Body>}
      {result === 'unavailable' && <Body accessibilityRole="alert" size={10.5} color={MS.color.danger} style={{ textAlign: 'center', marginTop: 18 }}>The reminder could not be scheduled on this device. Your previous setting was left off.</Body>}
    </ScrollView>
  );
}
