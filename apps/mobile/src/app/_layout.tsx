import { HappyMonkey_400Regular, useFonts } from '@expo-google-fonts/happy-monkey';
import { Nunito_400Regular, Nunito_600SemiBold } from '@expo-google-fonts/nunito';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { ApiProvider } from '@/lib/trpc';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HappyMonkey_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ApiProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="check-in" options={{ presentation: 'modal' }} />
          <Stack.Screen name="breathe" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="journal" />
          <Stack.Screen name="activities" />
          <Stack.Screen name="support" options={{ presentation: 'modal' }} />
          <Stack.Screen name="rive-test" />
        </Stack>
      </ThemeProvider>
    </ApiProvider>
  );
}
