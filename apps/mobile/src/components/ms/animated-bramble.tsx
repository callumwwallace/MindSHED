import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { MOTION } from '@/constants/motion';
import { feedback } from '@/lib/haptics';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Bramble, type BramblePose } from './bramble';

export type CompanionState =
  | 'idle'
  | 'greet'
  | 'listen'
  | 'notice'
  | 'celebrate'
  | 'plant'
  | 'wander'
  | 'curl'
  | 'breathe'
  | 'sleep';

type BrambleMood = 'happy' | 'calm' | 'sleepy';

interface AnimatedBrambleProps {
  size?: number;
  mood?: BrambleMood;
  state?: CompanionState;
  onPress?: () => void;
  onPet?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

// Screen-level companion state machine. The rendered SVG is a development
// stand-in; its inputs intentionally match the final BrambleSM Rive contract.
export function AnimatedBramble({
  size = 120,
  mood = 'happy',
  state = 'idle',
  onPress,
  onPet,
  style,
  accessibilityLabel = 'Bramble',
}: AnimatedBrambleProps) {
  const reduceMotion = useReducedMotion();
  const [ambient] = useState(() => new Animated.Value(0));
  const [action] = useState(() => new Animated.Value(0));
  const [stepPhase, setStepPhase] = useState<0 | 1>(0);

  useEffect(() => {
    if (reduceMotion || state !== 'wander') return;
    const timer = setInterval(() => setStepPhase((phase) => phase ? 0 : 1), 280);
    return () => clearInterval(timer);
  }, [reduceMotion, state]);

  useEffect(() => {
    ambient.stopAnimation();
    ambient.setValue(0);
    if (reduceMotion || !['breathe', 'sleep', 'wander'].includes(state)) return;
    const isBreathing = state === 'breathe';
    const isSleeping = state === 'sleep';
    const isWalking = state === 'wander';
    const distance = isBreathing ? 0.55 : isSleeping ? -0.25 : isWalking ? -0.65 : 0;
    const duration = isBreathing ? MOTION.breathe : isSleeping ? 3200 : isWalking ? 480 : MOTION.petIdle / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambient, {
          toValue: distance,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ambient, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ambient, reduceMotion, state]);

  useEffect(() => {
    if (reduceMotion || ['idle', 'listen', 'wander', 'breathe', 'sleep', 'curl'].includes(state)) return;
    action.stopAnimation();
    action.setValue(0);
    Animated.sequence([
      Animated.spring(action, {
        toValue: 1,
        speed: state === 'celebrate' ? 18 : 15,
        bounciness: state === 'celebrate' ? 8 : 4,
        useNativeDriver: true,
      }),
      Animated.spring(action, { toValue: 0, speed: 14, bounciness: 3, useNativeDriver: true }),
    ]).start();
  }, [action, reduceMotion, state]);

  const react = () => {
    feedback.select();
    action.stopAnimation();
    Animated.sequence([
      Animated.spring(action, { toValue: 1, speed: 18, bounciness: 6, useNativeDriver: true }),
      Animated.spring(action, { toValue: 0, speed: 15, bounciness: 4, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  const jump = state === 'celebrate' ? -6 : state === 'greet' ? -2 : state === 'plant' ? -1 : -2;
  const actionY = action.interpolate({ inputRange: [0, 1], outputRange: [0, jump] });
  const scale = action.interpolate({ inputRange: [0, 1], outputRange: [1, state === 'plant' ? 0.985 : 1.025] });
  const rotate = action.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', state === 'plant' ? '1deg' : '-0.6deg'],
  });
  const breatheScale = ambient.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [1, 1, state === 'breathe' ? 1.012 : 1],
  });
  const walkSway = ambient.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [state === 'wander' ? '-0.45deg' : '0deg', state === 'wander' ? '0.35deg' : '0deg', '0deg'],
  });
  const pose: BramblePose = state === 'sleep' || state === 'curl'
    ? 'curled'
    : state === 'wander'
      ? 'walk'
      : state === 'idle'
        ? 'standing'
        : state;

  return (
    <Pressable
      onPress={react}
      onLongPress={() => {
        if (!onPet) return;
        feedback.soft();
        onPet();
      }}
      delayLongPress={360}
      disabled={!onPress && !onPet}
      accessibilityRole={onPress || onPet ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={onPet ? 'Tap to greet, or hold to gently pet Bramble' : undefined}
      style={style}>
      <Animated.View
        style={{
          opacity: state === 'sleep' ? 0.92 : 1,
          transform: [{ translateY: ambient }, { translateY: actionY }, { scale: breatheScale }, { scale }, { rotate: walkSway }, { rotate }],
        }}>
        <Bramble size={size} mood={state === 'sleep' ? 'sleepy' : mood} pose={pose} phase={state === 'wander' ? stepPhase : 0} />
      </Animated.View>
    </Pressable>
  );
}
