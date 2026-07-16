import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Alert, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

const RESOURCES = [
  {
    icon: 'phone-call',
    name: 'Samaritans',
    detail: 'Free listening at any hour, day or night.',
    action: 'tel:116123',
    actionLabel: 'Call 116 123',
  },
  {
    icon: 'message-circle',
    name: 'Shout',
    detail: 'Free, confidential 24/7 support by text in the UK.',
    action: Platform.OS === 'ios' ? 'sms:85258&body=SHOUT' : 'sms:85258?body=SHOUT',
    actionLabel: 'Text SHOUT to 85258',
  },
  {
    icon: 'heart',
    name: 'NHS 111 (England)',
    detail: 'Urgent mental health support; select the mental health option.',
    action: 'tel:111',
    actionLabel: 'Call 111',
  },
] as const;

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  const open = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('unsupported');
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open this option', 'Your device could not start the call or message. Please use the number shown on screen instead.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Close support"
          accessibilityRole="button"
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="x" size={16} color={MS.color.forest} />
        </Pressable>
        <BodyBold size={9.5} color={MS.color.forestMuted} style={{ marginLeft: 12, letterSpacing: 1.3 }}>REAL PEOPLE, RIGHT NOW</BodyBold>
      </View>

      <Heading size={25} color={MS.color.inkSoft} style={{ marginTop: 22 }}>You do not have to hold this alone</Heading>
      <Body size={12} color={MS.color.muted} style={{ marginTop: 6, maxWidth: 330 }}>
        Choose whichever way of reaching someone feels most manageable. You do not need the right words.
      </Body>

      <Pressable
        onPress={() => open('tel:999')}
        accessibilityRole="button"
        accessibilityLabel="Call 999 for immediate danger or risk to life"
        style={({ pressed }) => ({ marginTop: 22, borderRadius: MS.radius.xl, backgroundColor: '#F8DFD7', padding: 16, opacity: pressed ? 0.68 : 1 })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,254,247,0.64)', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="alert-circle" size={17} color={MS.color.danger} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <BodyBold size={12.5} color={MS.color.inkSoft}>Immediate danger or risk to life</BodyBold>
            <Body size={10.5} color={MS.color.muted}>Call emergency services now.</Body>
          </View>
          <BodyBold size={12} color={MS.color.danger}>Call 999</BodyBold>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push('/grounding')}
        accessibilityRole="button"
        style={({ pressed }) => ({ marginTop: 12, borderRadius: MS.radius.xl, backgroundColor: '#DDECEF', padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.68 : 1 })}>
        <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,254,247,0.66)', alignItems: 'center', justifyContent: 'center' }}><Feather name="anchor" size={17} color={MS.color.forest} /></View>
        <View style={{ flex: 1 }}><BodyBold size={12} color={MS.color.inkSoft}>Need a steadier moment while you decide?</BodyBold><Body size={10.5} color={MS.color.muted}>Try an untimed grounding exercise. It is not a substitute for urgent help.</Body></View>
        <Feather name="chevron-right" size={16} color={MS.color.forestMuted} />
      </Pressable>

      <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.3, marginTop: 26, marginBottom: 8 }}>TALK TO SOMEONE</BodyBold>
      <View style={{ borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, paddingHorizontal: 15 }}>
        {RESOURCES.map((resource, index) => (
          <View key={resource.name} style={{ paddingVertical: 16, borderBottomWidth: index < RESOURCES.length - 1 ? 1 : 0, borderBottomColor: `${MS.color.ink}0F` }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={resource.icon} size={16} color={MS.color.forest} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <BodyBold size={13} color={MS.color.inkSoft}>{resource.name}</BodyBold>
                <Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>{resource.detail}</Body>
                <Pressable
                  onPress={() => open(resource.action)}
                  accessibilityRole="button"
                  style={({ pressed }) => ({ alignSelf: 'flex-start', marginTop: 10, borderRadius: 16, backgroundColor: MS.color.forest, paddingVertical: 7, paddingHorizontal: 13, opacity: pressed ? 0.7 : 1 })}>
                  <BodyBold size={10.5} color={MS.color.surface}>{resource.actionLabel}</BodyBold>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 18, borderRadius: MS.radius.lg, backgroundColor: MS.color.sageSoft, padding: 15 }}>
        <BodyBold size={11.5} color={MS.color.inkSoft}>University wellbeing service</BodyBold>
        <Body size={10.5} color={MS.color.muted} style={{ marginTop: 3 }}>
          University of Plymouth Student Wellbeing Services is not an emergency service and may take up to five working days to respond.
        </Body>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 11 }}>
          <Pressable onPress={() => open('tel:+441752587676')} accessibilityRole="button" style={{ borderRadius: 15, backgroundColor: MS.color.forest, paddingVertical: 8, paddingHorizontal: 12 }}><BodyBold size={10.5} color={MS.color.surface}>Call 01752 587676</BodyBold></Pressable>
          <Pressable onPress={() => open('mailto:studentservices@plymouth.ac.uk')} accessibilityRole="button" style={{ borderRadius: 15, backgroundColor: MS.color.surface, paddingVertical: 8, paddingHorizontal: 12 }}><BodyBold size={10.5} color={MS.color.forest}>Email Student Services</BodyBold></Pressable>
        </View>
      </View>

      <Body size={9.5} color={MS.color.faint} style={{ marginTop: 18, textAlign: 'center' }}>
        NHS 111 mental health routing shown is England-specific. MindSHED is not an emergency or clinical service.
      </Body>
    </ScrollView>
  );
}
