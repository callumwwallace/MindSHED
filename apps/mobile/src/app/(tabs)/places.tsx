import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderPill } from '@/components/ms/header-pill';
import { PlaceVignette } from '@/components/ms/place-vignette';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

export default function PlacesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}>
      <HeaderPill title="Places" size={23} />
      <Body size={12} color={MS.color.muted} style={{ marginTop: 6 }}>
        Go somewhere that matches what you need.
      </Body>

      <Pressable
        onPress={() => router.push('/breathe')}
        accessibilityRole="button"
        accessibilityLabel="Go to the bench for a breathing session"
        style={({ pressed }) => ({
          marginTop: 22,
          minHeight: 232,
          borderRadius: MS.radius.xl,
          backgroundColor: '#D9E8E2',
          padding: 18,
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}>
        <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>THE BENCH</BodyBold>
        <Heading size={21} color={MS.color.inkSoft} style={{ marginTop: 3 }}>Breathe together</Heading>
        <Body size={11.5} color={MS.color.muted} style={{ marginTop: 4, maxWidth: 290 }}>Sit beside Bramble while the garden follows a slow, visible rhythm.</Body>
        <View style={{ marginHorizontal: -18, marginTop: 2 }}><PlaceVignette variant="bench" height={100} /></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Feather name="wind" size={14} color={MS.color.forest} />
          <BodyBold size={10.5} color={MS.color.forest}>2–10 minutes</BodyBold>
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
          <View style={{ marginHorizontal: -16, marginTop: -16, borderTopLeftRadius: MS.radius.xl, borderTopRightRadius: MS.radius.xl, overflow: 'hidden' }}><PlaceVignette variant="shed" height={100} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}><Feather name="book-open" size={14} color={MS.color.inkSoft} /><BodyBold size={9.5} color={MS.color.forestMuted}>THE SHED</BodyBold></View>
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
          <View style={{ marginHorizontal: -16, marginTop: -16, borderTopLeftRadius: MS.radius.xl, borderTopRightRadius: MS.radius.xl, overflow: 'hidden' }}><PlaceVignette variant="gate" height={100} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}><Feather name="compass" size={14} color={MS.color.forest} /><BodyBold size={9.5} color={MS.color.forestMuted}>THE GATE</BodyBold></View>
          <Heading size={17} color={MS.color.inkSoft} style={{ marginTop: 3 }}>Choose something together</Heading>
          <Body size={10.5} color={MS.color.muted} style={{ marginTop: 4 }}>Bramble can carry one small action back.</Body>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/grounding')}
        accessibilityRole="button"
        style={({ pressed }) => ({ marginTop: 10, minHeight: 128, borderRadius: MS.radius.xl, backgroundColor: '#E6E9D2', padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden', opacity: pressed ? 0.62 : 1 })}>
        <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(255,254,247,0.62)', alignItems: 'center', justifyContent: 'center' }}><Feather name="anchor" size={16} color={MS.color.forest} /></View>
        <View style={{ flex: 1 }}><BodyBold size={12.5} color={MS.color.inkSoft}>Walk the five senses path</BodyBold><Body size={10.5} color={MS.color.muted}>Bramble notices each step with you. There is no timer.</Body></View>
        <View style={{ width: 116, alignSelf: 'stretch', justifyContent: 'flex-end' }}><PlaceVignette variant="path" height={98} /></View>
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
