import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ms/card';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

const RESOURCES = [
  {
    name: 'University counselling',
    detail: 'Free and confidential — book through student services.',
    action: null,
    actionLabel: null,
  },
  {
    name: 'Samaritans',
    detail: 'Whatever you are going through. Free, 24/7.',
    action: 'tel:116123',
    actionLabel: 'Call 116 123',
  },
  {
    name: 'NHS 111',
    detail: 'Urgent but not life-threatening help, any hour.',
    action: 'tel:111',
    actionLabel: 'Call 111',
  },
  {
    name: 'Shout',
    detail: 'Text-based support if talking feels like too much.',
    action: 'sms:85258',
    actionLabel: 'Text 85258',
  },
] as const;

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 16, padding: 18, paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
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
          <Feather name="x" size={15} color={MS.color.ink} />
        </Pressable>
        <Heading size={18}>Support, right now</Heading>
      </View>
      <Body size={13} color={MS.color.muted} style={{ marginBottom: 14 }}>
        However today is going, you don&apos;t have to sort it alone. These are real people,
        and they want to hear from you.
      </Body>
      <View style={{ gap: 10 }}>
        {RESOURCES.map((r) => (
          <Card key={r.name} padding={14}>
            <BodyBold size={14}>{r.name}</BodyBold>
            <Body size={12} color={MS.color.muted} style={{ marginTop: 2 }}>
              {r.detail}
            </Body>
            {r.action && (
              <Pressable
                onPress={() => Linking.openURL(r.action)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 9,
                  backgroundColor: MS.color.mint,
                  borderWidth: MS.border,
                  borderColor: MS.color.ink,
                  borderRadius: 12,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                }}>
                <BodyBold size={12}>{r.actionLabel}</BodyBold>
              </Pressable>
            )}
          </Card>
        ))}
      </View>
      <Body size={11} color={MS.color.faint} style={{ marginTop: 16, textAlign: 'center' }}>
        If you or someone else is in immediate danger, call 999.
      </Body>
    </ScrollView>
  );
}
