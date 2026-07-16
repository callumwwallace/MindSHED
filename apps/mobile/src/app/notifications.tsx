import Feather from '@expo/vector-icons/Feather';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 36 }}>
      <ScreenHeader eyebrow="From the garden" title="Garden notes" description="A quiet inbox is not part of the current pilot." />
      <View style={{ marginTop: 60, alignItems: 'center', paddingHorizontal: 28 }}>
        <View style={{ width: 72, height: 72, borderRadius: 25, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="inbox" size={27} color={MS.color.forestMuted} />
        </View>
        <Heading size={19} color={MS.color.inkSoft} style={{ marginTop: 18 }}>Nothing waiting for you</Heading>
        <Body size={12} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 7, lineHeight: 19 }}>
          MindSHED has no in-app inbox and does not receive remote push messages. If you choose a daily nudge, it is scheduled privately on this device.
        </Body>
      </View>
    </ScrollView>
  );
}
