import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { requestLocalAndPilotDeletion } from '@/lib/pilot-governance';
import { getPilotIdentity } from '@/lib/pilot-identity';

export default function DeleteDataScreen() {
  const insets = useSafeAreaInsets();
  const [confirmation, setConfirmation] = useState('');
  const [complete, setComplete] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverPending, setServerPending] = useState(false);
  const ready = confirmation.trim().toUpperCase() === 'DELETE';

  const deleteData = async () => {
    setError('');
    setSubmitting(true);
    try {
      const identity = await getPilotIdentity();
      const result = await requestLocalAndPilotDeletion(identity);
      setReceipt(result.receipt ?? '');
      setServerPending(result.status === 'pending');
      setComplete(true);
    } catch {
      setError('The local deletion could not be completed securely. Please try again before closing the app.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 38 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="You stay in control" title="Delete your data" description="Delete private data from this device and, when enrolled, the linked pseudonymous pilot record." />
      {complete ? (
        <View style={{ marginTop: 72, alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="check" size={30} color={MS.color.forest} /></View>
          <Heading size={20} color={MS.color.inkSoft} style={{ marginTop: 20 }}>Your data was deleted</Heading>
          <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 7 }}>{serverPending ? 'All private wellbeing content was removed from this device. A minimal encrypted deletion instruction remains in SecureStore and will retry until the linked pilot record is confirmed absent.' : 'Check-ins, wellbeing checks, phone-health summaries, reflections, plans, support notes and garden progress were removed from this device. Any linked pilot record is confirmed absent.'}</Body>
          {!!receipt && <Body size={9.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 12 }}>Deletion receipt {receipt}</Body>}
          <PillButton label="Restart MindSHED" onPress={() => router.replace('/onboarding')} color={MS.color.surface} textColor={MS.color.forest} style={{ alignSelf: 'stretch', marginTop: 22 }} />
        </View>
      ) : (
        <>
          <View style={{ marginTop: 25, borderRadius: MS.radius.xl, backgroundColor: '#F8DFD7', padding: 18 }}>
            <Heading size={17} color={MS.color.danger}>This cannot be undone</Heading>
            <Body size={11.5} color={MS.color.inkSoft} style={{ marginTop: 7 }}>Your local wellbeing content is removed immediately, including when offline. If the pilot server is unavailable, only a minimal encrypted deletion instruction remains so server deletion can retry.</Body>
          </View>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, marginTop: 26, marginBottom: 8 }}>TYPE DELETE TO CONTINUE</BodyBold>
          <TextInput value={confirmation} onChangeText={(value) => { setConfirmation(value); setError(''); }} autoCapitalize="characters" accessibilityLabel="Type DELETE to confirm" placeholder="DELETE" placeholderTextColor={MS.color.faint} style={{ minHeight: 56, borderRadius: 18, backgroundColor: MS.color.surface, paddingHorizontal: 16, fontFamily: MS.font.bodyBold, fontSize: 15, color: MS.color.inkSoft }} />
          {!!error && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8DFD7', padding: 13 }}><Body size={10.5} color={MS.color.danger}>{error}</Body></View>}
          <PillButton label={submitting ? 'Deleting securely…' : 'Permanently delete my data'} onPress={deleteData} disabled={!ready || submitting} color={MS.color.danger} style={{ marginTop: 18 }} />
        </>
      )}
    </ScrollView>
  );
}
