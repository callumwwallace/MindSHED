import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ms/card';
import { HeaderPill } from '@/components/ms/header-pill';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

interface Place {
  title: string;
  sub: string;
  icon: string;
  tileColor: string;
  route?: string;
  brambleHere?: boolean;
  soon?: boolean;
}

const PLACES: Place[] = [
  {
    title: 'The bench',
    sub: 'Breathe together · 2–10 min',
    icon: 'wind',
    tileColor: MS.color.dusk,
    route: '/breathe',
    brambleHere: true,
  },
  {
    title: 'Inside the shed',
    sub: 'Your journal · locked to you',
    icon: 'book-open',
    tileColor: MS.color.orange,
    route: '/journal',
  },
  {
    title: 'Through the gate',
    sub: 'Activities · small wins',
    icon: 'compass',
    tileColor: MS.color.mintSoft,
    route: '/activities',
  },
  {
    title: 'The old radio',
    sub: 'Rain · ocean · campfire',
    icon: 'music',
    tileColor: MS.color.skyDeep,
    soon: true,
  },
];

export default function PlacesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, padding: 16, paddingBottom: 32 }}>
      <HeaderPill title="Places" />
      <View style={{ gap: 10, marginTop: 16 }}>
        {PLACES.map((p) => (
          <Pressable
            key={p.title}
            disabled={p.soon}
            onPress={() => p.route && router.push(p.route as never)}>
            <Card
              padding={10}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: p.soon ? 0.55 : 1,
              }}>
              <View
                style={{
                  width: 52,
                  height: 44,
                  borderRadius: 10,
                  borderWidth: MS.border,
                  borderColor: MS.color.ink,
                  backgroundColor: p.tileColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Feather name={p.icon as never} size={20} color={MS.color.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Heading size={15}>{p.title}</Heading>
                  {p.brambleHere && (
                    <View
                      style={{
                        backgroundColor: MS.color.yellow,
                        borderWidth: 1.5,
                        borderColor: MS.color.ink,
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                      }}>
                      <BodyBold size={10}>Bramble&apos;s here</BodyBold>
                    </View>
                  )}
                  {p.soon && (
                    <View
                      style={{
                        backgroundColor: MS.color.white,
                        borderWidth: 1.5,
                        borderColor: MS.color.ink,
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                      }}>
                      <BodyBold size={10}>soon</BodyBold>
                    </View>
                  )}
                </View>
                <Body size={12} color={MS.color.muted}>
                  {p.sub}
                </Body>
              </View>
              <Feather name="chevron-right" size={17} color={MS.color.ink} />
            </Card>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => router.push('/support')} style={{ marginTop: 14 }}>
        <View
          style={{
            borderWidth: MS.border,
            borderColor: MS.color.danger,
            borderRadius: MS.radius.lg,
            backgroundColor: MS.color.white,
            padding: 13,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <Feather name="life-buoy" size={20} color={MS.color.danger} />
          <View style={{ flex: 1 }}>
            <BodyBold size={13}>Need support now?</BodyBold>
            <Body size={11} color={MS.color.muted}>
              Uni counselling · Samaritans · NHS 111
            </Body>
          </View>
          <Feather name="chevron-right" size={16} color={MS.color.ink} />
        </View>
      </Pressable>
    </ScrollView>
  );
}
