import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { useWellness } from '@/store/wellness';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const storedName = useWellness((state) => state.profileName);
  const setProfileName = useWellness((state) => state.setProfileName);
  const [name, setName] = useState(storedName);

  const save = () => {
    if (!name.trim()) return;
    setProfileName(name.trim());
    feedback.success();
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="Your profile" title="What should we call you?" description="This is used for greetings inside the app. It is never shown to other people." />
      <View style={{ marginTop: 26 }}>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2, marginBottom: 8 }}>DISPLAY NAME</BodyBold>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={MS.color.faint}
          accessibilityLabel="Display name"
          autoCapitalize="words"
          style={{ minHeight: 56, borderRadius: 18, backgroundColor: MS.color.surface, paddingHorizontal: 16, fontFamily: MS.font.body, fontSize: 16, color: MS.color.inkSoft }}
        />
        <Body size={11} color={MS.color.muted} style={{ marginTop: 9 }}>This pilot uses no personal account. Your display name stays in the encrypted database on this device.</Body>
      </View>
      <PillButton label="Save profile" onPress={save} disabled={!name.trim()} style={{ marginTop: 28 }} />
    </ScrollView>
  );
}
