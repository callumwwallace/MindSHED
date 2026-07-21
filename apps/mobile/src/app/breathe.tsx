import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as KeepAwake from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BenchBreathingScene } from '@/components/ms/immersive-place-scene';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { goBackOrReplace } from '@/lib/navigation';

const PHASE_MS = 4000;
const DURATIONS = [2, 5, 10];
export default function BreatheScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(0));
  const [stage, setStage] = useState<'setup' | 'active' | 'complete'>('setup');
  const [duration, setDuration] = useState(2);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [paused, setPaused] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const deadline = useRef<number | undefined>(undefined);
  const compact = height <= 620;

  useEffect(() => {
    if (stage !== 'active' || paused) return;
    let loop: Animated.CompositeAnimation | undefined;
    if (!reduceMotion) {
      loop = Animated.loop(Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: PHASE_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: PHASE_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      loop.start();
    }
    const phaseTimer = setInterval(() => setPhase((current) => current === 'in' ? 'out' : 'in'), PHASE_MS);
    return () => { loop?.stop(); clearInterval(phaseTimer); };
  }, [paused, reduceMotion, scale, stage]);

  useEffect(() => {
    if (stage !== 'active') return;
    void KeepAwake.activateKeepAwakeAsync('mindshed-breathing');
    return () => { void KeepAwake.deactivateKeepAwake('mindshed-breathing'); };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'active' || paused || !deadline.current) return;
    const updateClock = () => {
      const next = Math.max(0, Math.ceil((deadline.current! - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0) setStage('complete');
    };
    updateClock();
    const clock = setInterval(updateClock, 250);
    return () => clearInterval(clock);
  }, [paused, stage]);

  const start = () => {
    const seconds = duration * 60;
    deadline.current = Date.now() + seconds * 1000;
    setSecondsLeft(seconds);
    setPhase('in');
    setPaused(false);
    setStage('active');
  };
  const togglePaused = () => {
    if (paused) {
      deadline.current = Date.now() + secondsLeft * 1000;
      setPaused(false);
      return;
    }
    if (deadline.current) setSecondsLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    deadline.current = undefined;
    setPaused(true);
  };
  const orbScale = reduceMotion ? 1 : scale.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1.08] });
  const glowOpacity = reduceMotion ? 0.3 : scale.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.5] });
  const minutes = Math.floor(secondsLeft / 60); const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={{ flex: 1, backgroundColor: '#283A55' }}>
      <BenchBreathingScene
        brambleState={stage === 'complete' ? 'celebrate' : paused ? 'listen' : 'breathe'}
        brambleSize={compact ? 142 : 174}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(23,39,49,0.25)' }]} />
      {stage !== 'active' && <Pressable onPress={() => goBackOrReplace('/(tabs)/places')} accessibilityRole="button" accessibilityLabel="Back to Places" style={{ position: 'absolute', top: insets.top + 12, left: 18, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.22)', borderWidth: 1, borderColor: 'rgba(255,254,247,0.18)', alignItems: 'center', justifyContent: 'center' }}><Feather name="arrow-left" size={18} color={MS.color.surface} /></Pressable>}

      {stage === 'setup' && <View style={{ flex: 1, paddingTop: insets.top + (compact ? 68 : 88), paddingHorizontal: 22, paddingBottom: insets.bottom + (compact ? 18 : 26) }}>
        <BodyBold size={10} color="rgba(255,254,247,0.66)" style={{ letterSpacing: 1.4 }}>THE BENCH</BodyBold>
        <Display numberOfLines={2} size={compact ? 28 : 30} color={MS.color.surface} style={{ marginTop: 5, flexShrink: 1 }}>Breathe with Bramble</Display>
        <Body size={12.5} color="rgba(255,254,247,0.74)" style={{ marginTop: 7, maxWidth: 320 }}>Settle beside Bramble. Follow the gentle rhythm—there is nothing to get right.</Body>
        <View style={{ marginTop: 13, borderLeftWidth: 2, borderLeftColor: 'rgba(255,254,247,0.42)', paddingLeft: 10 }}>
          <CharacterText size={12.5} color="rgba(255,254,247,0.86)">Come and sit. I’ll keep the rhythm.</CharacterText>
        </View>
        <View pointerEvents="none" style={{ flex: 1 }} />
        <View style={{ borderRadius: 25, backgroundColor: 'rgba(30,49,43,0.7)', borderWidth: 1, borderColor: 'rgba(255,254,247,0.16)', padding: 12, marginBottom: 12 }}>
          <BodyBold size={9.5} color="rgba(255,254,247,0.64)" style={{ letterSpacing: 1.3, marginBottom: 9 }}>HOW LONG SHALL WE SIT?</BodyBold>
          <View style={{ flexDirection: 'row', gap: 9 }}>{DURATIONS.map((item) => <Pressable key={item} onPress={() => setDuration(item)} accessibilityRole="radio" accessibilityState={{ selected: duration === item }} style={{ flex: 1, minHeight: compact ? 52 : 58, borderRadius: 17, paddingVertical: compact ? 8 : 11, alignItems: 'center', backgroundColor: duration === item ? MS.color.surfaceWarm : 'rgba(255,254,247,0.1)', borderWidth: 1, borderColor: duration === item ? MS.color.surfaceWarm : 'rgba(255,254,247,0.14)' }}><Heading size={16} color={duration === item ? MS.color.forest : MS.color.surface}>{item}</Heading><Body size={9} color={duration === item ? MS.color.muted : 'rgba(255,254,247,0.62)'}>minutes</Body></Pressable>)}</View>
        </View>
        <PillButton label={`Begin ${duration} minutes`} onPress={start} color={MS.color.surface} />
      </View>}

      {stage === 'active' && <>
        <View style={{ position: 'absolute', top: insets.top + 18, left: 0, right: 0, alignItems: 'center' }}><BodyBold size={10} color="rgba(255,254,247,0.68)" style={{ letterSpacing: 1.4 }}>{paused ? 'PAUSED' : 'THE BENCH'}</BodyBold><Body size={11} color="rgba(255,254,247,0.62)" style={{ marginTop: 2 }}>{minutes}:{seconds} remaining</Body></View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: compact ? 18 : 70 }}><View style={{ width: compact ? 192 : 230, height: compact ? 192 : 230, alignItems: 'center', justifyContent: 'center' }}><Animated.View style={{ position: 'absolute', width: compact ? 184 : 220, height: compact ? 184 : 220, borderRadius: compact ? 92 : 110, backgroundColor: MS.color.sky, opacity: glowOpacity, transform: [{ scale: orbScale }] }} /><Animated.View style={{ width: compact ? 138 : 164, height: compact ? 138 : 164, borderRadius: compact ? 69 : 82, backgroundColor: 'rgba(255,254,247,0.9)', alignItems: 'center', justifyContent: 'center', transform: [{ scale: orbScale }] }}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3 }}>{paused ? 'TAKE YOUR TIME' : phase === 'in' ? 'BREATHE IN' : 'BREATHE OUT'}</BodyBold><Heading size={compact ? 19 : 21} color={MS.color.inkSoft} style={{ marginTop: 4 }}>{paused ? 'Paused' : phase === 'in' ? 'Let it arrive' : 'Let it soften'}</Heading></Animated.View></View></View>
        <Pressable onPress={togglePaused} accessibilityRole="button" accessibilityLabel={paused ? 'Resume breathing' : 'Pause breathing'} style={{ position: 'absolute', top: insets.top + 12, right: 18, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.22)', borderWidth: 1, borderColor: 'rgba(255,254,247,0.18)', alignItems: 'center', justifyContent: 'center' }}><Feather name={paused ? 'play' : 'pause'} size={18} color={MS.color.surface} /></Pressable>
        <Pressable onPress={() => setConfirmExit(true)} accessibilityRole="button" accessibilityLabel="End breathing session" style={{ position: 'absolute', top: insets.top + 12, left: 18, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.22)', borderWidth: 1, borderColor: 'rgba(255,254,247,0.18)', alignItems: 'center', justifyContent: 'center' }}><Feather name="x" size={18} color={MS.color.surface} /></Pressable>
      </>}

      {stage === 'complete' && <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 26, paddingBottom: insets.bottom + 24 }}><View style={{ borderRadius: 28, backgroundColor: 'rgba(30,49,43,0.76)', borderWidth: 1, borderColor: 'rgba(255,254,247,0.16)', padding: 20 }}><BodyBold size={10} color="rgba(255,254,247,0.66)" style={{ letterSpacing: 1.4 }}>SESSION COMPLETE</BodyBold><Display size={compact ? 26 : 29} color={MS.color.surface} style={{ marginTop: 6 }}>You made a little room.</Display><Body size={12} color="rgba(255,254,247,0.7)" style={{ marginTop: 8 }}>No score. No streak. Just a quieter moment you chose for yourself.</Body><PillButton label="Return to the garden" onPress={() => goBackOrReplace('/')} color={MS.color.surface} style={{ marginTop: compact ? 18 : 22 }} /></View></View>}

      {confirmExit && <View style={[StyleSheet.absoluteFill, { zIndex: 5, backgroundColor: 'rgba(20,31,43,0.68)', justifyContent: 'flex-end' }]} accessibilityViewIsModal><View style={{ backgroundColor: MS.color.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: insets.bottom + 20 }}><Heading size={20} color={MS.color.inkSoft}>Leave this session?</Heading><Body size={12} color={MS.color.muted} style={{ marginTop: 5 }}>Nothing is lost, and there is no incomplete mark.</Body><PillButton label="Keep breathing" onPress={() => setConfirmExit(false)} style={{ marginTop: 18 }} /><Pressable onPress={() => goBackOrReplace('/(tabs)/places')} accessibilityRole="button" accessibilityLabel="End breathing session" style={{ alignItems: 'center', padding: 14 }}><BodyBold size={11.5} color={MS.color.forestMuted}>End session</BodyBold></Pressable></View></View>}
    </View>
  );
}
