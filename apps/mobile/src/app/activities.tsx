import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ms/card';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

interface Activity {
  id: string;
  title: string;
  category: string;
  duration: string;
  icon: string;
  color: string;
}

const ACTIVITIES: Activity[] = [
  { id: 'a1', title: 'Walk a different route home', category: 'Physical', duration: '15 min', icon: 'map', color: MS.color.mint },
  { id: 'a2', title: 'Call someone from home', category: 'Social', duration: '10 min', icon: 'phone', color: MS.color.yellow },
  { id: 'a3', title: 'Phone-free lunch', category: 'Mental', duration: '30 min', icon: 'smartphone', color: MS.color.skyDeep },
  { id: 'a4', title: 'Lights out by 11 tonight', category: 'Rest', duration: 'tonight', icon: 'moon', color: MS.color.orange },
  { id: 'a5', title: 'Tidy one small corner', category: 'Mental', duration: '10 min', icon: 'home', color: MS.color.mintSoft },
  { id: 'a6', title: 'Stretch for five minutes', category: 'Physical', duration: '5 min', icon: 'activity', color: MS.color.red },
  { id: 'a7', title: 'Message a coursemate', category: 'Social', duration: '5 min', icon: 'message-circle', color: MS.color.yellow },
  { id: 'a8', title: 'Drink water before coffee', category: 'Physical', duration: '1 min', icon: 'droplet', color: MS.color.skyDeep },
];

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const addTask = useWellness((s) => s.addTask);
  const [added, setAdded] = useState<string[]>([]);

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.cream }}>
      <View
        style={{
          backgroundColor: MS.color.hill,
          borderBottomWidth: MS.border,
          borderColor: MS.color.ink,
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            backgroundColor: MS.color.cream,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Feather name="arrow-left" size={15} color={MS.color.ink} />
        </Pressable>
        <Heading size={17} style={{ flex: 1 }}>
          Through the gate
        </Heading>
        <BodyBold size={11} color={MS.color.muted}>
          tap + to add to today
        </BodyBold>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 9 }}>
        {ACTIVITIES.map((a) => {
          const isAdded = added.includes(a.id);
          return (
            <Card
              key={a.id}
              color={a.color}
              padding={12}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Feather name={a.icon as never} size={17} color={MS.color.ink} />
              <View style={{ flex: 1 }}>
                <BodyBold size={13}>{a.title}</BodyBold>
                <Body size={11} color={MS.color.muted}>
                  {a.category} · {a.duration}
                </Body>
              </View>
              <Pressable
                disabled={isAdded}
                onPress={() => {
                  addTask(a.title, a.icon, a.color);
                  setAdded((prev) => [...prev, a.id]);
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  borderWidth: MS.border,
                  borderColor: MS.color.ink,
                  backgroundColor: MS.color.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Feather name={isAdded ? 'check' : 'plus'} size={16} color={MS.color.ink} />
              </Pressable>
            </Card>
          );
        })}
        <Body size={11} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 6 }}>
          Added activities land in today&apos;s plan — Bramble carts them home.
        </Body>
      </ScrollView>
    </View>
  );
}
