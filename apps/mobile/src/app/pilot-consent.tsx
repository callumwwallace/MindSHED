import Feather from '@expo/vector-icons/Feather';
import {
  PILOT_CONSENT_VERSION,
  PRIVACY_NOTICE_VERSION,
} from '@mindshed/shared';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { LEGAL_DOCUMENTS_APPROVED, MARKETING_CONSENT_ENABLED } from '@/lib/legal-readiness';
import { getPilotIdentity } from '@/lib/pilot-identity';
import { apiClient, trpc } from '@/lib/trpc';
import { usePilotQueue } from '@/store/pilot-queue';
import { useWellness } from '@/store/wellness';

function ConsentChoice({
  title,
  detail,
  value,
  onChange,
  disabled = false,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      style={{ marginTop: 14, borderRadius: 18, backgroundColor: MS.color.surface, padding: 15, flexDirection: 'row', gap: 12, alignItems: 'center', opacity: disabled ? 0.55 : 1 }}>
      <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: value ? MS.color.forest : 'transparent', borderWidth: 1.5, borderColor: value ? MS.color.forest : `${MS.color.forest}45`, alignItems: 'center', justifyContent: 'center' }}>
        {value && <Feather name="check" size={16} color={MS.color.surface} />}
      </View>
      <View style={{ flex: 1 }}>
        <BodyBold size={12.5}>{title}</BodyBold>
        <Body size={10} color={MS.color.muted}>{detail}</Body>
      </View>
    </Pressable>
  );
}

export default function PilotConsentScreen() {
  const insets = useSafeAreaInsets();
  const onboardingComplete = useWellness((state) => state.onboardingComplete);
  const appConsentAcceptedAt = useWellness((state) => state.appConsentAcceptedAt);
  const storedResearchConsent = useWellness((state) => state.researchConsent);
  const storedHealthConsent = useWellness((state) => state.healthDataConsent);
  const storedMarketingConsent = useWellness((state) => state.marketingConsent);
  const recordLocalConsent = useWellness((state) => state.recordConsent);
  const recordServerConsent = trpc.pilot.recordConsent.useMutation();
  const [care, setCare] = useState(Boolean(appConsentAcceptedAt));
  const [research, setResearch] = useState(storedResearchConsent);
  const [health, setHealth] = useState(storedHealthConsent);
  const [marketing, setMarketing] = useState(storedMarketingConsent);
  const [error, setError] = useState('');
  const [identityReady, setIdentityReady] = useState<boolean | null>(null);
  const [researchWithdrawn, setResearchWithdrawn] = useState(false);

  useEffect(() => {
    void getPilotIdentity().then(async (identity) => {
      setIdentityReady(Boolean(identity));
      if (!identity) return;
      try {
        const status = await apiClient.pilot.status.mutate({
          participantId: identity.participantId,
          participantToken: identity.participantToken,
        });
        setResearchWithdrawn(status.researchWithdrawn);
        if (status.researchWithdrawn) {
          setResearch(false);
          setHealth(false);
        }
      } catch {
        // Saving still provides the authoritative online result and error copy.
      }
    });
  }, []);

  const saveConsent = async () => {
    setError('');
    try {
      const identity = await getPilotIdentity();
      if (!identity) {
        setIdentityReady(false);
        setError('This device no longer has a pilot access key. Return to enrollment to continue.');
        return;
      }
      await recordServerConsent.mutateAsync({
        participantId: identity.participantId,
        participantToken: identity.participantToken,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        consentDocumentVersion: PILOT_CONSENT_VERSION,
        termsAccepted: true,
        researchConsent: research,
        healthDataConsent: research && health,
        marketingConsent: MARKETING_CONSENT_ENABLED && marketing,
      });
      recordLocalConsent({
        researchConsent: research,
        healthDataConsent: research && health,
        marketingConsent: MARKETING_CONSENT_ENABLED && marketing,
      });
      if (!research) usePilotQueue.getState().clear();
      if (onboardingComplete) router.back();
      else router.replace({ pathname: '/onboarding', params: { step: '1' } });
    } catch {
      setError('Your choices could not be recorded securely. Nothing has been uploaded; please try again when you are online.');
    }
  };

  const researchNeedsHealthConsent = research && !health;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 38 }}>
      <ScreenHeader eyebrow="Before the garden" title="Your choice, clearly" description="Using MindSHED, joining the study and hearing from us are separate decisions." />

      <View style={{ marginTop: 24, borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, padding: 18 }}>
        <Heading size={16} color={MS.color.inkSoft}>What stays private</Heading>
        <Body size={11.5} color={MS.color.muted} style={{ marginTop: 6 }}>Journal entries, your name, support-plan details and free-text check-in notes stay on this device. The pilot server accepts only approved check-in values and, once separately enabled, SWEMWBS scores linked to a random participant number.</Body>
      </View>
      <View style={{ marginTop: 11, borderRadius: MS.radius.xl, backgroundColor: MS.color.sageSoft, padding: 18 }}>
        <Heading size={16} color={MS.color.inkSoft}>You stay in control</Heading>
        <Body size={11.5} color={MS.color.muted} style={{ marginTop: 6 }}>Research is optional. You can withdraw from research or delete the pseudonymous pilot record using the deletion key held by this device. MindSHED cannot recover that key by your name if this device is lost.</Body>
      </View>

      <ConsentChoice title="I agree to use MindSHED" detail="Required: I have read the privacy notice and understand this is not an emergency or clinical service." value={care} onChange={setCare} />
      <ConsentChoice title="I choose to join the pilot research" detail={researchWithdrawn ? 'Research was permanently withdrawn for this pilot identity.' : 'Optional: approved structured wellbeing measures may be analysed.'} value={research} disabled={researchWithdrawn} onChange={(value) => { setResearch(value); if (!value) setHealth(false); }} />
      {research && <ConsentChoice title="I consent to health-data processing" detail="Required for research uploads because wellbeing responses may be special-category health data." value={health} onChange={setHealth} />}
      {MARKETING_CONSENT_ENABLED ? <ConsentChoice title="I would like MindSHED updates" detail="Optional marketing communication preference; this does not affect app or research access." value={marketing} onChange={setMarketing} /> : <View style={{ marginTop: 14, borderRadius: 18, backgroundColor: MS.color.surface, padding: 15 }}><BodyBold size={12.5}>No marketing contact is collected</BodyBold><Body size={10} color={MS.color.muted} style={{ marginTop: 2 }}>This no-account pilot does not ask for an email or phone number for updates.</Body></View>}

      {researchNeedsHealthConsent && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8E8D7', padding: 13 }}><Body size={10.5} color={MS.color.inkSoft}>Health-data consent is needed to join the research. You can turn research off and still use the app.</Body></View>}
      {!!error && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8DFD7', padding: 13 }}><Body size={10.5} color={MS.color.danger}>{error}</Body></View>}

      {!LEGAL_DOCUMENTS_APPROVED && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8E8D7', padding: 13 }}><Body size={10.5} color={MS.color.inkSoft}>Production consent is locked until the final controller, contact, retention and research wording is approved. Development builds can continue for flow testing.</Body></View>}
      {identityReady === false && <PillButton label="Return to enrollment" onPress={() => router.replace('/onboarding')} color={MS.color.surface} textColor={MS.color.forest} style={{ marginTop: 18 }} />}
      <PillButton label={recordServerConsent.isPending ? 'Recording securely…' : onboardingComplete ? 'Save my choices' : 'Continue to meet Bramble'} onPress={saveConsent} disabled={!care || researchNeedsHealthConsent || recordServerConsent.isPending || identityReady === false || (!__DEV__ && !LEGAL_DOCUMENTS_APPROVED)} style={{ marginTop: identityReady === false ? 10 : 22 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 14 }}>
        <Pressable onPress={() => router.push({ pathname: '/privacy', params: { notice: '1' } })} accessibilityRole="link"><BodyBold size={10.5} color={MS.color.forest}>Privacy summary</BodyBold></Pressable>
        <Pressable onPress={() => router.push('/legal')} accessibilityRole="link"><BodyBold size={10.5} color={MS.color.forest}>Legal documents</BodyBold></Pressable>
      </View>
      <Body size={9.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 12 }}>{PRIVACY_NOTICE_VERSION} · {PILOT_CONSENT_VERSION}</Body>
    </ScrollView>
  );
}
