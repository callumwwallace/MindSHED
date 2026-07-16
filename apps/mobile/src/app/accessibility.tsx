import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { SettingsRow } from '@/components/ms/settings-row';
import { Body } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

export default function AccessibilityScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useWellness((state) => state.reduceMotion);
  const hapticsEnabled = useWellness((state) => state.hapticsEnabled);
  const setReduceMotion = useWellness((state) => state.setReduceMotion);
  const setHapticsEnabled = useWellness((state) => state.setHapticsEnabled);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 38 }}>
      <ScreenHeader eyebrow="Comfort" title="Accessibility" description="Make the garden calmer, quieter or easier to follow." />
      <View style={{ marginTop: 24, backgroundColor: MS.color.surface, borderRadius: MS.radius.xl, paddingHorizontal: 15 }}>
        <SettingsRow icon="minimize-2" title="Reduce motion" detail="Hold Bramble still and remove large scene transitions" value={reduceMotion} onValueChange={setReduceMotion} />
        <SettingsRow icon="smartphone" title="Haptic feedback" detail="Soft confirmation taps for actions" value={hapticsEnabled} onValueChange={setHapticsEnabled} last />
      </View>
      <View style={{ marginTop: 20, borderRadius: 18, backgroundColor: MS.color.sageSoft, padding: 15 }}>
        <Body size={11.5} color={MS.color.forestMuted}>MindSHED also follows your device text size, Reduce Motion and screen-reader settings. Breathing and grounding always keep their instructions visible.</Body>
      </View>
    </ScrollView>
  );
}
