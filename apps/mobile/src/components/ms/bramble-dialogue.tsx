import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, type StyleProp, View, type ViewStyle } from 'react-native';

import { MS } from '@/constants/mindshed';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { BodyBold, CharacterText } from './text';

interface BrambleDialogueProps {
  message?: string;
  messageVersion?: number;
  eyebrow?: string;
  width?: number;
  tailSide?: 'left' | 'right' | 'none';
  style?: StyleProp<ViewStyle>;
  holdMs?: number;
}

export function BrambleDialogue(props: BrambleDialogueProps) {
  if (!props.message) return null;
  return <DialogueRun key={`${props.messageVersion ?? 0}:${props.message}`} {...props} message={props.message} />;
}

function DialogueRun({
  message,
  eyebrow,
  width = 210,
  tailSide = 'left',
  style,
  holdMs,
}: BrambleDialogueProps & { message: string }) {
  const reduceMotion = useReducedMotion();
  const words = useMemo(() => message.trim().split(/\s+/), [message]);
  // Keep the bubble legible from its first frame. The previous zero-opacity
  // entrance could leave a visible shadow with missing copy during navigation.
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(reduceMotion ? 1 : 0.96));
  const [rendered, setRendered] = useState(true);
  const [spokenText, setSpokenText] = useState(reduceMotion ? message : words[0] ?? message);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wordDelay = reduceMotion ? 0 : 82;
    const speakingMs = wordDelay * Math.max(0, words.length - 1);
    const restingMs = holdMs ?? Math.min(5200, Math.max(2800, words.length * 260));

    if (!reduceMotion) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, speed: 18, bounciness: 4, useNativeDriver: true }),
      ]).start();
      words.slice(1).forEach((_, index) => {
        timers.push(setTimeout(() => setSpokenText(words.slice(0, index + 2).join(' ')), wordDelay * (index + 1)));
      });
    }

    timers.push(setTimeout(() => {
      if (reduceMotion) {
        setRendered(false);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 360, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.98, duration: 360, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }, speakingMs + restingMs));

    return () => {
      timers.forEach(clearTimeout);
      opacity.stopAnimation();
      scale.stopAnimation();
    };
  }, [holdMs, message, opacity, reduceMotion, scale, words]);

  if (!rendered) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessible
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      style={[
        {
          width,
          zIndex: 4,
          paddingVertical: 10,
          paddingHorizontal: 13,
          backgroundColor: 'rgba(255,254,247,0.96)',
          borderRadius: 18,
          borderBottomLeftRadius: tailSide === 'left' ? 8 : 18,
          borderBottomRightRadius: tailSide === 'right' ? 8 : 18,
          borderWidth: 1,
          borderColor: 'rgba(49,91,69,0.14)',
          shadowColor: MS.color.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          opacity,
          transform: [{ scale }],
        },
        style,
      ]}>
      <View importantForAccessibility="no-hide-descendants">
        {!!eyebrow && <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1 }}>{eyebrow}</BodyBold>}
        <CharacterText size={13} color={MS.color.inkSoft} style={{ marginTop: eyebrow ? 2 : 0 }}>{spokenText}</CharacterText>
      </View>
      {tailSide !== 'none' && <View style={{ position: 'absolute', bottom: -6, ...(tailSide === 'left' ? { left: 18 } : { right: 18 }), width: 12, height: 12, backgroundColor: 'rgba(255,254,247,0.96)', borderRightWidth: tailSide === 'left' ? 1 : 0, borderBottomWidth: 1, borderLeftWidth: tailSide === 'right' ? 1 : 0, borderColor: 'rgba(49,91,69,0.14)', transform: [{ rotate: '45deg' }] }} />}
    </Animated.View>
  );
}
