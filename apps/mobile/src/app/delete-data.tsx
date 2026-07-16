import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { clearPilotIdentity, getPilotIdentity } from '@/lib/pilot-identity';
import { clearDailyNudge } from '@/lib/daily-nudge';
import { trpc } from '@/lib/trpc';
import { usePilotQueue } from '@/store/pilot-queue';
import { useWellness } from '@/store/wellness';

export default function DeleteDataScreen() {
  const insets = useSafeAreaInsets();
  const [confirmation, setConfirmation] = useState('');
  const [complete, setComplete] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState('');
  const deletePilotData = trpc.pilot.deleteData.useMutation();
  const clearLocalWellnessData = useWellness((state) => state.clearLocalWellnessData);
  const ready = confirmation.trim().toUpperCase() === 'DELETE';

  const deleteData = async () => {
    setError('');
    try {
      const identity = await getPilotIdentity();
      if (identity) {
        const result = await deletePilotData.mutateAsync({
          participantId: identity.participantId,
          deletionSecret: identity.deletionSecret,
        });
        setReceipt(result.receipt);
      }
      clearLocalWellnessData();
      usePilotQueue.getState().clear();
      await clearDailyNudge().catch(() => undefined);
      await clearPilotIdentity();
      setComplete(true);
    } catch {
      setError('We could not confirm deletion with the pilot server. Your local data and deletion key have been kept so you can try again safely.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 38 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="You stay in control" title="Delete your data" description="Delete private data from this device and, when enrolled, the linked pseudonymous pilot record." />
      {complete ? (
        <View style={{ marginTop: 72, alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="check" size={30} color={MS.color.forest} /></View>
          <Heading size={20} color={MS.color.inkSoft} style={{ marginTop: 20 }}>Your data was deleted</Heading>
          <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 7 }}>Check-ins, wellbeing checks, phone-health summaries, reflections, plans, support notes and garden progress were removed from this device. Any linked pilot record was deleted before its key was removed.</Body>
          {!!receipt && <Body size={9.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 12 }}>Deletion receipt {receipt}</Body>}
          <PillButton label="Restart MindSHED" onPress={() => router.replace('/onboarding')} color={MS.color.surface} textColor={MS.color.forest} style={{ alignSelf: 'stretch', marginTop: 22 }} />
        </View>
      ) : (
        <>
          <View style={{ marginTop: 25, borderRadius: MS.radius.xl, backgroundColor: '#F8DFD7', padding: 18 }}>
            <Heading size={17} color={MS.color.danger}>This cannot be undone</Heading>
            <Body size={11.5} color={MS.color.inkSoft} style={{ marginTop: 7 }}>Your local wellbeing content and pseudonymous pilot events will be permanently removed. If the server cannot confirm deletion, the app keeps the deletion key and leaves local data in place.</Body>
          </View>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, marginTop: 26, marginBottom: 8 }}>TYPE DELETE TO CONTINUE</BodyBold>
          <TextInput value={confirmation} onChangeText={(value) => { setConfirmation(value); setError(''); }} autoCapitalize="characters" accessibilityLabel="Type DELETE to confirm" placeholder="DELETE" placeholderTextColor={MS.color.faint} style={{ minHeight: 56, borderRadius: 18, backgroundColor: MS.color.surface, paddingHorizontal: 16, fontFamily: MS.font.bodyBold, fontSize: 15, color: MS.color.inkSoft }} />
          {!!error && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8DFD7', padding: 13 }}><Body size={10.5} color={MS.color.danger}>{error}</Body></View>}
          <PillButton label={deletePilotData.isPending ? 'Confirming deletion…' : 'Permanently delete my data'} onPress={deleteData} disabled={!ready || deletePilotData.isPending} color={MS.color.danger} style={{ marginTop: 18 }} />
        </>
      )}
    </ScrollView>
  );
}
