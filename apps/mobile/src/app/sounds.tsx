import Feather from '@expo/vector-icons/Feather';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

export default function SoundsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 36 }}>
      <ScreenHeader eyebrow="The old radio" title="Soundscapes" description="A possible future place for calm, licensed audio." />
      <View style={{ marginTop: 30, borderRadius: 28, backgroundColor: MS.color.surface, padding: 24, alignItems: 'center' }}>
        <View style={{ width: 68, height: 68, borderRadius: 24, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="volume-x" size={26} color={MS.color.forestMuted} />
        </View>
        <Heading size={19} color={MS.color.inkSoft} style={{ marginTop: 18 }}>Not included in this pilot</Heading>
        <Body size={12} color={MS.color.muted} style={{ marginTop: 7, textAlign: 'center', lineHeight: 19 }}>
          MindSHED does not currently download, stream or play background audio. This screen is kept only so an old link cannot open a misleading player.
        </Body>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ marginTop: 20, letterSpacing: 1.1 }}>NO AUDIO DATA IS COLLECTED</BodyBold>
      </View>
    </ScrollView>
  );
}
