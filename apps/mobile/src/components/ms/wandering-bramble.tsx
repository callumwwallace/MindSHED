import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { AnimatedBramble, type CompanionState } from './animated-bramble';
import { BrambleDialogue } from './bramble-dialogue';

interface WanderingBrambleProps {
  size?: number;
  mood?: 'happy' | 'calm' | 'sleepy';
  state?: CompanionState;
  enabled?: boolean;
  onPress?: () => void;
  onPet?: () => void;
  accessibilityLabel?: string;
  message?: string;
  messageVersion?: number;
  eyebrow?: string;
}

export function WanderingBramble({
  size = 112,
  mood = 'calm',
  state = 'idle',
  enabled = true,
  onPress,
  onPet,
  accessibilityLabel = 'Bramble exploring the garden',
  message,
  messageVersion,
  eyebrow,
}: WanderingBrambleProps) {
  const window = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [position] = useState(() => new Animated.ValueXY());
  const [scene, setScene] = useState(() => ({ width: Math.min(window.width, 520), height: window.height }));
  const pointIndex = useRef(0);
  const [travelling, setTravelling] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left');
  const bubbleWidth = Math.min(210, scene.width - 32);
  const waypoints = useMemo(() => {
    const maxX = Math.max(16, scene.width - size - 16);
    const maxY = Math.max(scene.height * 0.42, scene.height - size * 0.72 - 76);
    const y = (ratio: number) => Math.min(maxY, scene.height * ratio);
    return [
      { x: Math.min(maxX, scene.width * 0.52), y: y(0.64) },
      { x: Math.min(maxX, scene.width * 0.42), y: y(0.58) },
      { x: Math.min(maxX, scene.width * 0.64), y: y(0.46) },
      { x: Math.min(maxX, scene.width * 0.12), y: y(0.49) },
      { x: Math.min(maxX, scene.width * 0.58), y: y(0.37) },
    ];
  }, [scene.height, scene.width, size]);

  useEffect(() => {
    const initial = waypoints[pointIndex.current] ?? waypoints[0];
    position.setValue(initial);
  }, [position, waypoints]);

  useEffect(() => {
    const listener = position.x.addListener(({ value }) => {
      const minimumXForLeftBubble = bubbleWidth - size * 0.44 + 18;
      const nextSide = value >= minimumXForLeftBubble ? 'left' : 'right';
      setBubbleSide((current) => current === nextSide ? current : nextSide);
    });
    return () => position.x.removeListener(listener);
  }, [bubbleWidth, position, size]);

  useEffect(() => {
    if (!enabled || reduceMotion || !['idle', 'wander'].includes(state)) {
      position.stopAnimation(() => setTravelling(false));
      return;
    }

    let cancelled = false;
    let pause: ReturnType<typeof setTimeout> | undefined;

    const move = () => {
      if (cancelled) return;
      const current = waypoints[pointIndex.current];
      const nextIndex = (pointIndex.current + 1) % waypoints.length;
      const next = waypoints[nextIndex];
      const distance = Math.hypot(next.x - current.x, next.y - current.y);
      setFacing(next.x >= current.x ? 1 : -1);
      setTravelling(true);
      Animated.timing(position, {
        toValue: next,
        duration: Math.max(3200, Math.min(6200, distance * 22)),
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || cancelled) return;
        pointIndex.current = nextIndex;
        setTravelling(false);
        pause = setTimeout(move, 2200 + nextIndex * 420);
      });
    };

    pause = setTimeout(move, 1800);
    return () => {
      cancelled = true;
      if (pause) clearTimeout(pause);
      position.stopAnimation();
    };
  }, [enabled, position, reduceMotion, state, waypoints]);

  const renderedState: CompanionState = travelling ? 'wander' : state === 'wander' ? 'idle' : state;
  const depthScale = position.y.interpolate({
    inputRange: [scene.height * 0.36, scene.height * 0.68],
    outputRange: [0.72, 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      pointerEvents="box-none"
      onLayout={({ nativeEvent }) => {
        const { width, height } = nativeEvent.layout;
        setScene((current) => current.width === width && current.height === height ? current : { width, height });
      }}
      style={StyleSheet.absoluteFill}>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          transform: [{ translateX: position.x }, { translateY: position.y }],
        }}>
        <Animated.View style={{ transform: [{ scale: depthScale }, { scaleX: facing }] }}>
          <AnimatedBramble
            size={size}
            mood={mood}
            state={renderedState}
            onPress={onPress}
            onPet={onPet}
            accessibilityLabel={accessibilityLabel}
          />
        </Animated.View>
        <BrambleDialogue
          message={message}
          messageVersion={messageVersion}
          eyebrow={eyebrow}
          width={bubbleWidth}
          tailSide={bubbleSide === 'right' ? 'left' : 'right'}
          style={{ position: 'absolute', bottom: size * 0.62, ...(bubbleSide === 'right' ? { left: size * 0.52 } : { right: size * 0.52 }) }}
        />
      </Animated.View>
    </View>
  );
}
