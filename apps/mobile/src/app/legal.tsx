import { PILOT_CONSENT_VERSION, PRIVACY_NOTICE_VERSION } from '@mindshed/shared';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { LEGAL_DOCUMENTS_APPROVED } from '@/lib/legal-readiness';
import { RELEASE_DETAILS } from '@/lib/release-details';

type LegalSection = readonly [title: string, copy: string];
type LegalPage = {
  eyebrow: string;
  intro: string;
  sections: readonly LegalSection[];
  title: string;
};

const pages: Record<'privacy' | 'terms' | 'pilot' | 'contact', LegalPage> = {
  privacy: {
    eyebrow: 'Pilot privacy notice',
    title: 'How MindSHED handles data',
    intro: LEGAL_DOCUMENTS_APPROVED
      ? `This is the approved in-app summary for ${PRIVACY_NOTICE_VERSION}. Use the full policy link below for the complete notice.`
      : 'This engineering summary matches the implemented data flow, but final controller approval is still required before production consent can open.',
    sections: [
      ['Private on this device', 'Your display name, journal, check-in notes, support plan and daily plan are stored in the app’s encrypted native database. They are included only when you explicitly create an export.'],
      ['Optional pilot record', 'With research consent, the service may receive a random participant number, relative study day, mood, energy, pressure, up to three selected support needs and an approved wellbeing score. It does not accept journal text, notes, names, email, student ID, device ID, precise location, raw health data or exact client timestamps.'],
      ['Your controls', 'You can export local and pilot data, stop future research uploads, or delete local content and the linked pilot record from Privacy and data. An offline withdrawal or deletion takes effect locally at once and securely retries server confirmation.'],
      ['Pseudonymous, not anonymous', 'Pilot events remain linked by a random participant number and are treated as pseudonymous data. MindSHED does not keep a name-to-record lookup, but approved infrastructure and governance controls still apply.'],
    ],
  },
  terms: {
    eyebrow: 'Wellbeing boundaries',
    title: 'Terms and wellbeing disclaimer',
    intro: 'MindSHED supports reflection and small wellbeing actions. It is not a clinical, diagnostic, monitoring or emergency service.',
    sections: [
      ['When to seek help', 'Call 999 for immediate danger or risk to life. Use the Support screen for Samaritans, Shout and NHS 111 options in England.'],
      ['Using the activities', 'Check-ins, breathing, grounding and suggested activities are general wellbeing tools. They can be skipped or stopped at any time and are not medical advice.'],
      ['No monitoring', 'No person or automated system watches your journal, support plan or check-ins for emergencies. Choosing a low mood only presents support options on this device.'],
      ['Availability', 'Local features can work without the pilot service. Eligible research uploads may pause for maintenance and remain encrypted on this device until a permitted retry.'],
    ],
  },
  pilot: {
    eyebrow: 'University pilot',
    title: 'Research participation',
    intro: 'Research participation is optional and separate from ordinary university wellbeing support.',
    sections: [
      ['What may be collected', 'Only the versioned, structured fields named in the approved pilot data dictionary can be uploaded. The seven-item SWEMWBS score is uploaded only when its independent release switch and the participant’s research consent are both active.'],
      ['What is excluded', 'Journal text, check-in notes, support-plan content, phone-health summaries and interactions with crisis resources are never research events.'],
      ['Changing your mind', 'Turning research off stops upload eligibility. Formal withdrawal records the withdrawal on the server and clears queued events. Treatment of already collected data follows the signed participant information and study protocol.'],
    ],
  },
  contact: {
    eyebrow: 'Real people',
    title: 'Contact MindSHED',
    intro: LEGAL_DOCUMENTS_APPROVED
      ? 'Use the separate routes below for app support, privacy rights and research questions.'
      : 'Verified production contacts will appear here after legal and governance approval.',
    sections: [
      ['App support', RELEASE_DETAILS.supportEmail || 'Production support email not configured.'],
      ['Privacy contact', RELEASE_DETAILS.privacyEmail
        ? `${RELEASE_DETAILS.controllerName} · ${RELEASE_DETAILS.controllerAddress} · ${RELEASE_DETAILS.privacyEmail} · ICO ${RELEASE_DETAILS.icoRegistration}`
        : 'Controller, postal address, privacy email and ICO registration not configured.'],
      ['Research team', RELEASE_DETAILS.researchEmail || 'Production research contact not configured.'],
    ],
  },
};

function ContactLink({ label, target }: { label: string; target: string }) {
  if (!target) return null;
  const url = target.includes('@') ? `mailto:${target}` : target;
  const open = async () => {
    try {
      if (!(await Linking.canOpenURL(url))) throw new Error('unsupported');
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open this contact', 'Copy the address shown on this screen and open it in a trusted app.');
    }
  };
  return (
    <Pressable accessibilityRole="link" onPress={() => void open()} style={{ paddingVertical: 8 }}>
      <BodyBold size={11} color={MS.color.forest}>{label}</BodyBold>
    </Pressable>
  );
}

export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const { section = 'privacy' } = useLocalSearchParams<{ section?: keyof typeof pages }>();
  const page = pages[section] ?? pages.privacy;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 40 }}>
      <ScreenHeader eyebrow={page.eyebrow} title={page.title} description={page.intro} />
      {!LEGAL_DOCUMENTS_APPROVED && (
        <View accessibilityRole="alert" style={{ marginTop: 18, borderRadius: 18, backgroundColor: '#F8E8D7', padding: 14 }}>
          <BodyBold size={10.5} color={MS.color.inkSoft}>NOT APPROVED FOR PRODUCTION CONSENT</BodyBold>
          <Body size={10.5} color={MS.color.muted} style={{ marginTop: 4 }}>
            Production enrollment remains disabled until the final documents, contacts, retention terms and data flow receive written approval.
          </Body>
        </View>
      )}
      <View style={{ marginTop: 18, gap: 11 }}>
        {page.sections.map(([title, copy]) => (
          <View key={title} style={{ borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, padding: 17 }}>
            <Heading size={15.5} color={MS.color.inkSoft}>{title}</Heading>
            <Body size={11.5} color={MS.color.muted} style={{ marginTop: 5 }}>{copy}</Body>
          </View>
        ))}
      </View>
      {section === 'privacy' && <ContactLink label="Open the full privacy policy" target={RELEASE_DETAILS.privacyPolicyUrl} />}
      {section === 'contact' && (
        <View style={{ marginTop: 8 }}>
          <ContactLink label="Email app support" target={RELEASE_DETAILS.supportEmail} />
          <ContactLink label="Email the privacy team" target={RELEASE_DETAILS.privacyEmail} />
          <ContactLink label="Email the research team" target={RELEASE_DETAILS.researchEmail} />
          <ContactLink label="Open the support website" target={RELEASE_DETAILS.supportUrl} />
        </View>
      )}
      <BodyBold size={10} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 22 }}>
        {LEGAL_DOCUMENTS_APPROVED ? `${PRIVACY_NOTICE_VERSION} · ${PILOT_CONSENT_VERSION}` : 'ENGINEERING NOTICE · LEGAL APPROVAL REQUIRED'}
      </BodyBold>
    </ScrollView>
  );
}
