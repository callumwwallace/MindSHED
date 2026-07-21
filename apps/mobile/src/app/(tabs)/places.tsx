import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceVignette } from '@/components/ms/place-vignette';
import { Body, BodyBold, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

export default function PlacesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}>
      <BodyBold size={10} color={MS.color.forestMuted}>GARDEN PATHS</BodyBold>
      <Display size={31} color={MS.color.inkSoft} style={{ marginTop: 2 }}>Places</Display>
      <Body size={11.5} color={MS.color.muted} style={{ marginTop: 2 }}>
        Go somewhere that matches what you need.
      </Body>

      <Pressable
        onPress={() => router.push('/breathe')}
        accessibilityRole="button"
        accessibilityLabel="Go to the bench for a breathing session"
        style={({ pressed }) => ({
          marginTop: 20,
          minHeight: 254,
          borderRadius: MS.radius.xl,
          backgroundColor: '#D9E8E2',
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}>
        <PlaceVignette variant="bench" height={122} />
        <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16 }}>
          <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>THE BENCH</BodyBold>
          <Heading size={21} color={MS.color.inkSoft} style={{ marginTop: 3 }}>Breathe together</Heading>
          <Body size={11.5} color={MS.color.muted} style={{ marginTop: 4, maxWidth: 290 }}>Sit beside Bramble while the garden follows a slow, visible rhythm.</Body>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <Feather name="wind" size={14} color={MS.color.forest} />
            <BodyBold size={10.5} color={MS.color.forest}>2–10 minutes</BodyBold>
          </View>
        </View>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Pressable
          onPress={() => router.push('/journal')}
          accessibilityRole="button"
          accessibilityLabel="Go inside the shed to journal"
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 218,
            borderRadius: MS.radius.xl,
            backgroundColor: '#F2D7B8',
            padding: 16,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}>
          <View style={{ marginHorizontal: -16, marginTop: -16, borderTopLeftRadius: MS.radius.xl, borderTopRightRadius: MS.radius.xl, overflow: 'hidden' }}><PlaceVignette variant="shed" height={100} showBramble={false} /></View>
          <BodyBold size={9.5} color={MS.color.forestMuted} style={{ marginTop: 10 }}>THE SHED</BodyBold>
          <Heading size={17} color={MS.color.inkSoft} style={{ marginTop: 3 }}>Write while Bramble rests</Heading>
          <Body size={10.5} color={MS.color.muted} style={{ marginTop: 4 }}>A private room for a few words.</Body>
        </Pressable>

        <Pressable
          onPress={() => router.push('/activities')}
          accessibilityRole="button"
          accessibilityLabel="Go through the gate to choose an activity"
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 218,
            borderRadius: MS.radius.xl,
            backgroundColor: MS.color.sageSoft,
            padding: 16,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}>
          <View style={{ marginHorizontal: -16, marginTop: -16, borderTopLeftRadius: MS.radius.xl, borderTopRightRadius: MS.radius.xl, overflow: 'hidden' }}><PlaceVignette variant="gate" height={100} showBramble={false} /></View>
          <BodyBold size={9.5} color={MS.color.forestMuted} style={{ marginTop: 10 }}>THE GATE</BodyBold>
          <Heading size={17} color={MS.color.inkSoft} style={{ marginTop: 3 }}>Choose something together</Heading>
          <Body size={10.5} color={MS.color.muted} style={{ marginTop: 4 }}>Bramble can carry one small action back.</Body>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/grounding')}
        accessibilityRole="button"
        accessibilityLabel="Walk the five senses path"
        style={({ pressed }) => ({ marginTop: 10, minHeight: 190, borderRadius: MS.radius.xl, backgroundColor: '#E6E9D2', overflow: 'hidden', opacity: pressed ? 0.68 : 1 })}>
        <PlaceVignette variant="path" height={104} showBramble={false} />
        <View style={{ paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}><BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.1 }}>THE PATH</BodyBold><Heading size={17} color={MS.color.inkSoft} style={{ marginTop: 2 }}>Walk the five senses</Heading><Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>Notice each step with Bramble. There is no timer.</Body></View>
        </View>
      </Pressable>

      <View style={{ height: 1, backgroundColor: `${MS.color.ink}10`, marginVertical: 22 }} />

      <Pressable onPress={() => router.push('/support')} accessibilityRole="button" accessibilityLabel="Open support from real people and urgent resources" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: '#F8DFD7', alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="life-buoy" size={17} color={MS.color.danger} />
        </View>
        <View style={{ flex: 1 }}>
          <BodyBold size={12.5}>Need support now?</BodyBold>
          <Body size={10.5} color={MS.color.muted}>Real people and urgent resources.</Body>
        </View>
        <Feather name="arrow-up-right" size={15} color={MS.color.forestMuted} />
      </Pressable>
    </ScrollView>
  );
}
