import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { SettingsRow } from '@/components/ms/settings-row';
import { SettingsSection } from '@/components/ms/settings-section';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 40 }}>
      <ScreenHeader eyebrow="The September pilot" title="About MindSHED" description="A gentle wellbeing companion being designed with university students." />
      <View style={{ marginTop: 24, borderRadius: MS.radius.xl, backgroundColor: MS.color.sageSoft, padding: 18 }}>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>OUR PROMISE</BodyBold>
        <Heading size={18} color={MS.color.forest} style={{ marginTop: 5 }}>Care without punishment</Heading>
        <Body size={11.5} color={MS.color.forestMuted} style={{ marginTop: 6 }}>No broken streaks, hunger mechanics or shame. MindSHED helps you notice patterns and take one manageable action.</Body>
      </View>
      <SettingsSection label="Information">
        <SettingsRow icon="file-text" title="Privacy policy" detail="Final university-approved policy required before launch" onPress={() => router.push({ pathname: '/legal', params: { section: 'privacy' } })} />
        <SettingsRow icon="book-open" title="Terms and wellbeing disclaimer" detail="MindSHED is not a clinical or emergency service" onPress={() => router.push({ pathname: '/legal', params: { section: 'terms' } })} />
        <SettingsRow icon="users" title="Pilot and research participation" detail="Consent, contact and withdrawal information" onPress={() => router.push({ pathname: '/legal', params: { section: 'pilot' } })} />
        <SettingsRow icon="mail" title="Contact the MindSHED team" detail="Pilot support contact will appear here" onPress={() => router.push({ pathname: '/legal', params: { section: 'contact' } })} last />
      </SettingsSection>
      <Body size={10.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 22 }}>MindSHED · pilot build 1.0.0</Body>
    </ScrollView>
  );
}
