import Feather from '@expo/vector-icons/Feather';
import { PILOT_SCHEMA_VERSION } from '@mindshed/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBramble } from '@/components/ms/animated-bramble';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { configureDailyNudge } from '@/lib/daily-nudge';
import { LEGAL_DOCUMENTS_APPROVED } from '@/lib/legal-readiness';
import { getPilotIdentity, setPilotIdentity } from '@/lib/pilot-identity';
import { trpc } from '@/lib/trpc';
import { useWellness } from '@/store/wellness';

const StepDots = ({ step }: { step: number }) => (
  <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
    {[0, 1, 2, 3].map((item) => <View key={item} style={{ width: item === step ? 24 : 7, height: 7, borderRadius: 4, backgroundColor: item <= step ? MS.color.forest : `${MS.color.forest}24` }} />)}
  </View>
);

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ step?: string }>();
  const [step, setStep] = useState(Number(params.step) || 0);
  const [invite, setInvite] = useState('');
  const [error, setError] = useState('');
  const [entryNoticeRead, setEntryNoticeRead] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [nudgeSaving, setNudgeSaving] = useState(false);
  const onboardingComplete = useWellness((state) => state.onboardingComplete);
  const appConsentAcceptedAt = useWellness((state) => state.appConsentAcceptedAt);
  const setStoredNudge = useWellness((state) => state.setNudge);
  const completeOnboarding = useWellness((state) => state.completeOnboarding);
  const enrolPilot = trpc.pilot.enrol.useMutation();
  const pilotConfig = trpc.pilot.config.useQuery(undefined, { retry: 1 });
  const legalLocked = !__DEV__ && !LEGAL_DOCUMENTS_APPROVED;
  const enrolmentPaused = pilotConfig.data?.enrolmentOpen === false || legalLocked;

  useEffect(() => {
    if (step !== 0 || onboardingComplete) return;
    void getPilotIdentity().then((identity) => {
      if (!identity) return;
      router.replace(appConsentAcceptedAt ? { pathname: '/onboarding', params: { step: '1' } } : '/pilot-consent');
    });
  }, [appConsentAcceptedAt, onboardingComplete, step]);

  const checkInvite = async () => {
    setError('');
    try {
      const existingIdentity = await getPilotIdentity();
      if (existingIdentity) {
        router.replace(appConsentAcceptedAt ? { pathname: '/onboarding', params: { step: '1' } } : '/pilot-consent');
        return;
      }
      const enrolled = await enrolPilot.mutateAsync({
        accessCode: invite.trim(),
        schemaVersion: PILOT_SCHEMA_VERSION,
      });
      await setPilotIdentity({
        participantId: enrolled.participantId,
        participantToken: enrolled.participantToken,
        deletionSecret: enrolled.deletionSecret,
        enrolledAt: new Date().toISOString(),
      });
      router.push('/pilot-consent');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message.toLowerCase() : '';
      setError(
        message.includes('cohort is full')
          ? 'This pilot cohort has reached its approved capacity. Your university pilot contact can advise on next steps.'
          : message.includes('not active')
            ? 'That pilot code is not active. It may not have started yet or may have expired.'
            : message.includes('enrolment is unavailable')
              ? 'Pilot enrolment is temporarily paused. No information was submitted.'
              : message.includes('invalid pilot access code')
                ? 'That code is not recognised. Check the letters or ask your pilot contact for a new code.'
                : 'We could not verify that code. Check your connection and try again; no information was submitted.',
      );
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: step === 1 ? MS.color.skyPale : MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: insets.bottom + 30, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {step || onboardingComplete ? <Pressable onPress={() => step ? setStep(step - 1) : router.back()} accessibilityRole="button" accessibilityLabel={step ? 'Previous onboarding step' : 'Close onboarding'} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.82)', alignItems: 'center', justifyContent: 'center' }}><Feather name={step ? 'arrow-left' : 'x'} size={18} color={MS.color.forest} /></Pressable> : <View style={{ width: 44 }} />}
        <StepDots step={step} />
        <View style={{ width: 44 }} />
      </View>

      {step === 0 && (
        <View style={{ flex: 1, paddingTop: 54 }}>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.5 }}>WELCOME TO</BodyBold>
          <Display size={38} color={MS.color.inkSoft} style={{ marginTop: 3 }}>MindSHED</Display>
          <Heading size={20} color={MS.color.forest} style={{ marginTop: 14, maxWidth: 300 }}>A small place to look after yourself.</Heading>
          <Body size={13} color={MS.color.muted} style={{ marginTop: 8, maxWidth: 330 }}>The dental-student pilot is invite-only. Your code helps us open the right garden without collecting more information than we need.</Body>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.25, marginTop: 34, marginBottom: 8 }}>INVITE CODE</BodyBold>
          <TextInput value={invite} onChangeText={(text) => { setInvite(text); setError(''); }} autoCapitalize="characters" autoCorrect={false} placeholder="Enter your code" placeholderTextColor={MS.color.faint} accessibilityLabel="Pilot invite code" style={{ minHeight: 58, borderRadius: 19, backgroundColor: MS.color.surface, paddingHorizontal: 17, fontFamily: MS.font.bodyBold, fontSize: 16, letterSpacing: 1.2, color: MS.color.inkSoft, borderWidth: error ? 1 : 0, borderColor: MS.color.danger }} />
          <Pressable onPress={() => setEntryNoticeRead((value) => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: entryNoticeRead }} style={{ marginTop: 13, borderRadius: 18, backgroundColor: MS.color.surface, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 }}><View style={{ width: 25, height: 25, borderRadius: 8, borderWidth: 1.5, borderColor: entryNoticeRead ? MS.color.forest : `${MS.color.forest}45`, backgroundColor: entryNoticeRead ? MS.color.forest : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{entryNoticeRead && <Feather name="check" size={14} color={MS.color.surface} />}</View><Body size={10.5} color={MS.color.muted} style={{ flex: 1 }}>I have read the pilot privacy notice and understand that continuing creates a random pilot access record before my optional research choices.</Body></Pressable>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}><Pressable onPress={() => router.push({ pathname: '/privacy', params: { notice: '1' } })} accessibilityRole="link"><BodyBold size={10.5} color={MS.color.forest}>Privacy notice</BodyBold></Pressable><Pressable onPress={() => router.push('/legal')} accessibilityRole="link"><BodyBold size={10.5} color={MS.color.forest}>Terms and boundaries</BodyBold></Pressable></View>
          {enrolmentPaused && <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}><Feather name="pause-circle" size={15} color={MS.color.forestMuted} /><Body size={11} color={MS.color.forestMuted} style={{ flex: 1 }}>{legalLocked ? 'Pilot enrollment is locked until the final legal documents receive written approval.' : 'Pilot enrollment is currently paused. The local wellbeing app remains available to existing participants.'}</Body></View>}
          {!!error && <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}><Feather name="alert-circle" size={15} color={MS.color.danger} /><Body size={11} color={MS.color.danger} style={{ flex: 1 }}>{error}</Body></View>}
          {__DEV__ && process.env.EXPO_PUBLIC_LOCAL_PILOT_CODE && <Pressable onPress={() => setInvite(process.env.EXPO_PUBLIC_LOCAL_PILOT_CODE ?? '')} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginTop: 10, paddingVertical: 6 }}><BodyBold size={10.5} color={MS.color.forest}>Use local development code</BodyBold></Pressable>}
          <PillButton label={enrolPilot.isPending ? 'Verifying securely…' : enrolmentPaused ? 'Enrolment paused' : 'Continue'} onPress={checkInvite} disabled={!invite.trim() || !entryNoticeRead || enrolPilot.isPending || enrolmentPaused} style={{ marginTop: 20 }} />
        </View>
      )}

      {step === 1 && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}>
          <AnimatedBramble size={220} state="greet" mood="happy" />
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.4, marginTop: 24 }}>MEET BRAMBLE</BodyBold>
          <Display size={29} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 5 }}>Your quiet companion</Display>
          <CharacterText size={16} color={MS.color.inkSoft} style={{ textAlign: 'center', marginTop: 14, maxWidth: 320 }}>“You never have to keep me fed or happy. I’m simply here when looking after yourself feels useful.”</CharacterText>
          <PillButton label="Show me the garden" onPress={() => setStep(2)} style={{ alignSelf: 'stretch', marginTop: 30 }} />
        </View>
      )}

      {step === 2 && (
        <View style={{ flex: 1, paddingTop: 42 }}>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.4 }}>AN OPTIONAL REMINDER</BodyBold>
          <Heading size={25} color={MS.color.inkSoft} style={{ marginTop: 5 }}>Make the garden yours</Heading>
          <Body size={12.5} color={MS.color.muted} style={{ marginTop: 6 }}>You can change this later. The app remains useful if you skip it.</Body>
          {[
            { key: 'nudge', icon: 'bell', title: 'One daily nudge', detail: 'A gentle reminder at a time you choose', value: nudge, set: setNudge },
          ].map((item) => (
            <Pressable key={item.key} onPress={() => item.set(!item.value)} accessibilityRole="checkbox" accessibilityState={{ checked: item.value }} style={{ marginTop: 14, borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name={item.icon as never} size={20} color={MS.color.forest} /></View>
              <View style={{ flex: 1 }}><Heading size={15} color={MS.color.inkSoft}>{item.title}</Heading><Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>{item.detail}</Body></View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: item.value ? MS.color.forest : 'transparent', borderWidth: 1, borderColor: item.value ? MS.color.forest : `${MS.color.forest}40`, alignItems: 'center', justifyContent: 'center' }}>{item.value && <Feather name="check" size={15} color={MS.color.surface} />}</View>
            </Pressable>
          ))}
          <PillButton label={nudgeSaving ? 'Setting reminder…' : 'Continue'} disabled={nudgeSaving} onPress={() => {
            setNudgeSaving(true);
            void configureDailyNudge(nudge, '18:30').then((result) => {
              setStoredNudge(result === 'scheduled', '18:30');
              setStep(3);
            }).catch(() => {
              setStoredNudge(false, '18:30');
              setStep(3);
            }).finally(() => setNudgeSaving(false));
          }} style={{ marginTop: 26 }} />
        </View>
      )}

      {step === 3 && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="sun" size={34} color={MS.color.forest} /></View>
          <Display size={30} color={MS.color.inkSoft} style={{ marginTop: 24, textAlign: 'center' }}>We’ll grow it together.</Display>
          <Body size={12.5} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 8, maxWidth: 310 }}>The garden starts quiet on purpose. A check-in gives today somewhere to land.</Body>
          <PillButton label={onboardingComplete ? 'Return to the garden' : 'Enter the garden'} onPress={() => { completeOnboarding(); router.replace('/'); }} style={{ alignSelf: 'stretch', marginTop: 30 }} />
          <Body size={10} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 13 }}>Your preferences stay on this device. This pilot does not ask you to create an identity account.</Body>
        </View>
      )}
    </ScrollView>
  );
}
