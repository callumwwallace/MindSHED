import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Bramble } from '@/components/ms/bramble';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';

const PHASE_MS = 4000;
const SESSION_S = 120;

const STARS = [
  { x: 40, y: 70, r: 2 },
  { x: 90, y: 120, r: 1.6 },
  { x: 150, y: 60, r: 1.8 },
  { x: 230, y: 110, r: 1.5 },
  { x: 300, y: 80, r: 1.7 },
  { x: 60, y: 170, r: 1.4 },
  { x: 280, y: 180, r: 1.5 },
  { x: 180, y: 140, r: 1.3 },
];

function DuskScene() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 340 760"
      preserveAspectRatio="xMidYMax slice">
      <Circle cx="272" cy="170" r="22" fill={MS.color.paper} stroke={MS.color.ink} strokeWidth="2.5" />
      <Circle cx="264" cy="162" r="17" fill={MS.color.dusk} />
      {STARS.map((s) => (
        <Circle key={`s${s.x}`} cx={s.x} cy={s.y} r={s.r} fill={MS.color.cream} opacity={0.85} />
      ))}
      <Path
        d="M-5 600 Q80 572 170 590 Q255 606 345 584 L345 765 L-5 765 Z"
        fill="#84C58A"
        stroke={MS.color.ink}
        strokeWidth="2.5"
      />
      <Path
        d="M-5 672 Q90 654 170 666 Q255 678 345 660 L345 765 L-5 765 Z"
        fill="#6FB573"
        stroke={MS.color.ink}
        strokeWidth="2.5"
      />
    </Svg>
  );
}

export default function BreatheScreen() {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [secondsLeft, setSecondsLeft] = useState(SESSION_S);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: PHASE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: PHASE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    const phaseTimer = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), PHASE_MS);
    const clock = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          router.back();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      loop.stop();
      clearInterval(phaseTimer);
      clearInterval(clock);
    };
  }, [scale]);

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.dusk }}>
      <DuskScene />
      <Pressable
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 10,
          left: 16,
          zIndex: 2,
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: MS.border,
          borderColor: MS.color.ink,
          backgroundColor: MS.color.cream,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Feather name="x" size={16} color={MS.color.ink} />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            width: 190,
            height: 190,
            borderRadius: 95,
            backgroundColor: MS.color.cream,
            borderWidth: 2.5,
            borderColor: MS.color.ink,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale }],
          }}>
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: MS.color.mint,
              borderWidth: MS.border,
              borderColor: MS.color.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Heading size={20}>{phase === 'in' ? 'Breathe in' : 'Breathe out'}</Heading>
          </View>
        </Animated.View>
      </View>
      <View style={{ alignItems: 'center', paddingBottom: insets.bottom + 18, gap: 8 }}>
        <Bramble size={86} mood="calm" />
        <Body size={12} color={MS.color.cream}>
          Bramble&apos;s breathing with you
        </Body>
        <View
          style={{
            backgroundColor: MS.color.cream,
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            borderRadius: 12,
            paddingVertical: 4,
            paddingHorizontal: 14,
          }}>
          <BodyBold size={12}>
            {mm}:{ss} left
          </BodyBold>
        </View>
      </View>
    </View>
  );
}
