import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { SettingsRow } from '@/components/ms/settings-row';
import { SettingsSection } from '@/components/ms/settings-section';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const noticeOnly = notice === '1';
  const researchConsent = useWellness((state) => state.researchConsent);
  const researchConsentUpdatedAt = useWellness((state) => state.researchConsentUpdatedAt);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 40 }}>
      <ScreenHeader eyebrow="Clear by design" title="Privacy and data" description="A plain-language view of what this build keeps locally and what the optional pilot can receive." />
      <View style={{ marginTop: 24, borderRadius: MS.radius.xl, backgroundColor: MS.color.forest, padding: 18 }}>
        <BodyBold size={10} color="rgba(255,254,247,0.7)" style={{ letterSpacing: 1.2 }}>PRIVATE BY DEFAULT</BodyBold>
        <Heading size={18} color={MS.color.surface} style={{ marginTop: 5 }}>Encrypted on this device</Heading>
        <Body size={11.5} color="rgba(255,254,247,0.75)" style={{ marginTop: 5 }}>Native builds keep check-ins, wellbeing checks, optional daily sleep and step summaries, free-text notes, journal entries, plans and preferences in a SQLCipher database. The encryption key is held by the phone’s secure key store.</Body>
      </View>

      {!noticeOnly && <>
        <SettingsSection label="Your controls">
          <SettingsRow icon="heart" title="Phone health" detail="Optional local sleep and movement context" onPress={() => router.push('/health-data' as never)} />
          <SettingsRow icon="download" title="Export my data" detail="Create and save a local JSON copy" onPress={() => router.push('/export-data')} />
          <SettingsRow icon="trash-2" title="Delete my data" detail="Review the confirmation and completion flow" onPress={() => router.push('/delete-data')} danger last />
        </SettingsSection>

        <SettingsSection label="Participation">
          <SettingsRow icon="shield" title="Pilot connection" detail="Pseudonymous link, encrypted queue and service status" onPress={() => router.push('/pilot-status')} />
          <SettingsRow icon="clipboard" title="Consent choices" detail={researchConsent ? 'Research and health-data consent recorded' : researchConsentUpdatedAt ? 'App use only; research uploads are off' : 'No preference recorded yet'} onPress={() => router.push('/pilot-consent')} />
          <SettingsRow icon="slash" title="Withdraw from research" detail="Permanently stop future pilot uploads" onPress={() => router.push('/withdraw-research')} last />
        </SettingsSection>
      </>}

      <SettingsSection label="What the pilot server can store">
        <SettingsRow icon="hash" title="Random participant number" detail="No name, email, university ID or device identifier" />
        <SettingsRow icon="activity" title="Structured measures" detail="Relative study day, check-in values and approved SWEMWBS scores only" />
        <SettingsRow icon="book" title="No journal or free text" detail="The server schema rejects fields outside its allowlist" last />
      </SettingsSection>

      <View style={{ marginTop: 18, borderRadius: 18, backgroundColor: MS.color.sageSoft, padding: 14 }}>
        <BodyBold size={10} color={MS.color.inkSoft}>PHONE HEALTH NEVER JOINS THE PILOT RECORD</BodyBold>
        <Body size={10.5} color={MS.color.muted} style={{ marginTop: 4 }}>When you connect Apple Health or Health Connect, MindSHED keeps only daily sleep duration and step totals on this device. Raw records and derived summaries are excluded from pilot uploads.</Body>
      </View>

      <View style={{ marginTop: 18, borderRadius: 18, backgroundColor: '#F8E8D7', padding: 14 }}>
        <BodyBold size={10} color={MS.color.inkSoft}>PSEUDONYMOUS, NOT ABSOLUTELY ANONYMOUS</BodyBold>
        <Body size={10.5} color={MS.color.muted} style={{ marginTop: 4 }}>A random participant number links your approved pilot events together. It is never mapped to your name by MindSHED, but it remains personal data until an approved irreversible anonymisation step.</Body>
      </View>
      <Body size={10.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 20 }}>Production consent remains blocked until the controller, processor, hosting region, retention schedule and contact details receive written approval.</Body>
    </ScrollView>
  );
}
