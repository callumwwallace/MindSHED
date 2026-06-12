import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bramble } from '@/components/ms/bramble';
import { Card } from '@/components/ms/card';
import { Garden } from '@/components/ms/garden';
import { MoodPicker } from '@/components/ms/mood-picker';
import { SpeechBubble } from '@/components/ms/speech-bubble';
import { TaskRow } from '@/components/ms/task-row';
import { BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useTodayCheckin, useWellness } from '@/store/wellness';

function todayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const checkin = useTodayCheckin();
  const tasks = useWellness((s) => s.tasks);
  const flowers = useWellness((s) => s.flowers);
  const bloomPending = useWellness((s) => s.bloomPending);
  const toggleTask = useWellness((s) => s.toggleTask);
  const clearBloom = useWellness((s) => s.clearBloom);
  const ensureToday = useWellness((s) => s.ensureToday);

  useEffect(() => {
    ensureToday();
  }, [ensureToday]);

  useEffect(() => {
    if (bloomPending) {
      const t = setTimeout(clearBloom, 6000);
      return () => clearTimeout(t);
    }
  }, [bloomPending, clearBloom]);

  const doneCount = tasks.filter((t) => t.done).length;
  const bubbleText = checkin
    ? flowers <= 1
      ? 'Look at that — our first flower!'
      : 'The garden is loving this week.'
    : flowers === 0
      ? "Bit empty, eh? We'll grow it together."
      : 'Morning! Fancy a check-in?';

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.sky }}>
      <View style={{ height: 320 }}>
        <Garden flowers={flowers} />
        <View
          style={{
            position: 'absolute',
            top: insets.top + 6,
            left: 16,
            right: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: MS.color.white,
              borderWidth: MS.border,
              borderColor: MS.color.ink,
              borderRadius: 14,
              paddingVertical: 5,
              paddingHorizontal: 14,
            }}>
            <Heading size={14}>{todayLabel()}</Heading>
          </View>
          <View
            style={{
              backgroundColor: MS.color.white,
              borderWidth: MS.border,
              borderColor: MS.color.ink,
              borderRadius: 16,
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Feather name="bell" size={16} color={MS.color.ink} />
          </View>
        </View>
        <View style={{ position: 'absolute', bottom: 58, left: 24 }}>
          <Bramble size={110} mood={checkin ? 'happy' : 'calm'} />
        </View>
        <SpeechBubble
          text={bubbleText}
          style={{ position: 'absolute', bottom: 132, left: 120, maxWidth: 180 }}
        />
        {bloomPending && (
          <Card
            color={MS.color.white}
            padding={10}
            style={{
              position: 'absolute',
              top: insets.top + 50,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
            <Feather name="sun" size={16} color={MS.color.ink} />
            <BodyBold size={13}>Check-in done — you planted a flower</BodyBold>
          </Card>
        )}
      </View>

      <ScrollView
        style={{
          flex: 1,
          marginTop: -24,
          backgroundColor: MS.color.cream,
          borderTopWidth: MS.border,
          borderColor: MS.color.ink,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <View
          style={{
            width: 44,
            height: 5,
            backgroundColor: MS.color.ink,
            opacity: 0.25,
            borderRadius: 3,
            alignSelf: 'center',
            marginBottom: 10,
          }}
        />
        <Heading size={17} style={{ marginBottom: 10 }}>
          How are you feeling?
        </Heading>
        <MoodPicker
          value={checkin?.mood}
          onChange={(mood) => router.push({ pathname: '/check-in', params: { mood: String(mood) } })}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 18,
            marginBottom: 10,
          }}>
          <Heading size={16}>Today&apos;s plan</Heading>
          <BodyBold size={12} color={MS.color.muted}>
            {doneCount} of {tasks.length} done
          </BodyBold>
        </View>
        <View style={{ gap: 9 }}>
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              title={t.title}
              icon={t.icon}
              color={t.color}
              done={t.done}
              onToggle={() => toggleTask(t.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
