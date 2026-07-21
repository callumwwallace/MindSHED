import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { goBackOrReplace } from '@/lib/navigation';
import { requestResearchWithdrawal } from '@/lib/pilot-governance';
import { getPilotIdentity } from '@/lib/pilot-identity';

export default function WithdrawResearchScreen() {
  const insets = useSafeAreaInsets();
  const [confirmation, setConfirmation] = useState('');
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverPending, setServerPending] = useState(false);
  const ready = confirmation.trim().toUpperCase() === 'WITHDRAW';

  const confirmWithdrawal = async () => {
    setError('');
    setSubmitting(true);
    try {
      const identity = await getPilotIdentity();
      if (!identity) throw new Error('Pilot identity is missing');
      const result = await requestResearchWithdrawal(identity);
      setServerPending(result.status === 'pending');
      setComplete(true);
    } catch {
      setError('The withdrawal request could not be saved securely. Research uploads remain disabled; please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 38 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="Research is always optional" title="Withdraw from research" description="Stop all future pilot uploads without deleting your local wellbeing space." />
      {complete ? (
        <View style={{ marginTop: 72, alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="check" size={30} color={MS.color.forest} /></View>
          <Heading size={20} color={MS.color.inkSoft} style={{ marginTop: 20 }}>Research uploads stopped</Heading>
          <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 7 }}>{serverPending ? 'Uploads stopped immediately on this device. Encrypted withdrawal confirmation will retry before any other pilot operation when you are online.' : 'Your app and local journal still work. This pseudonymous pilot record cannot rejoin research; delete the record separately if that is what you want.'}</Body>
          <PillButton label="Return to privacy" onPress={() => goBackOrReplace('/privacy')} color={MS.color.surface} textColor={MS.color.forest} style={{ alignSelf: 'stretch', marginTop: 22 }} />
        </View>
      ) : (
        <>
          <View style={{ marginTop: 25, borderRadius: MS.radius.xl, backgroundColor: MS.color.sageSoft, padding: 18 }}>
            <Heading size={17} color={MS.color.inkSoft}>What this does</Heading>
            <Body size={11.5} color={MS.color.muted} style={{ marginTop: 7 }}>Future uploads stop immediately on this device, even offline. Server confirmation retries before any other pilot operation. Local reflections are unaffected. Treatment of already collected research data follows the signed participant information and study protocol.</Body>
          </View>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, marginTop: 26, marginBottom: 8 }}>TYPE WITHDRAW TO CONTINUE</BodyBold>
          <TextInput value={confirmation} onChangeText={(value) => { setConfirmation(value); setError(''); }} autoCapitalize="characters" accessibilityLabel="Type WITHDRAW to confirm" placeholder="WITHDRAW" placeholderTextColor={MS.color.faint} style={{ minHeight: 56, borderRadius: 18, backgroundColor: MS.color.surface, paddingHorizontal: 16, fontFamily: MS.font.bodyBold, fontSize: 15, color: MS.color.inkSoft }} />
          {!!error && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8DFD7', padding: 13 }}><Body size={10.5} color={MS.color.danger}>{error}</Body></View>}
          <PillButton label={submitting ? 'Securing withdrawal…' : 'Withdraw from research'} onPress={confirmWithdrawal} disabled={!ready || submitting} color={MS.color.danger} style={{ marginTop: 18 }} />
        </>
      )}
    </ScrollView>
  );
}
