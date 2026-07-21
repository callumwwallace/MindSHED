import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as KeepAwake from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBramble } from '@/components/ms/animated-bramble';
import { BrambleDialogue } from '@/components/ms/bramble-dialogue';
import { Garden } from '@/components/ms/garden';
import { PlaceVignette } from '@/components/ms/place-vignette';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { getGardenRestState } from '@/lib/garden-progress';
import { goBackOrReplace } from '@/lib/navigation';
import { useWellness } from '@/store/wellness';

const PHASE_MS = 4000;
const DURATIONS = [2, 5, 10];
export default function BreatheScreen() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const gardenGrowth = useWellness((state) => state.gardenGrowth);
  const checkins = useWellness((state) => state.checkins);
  const gardenRest = getGardenRestState(checkins.map((item) => item.date));
  const [scale] = useState(() => new Animated.Value(0));
  const [stage, setStage] = useState<'setup' | 'active' | 'complete'>('setup');
  const [duration, setDuration] = useState(2);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [paused, setPaused] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const deadline = useRef<number | undefined>(undefined);
  const compact = height <= 620;
  const sceneWidth = Math.min(width, 520);
  const sceneScale = Math.max(sceneWidth / 390, height / 844);
  const visibleSourceHeight = height / sceneScale;
  const visibleSourceWidth = sceneWidth / sceneScale;
  const sourceTop = (844 - visibleSourceHeight) / 2;
  const sourceLeft = (390 - visibleSourceWidth) / 2;
  const activeBrambleSize = compact ? 70 : 76;
  const activeBrambleTop = Math.max(insets.top + 68, (413 - sourceTop) * sceneScale - activeBrambleSize * 0.65);
  const activeBrambleLeft = Math.max(18, (36 - sourceLeft) * sceneScale);

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
      <View pointerEvents="none" style={StyleSheet.absoluteFill}><Garden growth={gardenGrowth} mode="quiet" restState={gardenRest.id} timeOfDay="dusk" /></View>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(23,39,49,0.48)' }]} />
      {stage !== 'active' && <Pressable onPress={() => goBackOrReplace('/')} accessibilityRole="button" accessibilityLabel="Close" style={{ position: 'absolute', top: insets.top + 12, left: 18, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.22)', borderWidth: 1, borderColor: 'rgba(255,254,247,0.18)', alignItems: 'center', justifyContent: 'center' }}><Feather name="x" size={18} color={MS.color.surface} /></Pressable>}

      {stage === 'setup' && <View style={{ flex: 1, paddingTop: insets.top + (compact ? 68 : 88), paddingHorizontal: 22, paddingBottom: insets.bottom + (compact ? 18 : 26) }}>
        <BodyBold size={10} color="rgba(255,254,247,0.66)" style={{ letterSpacing: 1.4 }}>THE BENCH</BodyBold>
        <Display numberOfLines={2} size={compact ? 28 : 30} color={MS.color.surface} style={{ marginTop: 5, flexShrink: 1 }}>Breathe with Bramble</Display>
        <Body size={12.5} color="rgba(255,254,247,0.68)" style={{ marginTop: 7, maxWidth: 320 }}>Choose enough time to arrive. You can pause or leave whenever you need.</Body>
        <BodyBold size={10} color="rgba(255,254,247,0.62)" style={{ letterSpacing: 1.3, marginTop: compact ? 18 : 32, marginBottom: 9 }}>DURATION</BodyBold>
        <View style={{ flexDirection: 'row', gap: 9 }}>{DURATIONS.map((item) => <Pressable key={item} onPress={() => setDuration(item)} accessibilityRole="radio" accessibilityState={{ selected: duration === item }} style={{ flex: 1, minHeight: compact ? 62 : 72, borderRadius: 18, paddingVertical: compact ? 10 : 15, alignItems: 'center', backgroundColor: duration === item ? MS.color.surface : 'rgba(255,254,247,0.12)', borderWidth: 1, borderColor: duration === item ? MS.color.surface : 'rgba(255,254,247,0.18)' }}><Heading size={17} color={duration === item ? MS.color.forest : MS.color.surface}>{item}</Heading><Body size={9.5} color={duration === item ? MS.color.muted : 'rgba(255,254,247,0.62)'}>minutes</Body></Pressable>)}</View>
        <View pointerEvents="none" style={{ flex: 1, minHeight: compact ? 88 : 132, justifyContent: 'center', marginTop: compact ? 8 : 16 }}>
          <View style={{ height: compact ? 84 : 122, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,254,247,0.18)' }}>
            <PlaceVignette variant="bench" height={compact ? 84 : 122} showBramble={false} />
            <View style={{ position: 'absolute', left: compact ? 20 : 28, bottom: 1 }}><AnimatedBramble size={compact ? 68 : 76} mood="calm" state="breathe" /></View>
            <BrambleDialogue message="I’ll keep the rhythm. Nothing to get right." holdMs={60000} width={Math.min(202, sceneWidth - 118)} tailSide="left" style={{ position: 'absolute', left: compact ? 88 : 101, top: compact ? 14 : 27 }} />
          </View>
        </View>
        <PillButton label={`Begin ${duration} minutes`} onPress={start} color={MS.color.surface} />
      </View>}

      {stage === 'active' && <>
        <View style={{ position: 'absolute', top: insets.top + 18, left: 0, right: 0, alignItems: 'center' }}><BodyBold size={10} color="rgba(255,254,247,0.68)" style={{ letterSpacing: 1.4 }}>{paused ? 'PAUSED' : 'THE BENCH'}</BodyBold><Body size={11} color="rgba(255,254,247,0.62)" style={{ marginTop: 2 }}>{minutes}:{seconds} remaining</Body></View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: compact ? 18 : 70 }}><View style={{ width: compact ? 192 : 230, height: compact ? 192 : 230, alignItems: 'center', justifyContent: 'center' }}><Animated.View style={{ position: 'absolute', width: compact ? 184 : 220, height: compact ? 184 : 220, borderRadius: compact ? 92 : 110, backgroundColor: MS.color.sky, opacity: glowOpacity, transform: [{ scale: orbScale }] }} /><Animated.View style={{ width: compact ? 138 : 164, height: compact ? 138 : 164, borderRadius: compact ? 69 : 82, backgroundColor: 'rgba(255,254,247,0.9)', alignItems: 'center', justifyContent: 'center', transform: [{ scale: orbScale }] }}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3 }}>{paused ? 'TAKE YOUR TIME' : phase === 'in' ? 'BREATHE IN' : 'BREATHE OUT'}</BodyBold><Heading size={compact ? 19 : 21} color={MS.color.inkSoft} style={{ marginTop: 4 }}>{paused ? 'Paused' : phase === 'in' ? 'Let it arrive' : 'Let it soften'}</Heading></Animated.View></View><Pressable onPress={togglePaused} accessibilityRole="button" accessibilityLabel={paused ? 'Resume breathing' : 'Pause breathing'} style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,254,247,0.15)', alignItems: 'center', justifyContent: 'center', marginTop: compact ? 12 : 22 }}><Feather name={paused ? 'play' : 'pause'} size={21} color={MS.color.surface} /></Pressable></View>
        <View pointerEvents="none" style={{ position: 'absolute', left: activeBrambleLeft, top: activeBrambleTop }}><AnimatedBramble size={activeBrambleSize} mood="calm" state={paused ? 'listen' : 'breathe'} /></View>
        <Pressable onPress={() => setConfirmExit(true)} accessibilityRole="button" accessibilityLabel="End breathing session" style={{ position: 'absolute', top: insets.top + 12, left: 18, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.22)', borderWidth: 1, borderColor: 'rgba(255,254,247,0.18)', alignItems: 'center', justifyContent: 'center' }}><Feather name="x" size={18} color={MS.color.surface} /></Pressable>
      </>}

      {stage === 'complete' && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingBottom: compact ? 12 : 30 }}><AnimatedBramble size={compact ? 120 : 156} mood="happy" state="celebrate" /><BodyBold size={10} color="rgba(255,254,247,0.66)" style={{ letterSpacing: 1.4, marginTop: compact ? 14 : 24 }}>SESSION COMPLETE</BodyBold><Display size={compact ? 26 : 29} color={MS.color.surface} style={{ textAlign: 'center', marginTop: 6 }}>You made a little room.</Display><Body size={12} color="rgba(255,254,247,0.68)" style={{ textAlign: 'center', marginTop: 8 }}>No score. No streak. Just a quieter moment you chose for yourself.</Body><PillButton label="Return to the garden" onPress={() => goBackOrReplace('/')} color={MS.color.surface} style={{ alignSelf: 'stretch', marginTop: compact ? 18 : 28 }} /></View>}

      {confirmExit && <View style={[StyleSheet.absoluteFill, { zIndex: 5, backgroundColor: 'rgba(20,31,43,0.68)', justifyContent: 'flex-end' }]} accessibilityViewIsModal><View style={{ backgroundColor: MS.color.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: insets.bottom + 20 }}><Heading size={20} color={MS.color.inkSoft}>Leave this session?</Heading><Body size={12} color={MS.color.muted} style={{ marginTop: 5 }}>Nothing is lost, and there is no incomplete mark.</Body><PillButton label="Keep breathing" onPress={() => setConfirmExit(false)} style={{ marginTop: 18 }} /><Pressable onPress={() => goBackOrReplace('/')} accessibilityRole="button" accessibilityLabel="End breathing session" style={{ alignItems: 'center', padding: 14 }}><BodyBold size={11.5} color={MS.color.forestMuted}>End session</BodyBold></Pressable></View></View>}
    </View>
  );
}
