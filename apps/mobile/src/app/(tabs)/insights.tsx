import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AnimatedBramble } from '@/components/ms/animated-bramble';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MOODS, MS } from '@/constants/mindshed';
import { calendarDays, findHealthContextDifferences } from '@/lib/health-context';
import { useWellness, type Checkin, type HealthDailySummary } from '@/store/wellness';

type WeekDay = ReturnType<typeof calendarDays>[number] & { checkin?: Checkin };
type Point = { x: number; y: number };

function weekDays(checkins: Checkin[]): WeekDay[] {
  const byDate = new Map(checkins.map((checkin) => [checkin.date, checkin]));
  return calendarDays(7).map((day) => ({ ...day, checkin: byDate.get(day.key) }));
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function weeklySummary(days: WeekDay[]) {
  const recorded = days.flatMap((day) => day.checkin ? [day.checkin] : []);
  if (!recorded.length) return { mood: 'Waiting', energy: 'Waiting', pressure: 'Waiting' };
  const mood = average(recorded.map((item) => item.mood));
  const energy = average(recorded.map((item) => item.energy));
  const pressure = average(recorded.map((item) => item.stress));
  return {
    mood: mood < 2 ? 'Very low' : mood < 3 ? 'Low' : mood < 4 ? 'Okay' : mood < 4.7 ? 'Good' : 'Great',
    energy: energy < 3.5 ? 'Low' : energy < 7 ? 'Steady' : 'Fuller',
    pressure: pressure < 3.5 ? 'Light' : pressure < 7 ? 'Present' : 'Heavy',
  };
}

function pointFor(day: WeekDay, index: number): Point | undefined {
  if (!day.checkin) return undefined;
  return { x: 24 + index * 45.3, y: 77 - (day.checkin.mood - 1) * 13 };
}

function chartSegments(days: WeekDay[]) {
  const segments: Point[][] = [];
  let current: Point[] = [];
  days.forEach((day, index) => {
    const point = pointFor(day, index);
    if (point) current.push(point);
    else if (current.length) {
      segments.push(current);
      current = [];
    }
  });
  if (current.length) segments.push(current);
  return segments;
}

function takeaway(checkins: Checkin[], health: HealthDailySummary[]) {
  const recentDates = new Set(calendarDays(21).map((day) => day.key));
  const recent = checkins.filter((checkin) => recentDates.has(checkin.date));
  const difference = findHealthContextDifferences(recent, health)[0];
  if (difference) return difference.detail;
  const highPressure = recent.filter((checkin) => checkin.stress >= 7).length;
  if (highPressure >= 3) return `Pressure felt heavy on ${highPressure} recent days. Go gently.`;
  const latest = [...recent].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latest?.stress >= 7) return 'Your latest check-in held a lot of pressure. Go gently.';
  if (recent.length < 3) return 'A few more check-ins will make the picture clearer.';
  return 'Nothing is demanding attention right now.';
}

function PondBackdrop() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 390 680" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="sceneSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C8E4E3" />
          <Stop offset="1" stopColor="#EAE8CE" />
        </LinearGradient>
        <LinearGradient id="sceneWater" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#A8D3CC" />
          <Stop offset="0.55" stopColor="#70A8A7" />
          <Stop offset="1" stopColor="#4B7C7E" />
        </LinearGradient>
        <LinearGradient id="sceneBank" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#96B77B" />
          <Stop offset="1" stopColor="#5F7D5D" />
        </LinearGradient>
      </Defs>

      <Rect width="390" height="680" fill="url(#sceneSky)" />
      <Circle cx="326" cy="58" r="25" fill="#F0D47D" opacity="0.83" />
      <G fill="#FFFDF4" opacity="0.58"><Ellipse cx="82" cy="62" rx="40" ry="11" /><Ellipse cx="112" cy="59" rx="24" ry="9" /></G>
      <Path d="M-18 136 Q48 82 110 128 Q168 69 229 129 Q298 82 408 136 V216 H-18 Z" fill="#809A92" />
      <Path d="M-18 169 Q65 116 148 163 Q229 106 408 166 V232 H-18 Z" fill="#A5BD9A" />
      <Path d="M-12 203 C47 157 121 158 190 181 C257 154 343 160 404 204 C421 281 402 374 348 426 C264 467 125 468 39 429 C-14 378 -29 281 -12 203 Z" fill="url(#sceneWater)" stroke="#DDE9D7" strokeWidth="3" />
      <Path d="M-6 230 Q70 197 149 224 Q231 251 397 213" stroke="#E5F0E6" strokeWidth="2" opacity="0.35" fill="none" />
      <Path d="M12 299 Q92 276 168 299 T378 292 M33 365 Q112 343 188 367 T359 359" stroke="#D9E9E2" strokeWidth="2" opacity="0.42" fill="none" strokeLinecap="round" />

      <G fill="#6D9365" stroke="#486C50" strokeWidth="1.3">
        <Ellipse cx="302" cy="299" rx="20" ry="8.5" />
        <Ellipse cx="328" cy="318" rx="12" ry="5" />
        <Ellipse cx="73" cy="337" rx="15" ry="6" />
      </G>
      <Circle cx="301" cy="295" r="3" fill="#E7D58C" />
      <G stroke="#416B50" strokeWidth="3" fill="none" strokeLinecap="round">
        <Path d="M22 262 Q17 211 25 175 M34 266 Q43 215 57 183 M367 269 Q366 213 377 172 M380 274 Q390 226 402 195" />
      </G>
      <G fill="#8A7047"><Ellipse cx="25" cy="177" rx="4" ry="11" /><Ellipse cx="57" cy="185" rx="4" ry="11" /><Ellipse cx="377" cy="174" rx="4" ry="11" /></G>

      <Path d="M-18 410 Q66 369 144 408 Q216 448 291 407 Q347 377 408 398 V696 H-18 Z" fill="url(#sceneBank)" />
      <Path d="M-18 470 Q64 430 141 467 Q226 509 408 452 V696 H-18 Z" fill="#668463" opacity="0.72" />
      <G stroke="#456B4A" strokeWidth="2.7" fill="none" strokeLinecap="round">
        <Path d="M18 493 Q14 452 20 421 M31 497 Q42 454 55 429 M339 491 Q345 451 357 418 M356 494 Q371 450 385 431" />
      </G>
      <Ellipse cx="106" cy="552" rx="55" ry="14" fill="#789A6C" opacity="0.75" />
      <Ellipse cx="292" cy="594" rx="67" ry="16" fill="#789A6C" opacity="0.68" />
    </Svg>
  );
}

function WeeklyChart({ days }: { days: WeekDay[] }) {
  const recorded = days.filter((day) => day.checkin).length;
  const summary = weeklySummary(days);
  const segments = chartSegments(days);

  return (
    <View style={{ position: 'absolute', left: 15, right: 15, bottom: 14, borderRadius: 27, backgroundColor: 'rgba(255,253,246,0.96)', paddingTop: 16, paddingHorizontal: 16, paddingBottom: 13, shadowColor: '#294638', shadowOpacity: 0.13, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <BodyBold size={9.5} color={MS.color.forestMuted}>LAST SEVEN DAYS</BodyBold>
          <Heading size={17} color={MS.color.inkSoft} style={{ marginTop: 1 }}>Mood over the week</Heading>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: MS.color.sageSoft }}>
          <BodyBold size={9.5} color={MS.color.forest}>{recorded} check-in{recorded === 1 ? '' : 's'}</BodyBold>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Svg width="100%" height={112} viewBox="0 0 320 112">
          <Path d="M12 25 H308 M12 54 H308 M12 83 H308" stroke="#315B45" strokeWidth="1" opacity="0.08" />
          {segments.map((segment, index) => segment.length > 1 && <Path key={`segment-${index}`} d={segment.map((point, pointIndex) => `${pointIndex ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')} stroke="#315B45" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
          {days.map((day, index) => {
            const point = pointFor(day, index);
            return (
              <G key={day.key}>
                {point && <><Circle cx={point.x} cy={point.y} r="7" fill="#FFFDF4" stroke="#315B45" strokeWidth="2" /><Circle cx={point.x} cy={point.y} r="3.7" fill={MOODS[day.checkin!.mood - 1]?.color ?? MS.color.sage} /></>}
                <Circle cx={24 + index * 45.3} cy="91" r="2.2" fill={point ? '#315B45' : '#B5BEB5'} opacity={point ? 0.85 : 0.45} />
              </G>
            );
          })}
        </Svg>
        <View style={{ flexDirection: 'row', marginTop: -15 }}>
          {days.map((day) => <BodyBold key={day.key} size={8.5} color={day.checkin ? MS.color.forest : MS.color.faint} style={{ flex: 1, textAlign: 'center' }}>{day.date.toLocaleDateString('en-GB', { weekday: 'narrow' })}</BodyBold>)}
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: `${MS.color.ink}0F` }}>
        {([
          { label: 'Mood', value: summary.mood, icon: 'heart', color: '#4F755D' },
          { label: 'Energy', value: summary.energy, icon: 'sun', color: '#99752E' },
          { label: 'Pressure', value: summary.pressure, icon: 'wind', color: '#98605D' },
        ] as const).map((item, index) => (
          <View key={item.label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: index ? 1 : 0, borderLeftColor: `${MS.color.ink}0F` }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Feather name={item.icon} size={12} color={item.color} /><Body size={9} color={MS.color.muted}>{item.label}</Body></View>
            <BodyBold size={11} color={MS.color.inkSoft} style={{ marginTop: 2 }}>{item.value}</BodyBold>
          </View>
        ))}
      </View>
    </View>
  );
}

function PondScene({ days, message }: { days: WeekDay[]; message: string }) {
  return (
    <View style={{ height: 685, marginHorizontal: -17, marginTop: 2, overflow: 'hidden' }}>
      <PondBackdrop />
      <View style={{ position: 'absolute', left: 18, top: 292, width: 116, height: 122, justifyContent: 'flex-end' }}>
        <View style={{ position: 'absolute', left: 20, bottom: 8, width: 90, height: 15, borderRadius: 50, backgroundColor: 'rgba(37,64,43,0.2)' }} />
        <AnimatedBramble size={112} state="listen" mood="calm" />
      </View>
      <View style={{ position: 'absolute', right: 18, top: 309, width: 215, borderRadius: 20, backgroundColor: 'rgba(255,253,246,0.84)', paddingHorizontal: 14, paddingVertical: 11 }}>
        <BodyBold size={9} color={MS.color.forestMuted}>BRAMBLE NOTICED</BodyBold>
        <CharacterText size={12.5} color={MS.color.inkSoft} style={{ marginTop: 4, lineHeight: 17 }}>{message}</CharacterText>
      </View>
      <WeeklyChart days={days} />
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const checkins = useWellness((state) => state.checkins);
  const health = useWellness((state) => state.healthDailySummaries);
  const days = weekDays(checkins);

  return (
    <View style={{ flex: 1, backgroundColor: '#668463' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 132, backgroundColor: '#C8E4E3' }} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 17 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <BodyBold size={10} color={MS.color.forestMuted}>REFLECTION POND</BodyBold>
            <Display size={31} color={MS.color.inkSoft} style={{ marginTop: 2 }}>Your week</Display>
            <Body size={11.5} color={MS.color.muted} style={{ marginTop: 2 }}>A quiet look at what you have already shared.</Body>
          </View>
          <Pressable onPress={() => router.push('/history')} accessibilityRole="button" accessibilityLabel="Open check-in history" style={({ pressed }) => ({ width: 46, height: 46, borderRadius: 18, backgroundColor: 'rgba(255,253,244,0.86)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}>
            <Feather name="calendar" size={18} color={MS.color.forest} />
          </Pressable>
        </View>
        <PondScene days={days} message={takeaway(checkins, health)} />
      </ScrollView>
    </View>
  );
}
