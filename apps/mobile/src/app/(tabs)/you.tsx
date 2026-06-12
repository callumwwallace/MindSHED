import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ms/card';
import { HeaderPill } from '@/components/ms/header-pill';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { trpc } from '@/lib/trpc';
import { useWellness } from '@/store/wellness';

const SETTINGS = [
  { icon: 'bell', label: 'Notifications — one nudge a day' },
  { icon: 'lock', label: 'Data & privacy' },
  { icon: 'download', label: 'Export my data' },
  { icon: 'life-buoy', label: 'Help & resources' },
] as const;

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const daysOfCare = useWellness((s) => s.checkins.length);
  const ping = trpc.health.ping.useQuery(undefined, { retry: 1 });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, padding: 16, paddingBottom: 32 }}>
      <HeaderPill title="You" />
      <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            backgroundColor: MS.color.mint,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Heading size={18}>C</Heading>
        </View>
        <View style={{ flex: 1 }}>
          <BodyBold size={15}>Callum</BodyBold>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: MS.color.yellow,
              borderWidth: 1.5,
              borderColor: MS.color.ink,
              borderRadius: 9,
              paddingHorizontal: 8,
              marginTop: 3,
            }}>
            <BodyBold size={10}>Dental pilot</BodyBold>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Heading size={18}>{daysOfCare}</Heading>
          <Body size={10} color={MS.color.muted}>
            days of care
          </Body>
        </View>
      </Card>
      <Card color={MS.color.mint} padding={12} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <Feather name="mail" size={16} color={MS.color.ink} />
        <BodyBold size={12}>Wellbeing pulse letters start with the pilot</BodyBold>
      </Card>
      <View style={{ gap: 9, marginTop: 12 }}>
        {SETTINGS.map((s) => (
          <Card
            key={s.label}
            padding={12}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Feather name={s.icon as never} size={16} color={MS.color.ink} />
            <Body size={13} style={{ flex: 1 }}>
              {s.label}
            </Body>
            <Feather name="chevron-right" size={15} color={MS.color.faint} />
          </Card>
        ))}
      </View>
      <Pressable onPress={() => router.push('/rive-test' as never)} style={{ marginTop: 12 }}>
        <Card padding={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Feather name="play-circle" size={16} color={MS.color.ink} />
          <Body size={13} style={{ flex: 1 }}>
            Rive pipeline test (dev)
          </Body>
          <Feather name="chevron-right" size={15} color={MS.color.faint} />
        </Card>
      </Pressable>
      <Body size={11} color={MS.color.faint} style={{ marginTop: 16, textAlign: 'center' }}>
        API: {ping.isLoading ? 'checking…' : ping.data?.ok ? 'connected' : 'offline (fine for now)'}
      </Body>
    </ScrollView>
  );
}
