import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { useWellness } from '@/store/wellness';

function PlanField({ label, prompt, value, onChangeText, icon }: { label: string; prompt: string; value: string; onChangeText: (value: string) => void; icon: string }) {
  return (
    <View style={{ marginTop: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Feather name={icon as never} size={14} color={MS.color.forest} />
        <BodyBold size={11.5} color={MS.color.inkSoft}>{label}</BodyBold>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={prompt}
        placeholderTextColor={MS.color.faint}
        multiline
        accessibilityLabel={label}
        maxLength={2000}
        style={{ minHeight: 88, borderRadius: 18, backgroundColor: MS.color.surface, padding: 14, fontFamily: MS.font.body, fontSize: 14, lineHeight: 21, color: MS.color.inkSoft, textAlignVertical: 'top' }}
      />
    </View>
  );
}

export default function CarePlanScreen() {
  const insets = useSafeAreaInsets();
  const stored = useWellness((state) => state.carePlan);
  const setCarePlan = useWellness((state) => state.setCarePlan);
  const [plan, setPlan] = useState(stored);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof plan, value: string) => {
    setSaved(false);
    setPlan((current) => ({ ...current, [key]: value }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: MS.color.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 38 }}>
        <ScreenHeader eyebrow="Your own words" title="My support plan" description="A personal reminder of what you notice, what helps and who you can reach. Fill in only what feels useful." />

        <View style={{ marginTop: 22, borderRadius: MS.radius.xl, backgroundColor: MS.color.sageSoft, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="shield" size={16} color={MS.color.forest} /></View>
            <View style={{ flex: 1 }}><Heading size={15} color={MS.color.inkSoft}>For steadier and harder days</Heading><Body size={10.5} color={MS.color.forestMuted}>This is not a clinical safety plan or emergency service.</Body></View>
          </View>
        </View>

        <PlanField label="Signs I may be struggling" prompt="For example: avoiding messages, sleeping badly, feeling constantly on edge…" value={plan.warningSigns} onChangeText={(value) => update('warningSigns', value)} icon="activity" />
        <PlanField label="Things that can help me" prompt="Small actions, places, routines or words that have helped before…" value={plan.helps} onChangeText={(value) => update('helps', value)} icon="sun" />

        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, marginTop: 24 }}>A PERSON I CAN CONTACT</BodyBold>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 9 }}>
          <TextInput value={plan.supportName} onChangeText={(value) => update('supportName', value)} placeholder="Name" placeholderTextColor={MS.color.faint} accessibilityLabel="Support person's name" style={{ flex: 1, minHeight: 50, borderRadius: 17, backgroundColor: MS.color.surface, paddingHorizontal: 14, fontFamily: MS.font.body, fontSize: 14, color: MS.color.inkSoft }} />
          <TextInput value={plan.supportContact} onChangeText={(value) => update('supportContact', value)} placeholder="Phone or note" placeholderTextColor={MS.color.faint} accessibilityLabel="Support person's contact details" keyboardType="phone-pad" style={{ flex: 1, minHeight: 50, borderRadius: 17, backgroundColor: MS.color.surface, paddingHorizontal: 14, fontFamily: MS.font.body, fontSize: 14, color: MS.color.inkSoft }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14, paddingHorizontal: 4 }}><Feather name="hard-drive" size={12} color={MS.color.faint} /><Body size={10.5} color={MS.color.faint} style={{ flex: 1 }}>Encrypted on this device, never uploaded, and not monitored.</Body></View>

        <PillButton label={saved ? 'Support plan saved' : 'Save my support plan'} onPress={() => { setCarePlan(plan); setSaved(true); feedback.success(); }} style={{ marginTop: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
