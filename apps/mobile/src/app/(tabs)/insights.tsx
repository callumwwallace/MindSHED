import Feather from '@expo/vector-icons/Feather';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { Bramble } from '@/components/ms/bramble';
import { Card } from '@/components/ms/card';
import { HeaderPill } from '@/components/ms/header-pill';
import { Body, BodyBold } from '@/components/ms/text';
import { MOODS, MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

function MoodChart({ moods }: { moods: number[] }) {
  const n = moods.length;
  const pts = moods.map((m, i) => ({
    x: n === 1 ? 150 : 20 + (i * 260) / (n - 1),
    y: 86 - ((m - 1) / 4) * 64,
  }));
  return (
    <Svg width="100%" height={100} viewBox="0 0 300 100">
      <Polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={MS.color.ink}
        strokeWidth="2.5"
      />
      {pts.map((p, i) => (
        <Circle
          key={`p${p.x}`}
          cx={p.x}
          cy={p.y}
          r="6"
          fill={MOODS[(moods[i] ?? 3) - 1]?.color ?? MS.color.yellow}
          stroke={MS.color.ink}
          strokeWidth="2"
        />
      ))}
    </Svg>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const checkins = useWellness((s) => s.checkins);
  const recent = [...checkins].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const moods = recent.map((c) => c.mood);

  let trendText = 'Check in for a few days and patterns will start appearing here.';
  if (moods.length >= 3) {
    const half = Math.floor(moods.length / 2);
    const early = moods.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const late = moods.slice(half).reduce((a, b) => a + b, 0) / (moods.length - half);
    trendText =
      late - early > 0.3
        ? 'Your week is trending brighter — whatever you changed, keep it up.'
        : early - late > 0.3
          ? "A heavier patch this week. Be gentle with yourself — small things count double."
          : 'A steady week. Steady is underrated.';
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, padding: 16, paddingBottom: 32 }}>
      <HeaderPill title="Bramble's notebook" />
      <Card style={{ marginTop: 16 }}>
        <BodyBold size={11} color={MS.color.faint} style={{ marginBottom: 6 }}>
          YOUR WEEK, AS I SAW IT
        </BodyBold>
        {moods.length >= 2 ? (
          <MoodChart moods={moods} />
        ) : (
          <Body size={13} color={MS.color.muted}>
            Two check-ins and the line begins. The notebook fills itself from there.
          </Body>
        )}
      </Card>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 14 }}>
        <Bramble size={72} mood="happy" />
        <Card
          color={MS.color.mint}
          padding={12}
          style={{ flex: 1, borderBottomLeftRadius: 2, marginBottom: 6 }}>
          <Body size={13}>{trendText}</Body>
        </Card>
      </View>
      <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Feather name="mail" size={20} color={MS.color.ink} />
        <View style={{ flex: 1 }}>
          <BodyBold size={13}>Wellbeing pulse</BodyBold>
          <Body size={12} color={MS.color.muted}>
            Your first letter arrives once the post is running (v1 backend).
          </Body>
        </View>
      </Card>
    </ScrollView>
  );
}
