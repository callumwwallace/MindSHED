import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RiveBox } from '@/components/ms/bramble-rive';
import { Card } from '@/components/ms/card';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

// Dev-only screen proving the Rive runtime works in the native build.
// The animation below is Rive's public demo file streamed by URL; Bramble's
// own rig replaces it once authored (see docs/BRAMBLE-RIG.md).
export default function RiveTestScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 14, padding: 18, paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            backgroundColor: MS.color.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Feather name="arrow-left" size={15} color={MS.color.ink} />
        </Pressable>
        <Heading size={18}>Rive pipeline test</Heading>
      </View>
      <Card padding={10}>
        <RiveBox url="https://cdn.rive.app/animations/vehicles.riv" height={240} />
      </Card>
      <Card color={MS.color.mint} padding={12} style={{ marginTop: 12 }}>
        <BodyBold size={13}>If something is animating above, the pipeline works.</BodyBold>
        <Body size={12} style={{ marginTop: 4 }}>
          That file streams from Rive&apos;s public CDN. Bramble&apos;s own rig gets built in
          the Rive editor (spec: docs/BRAMBLE-RIG.md), exported as bramble.riv, and
          dropped into assets/rive — then he replaces the static drawing everywhere.
        </Body>
      </Card>
    </ScrollView>
  );
}
