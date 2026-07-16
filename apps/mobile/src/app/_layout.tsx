import { HappyMonkey_400Regular, useFonts } from '@expo-google-fonts/happy-monkey';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { MS } from '@/constants/mindshed';
import { PilotSyncAgent } from '@/components/pilot-sync-agent';
import { HealthSyncAgent } from '@/components/health-sync-agent';
import { ApiProvider } from '@/lib/trpc';
import { useWellness } from '@/store/wellness';
import { needsOnboarding } from '@/lib/lifecycle';

function LifecycleGate() {
  const router = useRouter();
  const segments = useSegments();
  const onboardingComplete = useWellness((state) => state.onboardingComplete);
  const firstSegment = segments[0] as string | undefined;
  const shouldOnboard = needsOnboarding(onboardingComplete, firstSegment);

  useEffect(() => {
    if (shouldOnboard) router.replace('/onboarding');
  }, [shouldOnboard, router]);

  if (!shouldOnboard) return null;
  return <View pointerEvents="auto" style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: MS.color.cream }} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    HappyMonkey_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });
  const hasHydrated = useWellness((state) => state.hasHydrated);

  if ((!fontsLoaded && !fontError) || !hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: MS.color.cream }} />;
  }

  return (
    <ApiProvider>
      <ThemeProvider value={DefaultTheme}>
        <PilotSyncAgent />
        <HealthSyncAgent />
        <View style={Platform.OS === 'web' ? { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: MS.color.cream, shadowColor: MS.color.shadow, shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 0 } } : { flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: MS.color.cream } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="check-in" options={{ presentation: 'modal' }} />
          <Stack.Screen name="breathe" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="journal" />
          <Stack.Screen name="activities" />
          <Stack.Screen name="support" options={{ presentation: 'modal' }} />
          <Stack.Screen name="garden" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="garden-progress" />
          <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="pulse" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="profile" />
          <Stack.Screen name="daily-nudge" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="accessibility" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="health-data" />
          <Stack.Screen name="export-data" />
          <Stack.Screen name="delete-data" />
          <Stack.Screen name="withdraw-research" />
          <Stack.Screen name="about" />
          <Stack.Screen name="sounds" />
          <Stack.Screen name="pilot-consent" />
          <Stack.Screen name="pilot-status" />
          <Stack.Screen name="legal" />
          <Stack.Screen name="insight-detail" />
          <Stack.Screen name="care-plan" />
          <Stack.Screen name="grounding" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="history" />
        </Stack>
        <LifecycleGate />
        </View>
      </ThemeProvider>
    </ApiProvider>
  );
}
