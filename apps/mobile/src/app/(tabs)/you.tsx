import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderPill } from '@/components/ms/header-pill';
import { SettingsRow } from '@/components/ms/settings-row';
import { SettingsSection } from '@/components/ms/settings-section';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { getGardenProgress } from '@/lib/garden-progress';
import { useWellness } from '@/store/wellness';

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const checkins = useWellness((state) => state.checkins);
  const journal = useWellness((state) => state.journal);
  const gardenGrowth = useWellness((state) => state.gardenGrowth);
  const profileName = useWellness((state) => state.profileName);
  const nudgeEnabled = useWellness((state) => state.nudgeEnabled);
  const nudgeTime = useWellness((state) => state.nudgeTime);
  const healthConnected = useWellness((state) => state.healthConnected);
  const garden = getGardenProgress(gardenGrowth);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 42 }}
      showsVerticalScrollIndicator={false}>
      <HeaderPill title="You" size={23} />
      <Body size={12} color={MS.color.muted} style={{ marginTop: 6 }}>
        Your preferences, privacy and progress.
      </Body>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
        <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Heading size={21} color={MS.color.forest}>{profileName.trim().slice(0, 1).toUpperCase() || 'Y'}</Heading>
        </View>
        <View style={{ flex: 1, marginLeft: 13 }}>
          <Heading size={19} color={MS.color.inkSoft}>{profileName || 'Your profile'}</Heading>
          <Body size={11} color={MS.color.muted}>Dental student pilot</Body>
        </View>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Feather name="edit-2" size={16} color={MS.color.forest} />
        </Pressable>
      </View>

      <View style={{ backgroundColor: MS.color.sageSoft, borderRadius: MS.radius.xl, padding: 16, marginTop: 20 }}>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>YOUR CARE, SO FAR</BodyBold>
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          {[
            { value: checkins.length, label: 'check-ins' },
            { value: garden.unlocked.length, label: 'habitats' },
            { value: journal.length, label: 'reflections' },
          ].map((item, index) => (
            <View key={item.label} style={{ flex: 1, paddingLeft: index ? 14 : 0, borderLeftWidth: index ? 1 : 0, borderLeftColor: `${MS.color.forest}18` }}>
              <Heading size={22} color={MS.color.forest}>{item.value}</Heading>
              <Body size={9.5} color={MS.color.forestMuted}>{item.label}</Body>
            </View>
          ))}
        </View>
      </View>

      <SettingsSection label="Your care">
        <SettingsRow icon="feather" title="Garden journal" detail={garden.current ? `Latest: ${garden.current.shortTitle}` : 'See how check-ins restore the habitat'} onPress={() => router.push('/garden-progress' as never)} />
        <SettingsRow icon="shield" title="My support plan" detail="What I notice, what helps and who I can reach" onPress={() => router.push('/care-plan')} />
        <SettingsRow icon="bell" title="Daily nudge" detail={nudgeEnabled ? `Once a day at ${nudgeTime}` : 'Off'} onPress={() => router.push('/daily-nudge')} last />
      </SettingsSection>

      <SettingsSection label="Preferences and privacy">
        <SettingsRow icon="sliders" title="Accessibility and comfort" detail="Motion, sound and haptics" onPress={() => router.push('/accessibility')} />
        <SettingsRow icon="heart" title="Phone health" detail={healthConnected ? 'Sleep and movement connected locally' : 'Optional sleep and movement context'} onPress={() => router.push('/health-data' as never)} />
        <SettingsRow icon="shield" title="Privacy and data" detail="Storage, export and deletion" onPress={() => router.push('/privacy')} last />
      </SettingsSection>

      <SettingsSection label="MindSHED">
        <SettingsRow icon="life-buoy" title="Help and resources" detail="Support from real people" onPress={() => router.push('/support')} />
        <SettingsRow icon="info" title="About and pilot information" detail="Policies, research and app details" onPress={() => router.push('/about')} />
        <SettingsRow icon="play-circle" title="Meet Bramble again" detail="Review the welcome without changing pilot access" onPress={() => router.push({ pathname: '/onboarding', params: { step: '1' } })} last />
      </SettingsSection>

      <Body size={10.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 22 }}>
        No broken streaks. No punishment. Your garden waits kindly.
      </Body>
    </ScrollView>
  );
}
