import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type CompanionState } from '@/components/ms/animated-bramble';
import { Card } from '@/components/ms/card';
import { Garden, GARDEN_HOTSPOTS } from '@/components/ms/garden';
import { MoodPicker } from '@/components/ms/mood-picker';
import { TaskRow } from '@/components/ms/task-row';
import { Body, BodyBold, Display, Heading } from '@/components/ms/text';
import { WanderingBramble } from '@/components/ms/wandering-bramble';
import { MOODS, MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { gardenGrowthSummary, getGardenProgress, getGardenRestState } from '@/lib/garden-progress';
import { swemwbsSchedule } from '@/lib/swemwbs';
import { getCareSuggestion } from '@/lib/wellbeing-guidance';
import { todayKey, useTodayCheckin, useWellness } from '@/store/wellness';

function todayParts() {
  const now = new Date();
  return {
    day: now.toLocaleDateString('en-GB', { weekday: 'long' }),
    date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }),
    greeting: now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening',
  };
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const checkin = useTodayCheckin();
  const tasks = useWellness((state) => state.tasks);
  const checkins = useWellness((state) => state.checkins);
  const wellbeingPulses = useWellness((state) => state.wellbeingPulses);
  const gardenGrowth = useWellness((state) => state.gardenGrowth);
  const growthPending = useWellness((state) => state.growthPending);
  const toggleTask = useWellness((state) => state.toggleTask);
  const removeTask = useWellness((state) => state.removeTask);
  const reduceMotion = useReducedMotion();
  const clearGrowth = useWellness((state) => state.clearGrowth);
  const ensureToday = useWellness((state) => state.ensureToday);
  const [planOpen, setPlanOpen] = useState(false);
  const [companionState, setCompanionState] = useState<CompanionState>('greet');
  const [message, setMessage] = useState<string>();
  const [messageVersion, setMessageVersion] = useState(0);
  const [rewardVisible, setRewardVisible] = useState(false);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechAt = useRef(0);
  const ambientSpeechCount = useRef(0);

  useEffect(() => {
    ensureToday();
  }, [ensureToday]);

  useEffect(() => {
    const timer = setTimeout(() => setCompanionState('idle'), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!growthPending) return;
    const reveal = setTimeout(() => {
      setRewardVisible(true);
      setCompanionState('celebrate');
      setMessage(gardenGrowthSummary(gardenGrowth).title);
      setMessageVersion((version) => version + 1);
      lastSpeechAt.current = Date.now();
      feedback.success();
    }, 0);
    const timer = setTimeout(() => {
      setRewardVisible(false);
      setCompanionState('idle');
      clearGrowth();
    }, 4800);
    return () => {
      clearTimeout(reveal);
      clearTimeout(timer);
    };
  }, [gardenGrowth, growthPending, clearGrowth]);

  useEffect(
    () => () => {
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
    },
    [],
  );

  const react = useCallback((state: CompanionState, nextMessage: string) => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    setCompanionState(state);
    setMessage(nextMessage);
    setMessageVersion((version) => version + 1);
    lastSpeechAt.current = Date.now();
    reactionTimer.current = setTimeout(() => setCompanionState('idle'), 1800);
  }, []);

  const togglePlan = () => {
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlanOpen((open) => !open);
  };

  const doneCount = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? doneCount / tasks.length : 0;
  const today = todayParts();
  const planHeight = Math.min(520, Math.max(410, height * 0.58));
  const dockWidth = Math.min(checkin ? 190 : 230, width - 112);
  const gardenRest = getGardenRestState(checkins.map((item) => item.date), todayKey());
  const daysAway = gardenRest.daysSinceLastCheckin ?? 0;
  const defaultMessage = checkin
    ? 'You checked in. We can take the rest gently.'
    : daysAway >= 3
      ? 'Good to see you. There is nothing to catch up on.'
    : gardenGrowth === 0
      ? "We'll grow this place together."
      : 'Whenever you are ready, I am here.';
  const garden = getGardenProgress(gardenGrowth);
  const growthSummary = gardenGrowthSummary(gardenGrowth);
  const careSuggestion = getCareSuggestion(checkin);
  const pulseSchedule = swemwbsSchedule(wellbeingPulses.map((pulse) => pulse.completedDate), todayKey());
  const pulseDue = process.env.EXPO_PUBLIC_ENABLE_SWEMWBS !== 'false' && pulseSchedule.due;

  useEffect(() => {
    if (planOpen || rewardVisible || ambientSpeechCount.current >= 2) return;
    let timer: ReturnType<typeof setTimeout>;
    const ambientLines = [
      ...(pulseDue ? ['A robin left a letter for you. It can wait until you have two quiet minutes.'] : []),
      garden.next ? `I have been wondering where the ${garden.next.shortTitle.toLowerCase()} might fit.` : 'The garden feels settled today.',
      checkin ? 'We do not have to add anything else today.' : 'I might look by the pond while you arrive.',
    ];

    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        const sinceLastSpeech = Date.now() - lastSpeechAt.current;
        if (sinceLastSpeech < 12000) {
          schedule(12000 - sinceLastSpeech);
          return;
        }
        const next = ambientSpeechCount.current === 0
          ? defaultMessage
          : ambientLines[Math.floor(Math.random() * ambientLines.length)];
        setMessage(next);
        setMessageVersion((version) => version + 1);
        setCompanionState('notice');
        lastSpeechAt.current = Date.now();
        ambientSpeechCount.current += 1;
        reactionTimer.current = setTimeout(() => setCompanionState('idle'), 1800);
        if (ambientSpeechCount.current < 2) schedule(52000 + Math.round(Math.random() * 32000));
      }, delay);
    };

    schedule(ambientSpeechCount.current === 0 ? 1400 : 52000);
    return () => clearTimeout(timer);
  }, [checkin, defaultMessage, garden.next, planOpen, pulseDue, rewardVisible]);

  const handleTask = (id: string, wasDone: boolean) => {
    toggleTask(id);
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlanOpen(false);
    if (!wasDone) {
      feedback.soft();
      react('plant', "I'll take that one to the garden.");
    } else {
      feedback.select();
      react('notice', 'No problem. Plans are allowed to change.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.skyPale }}>
      <View style={{ flex: 1 }}>
        <Garden growth={gardenGrowth} mode="quiet" restState={gardenRest.id} />

        <Pressable accessibilityLabel="Go inside the shed to journal" accessibilityRole="button" onPress={() => router.push('/journal')} style={({ pressed }) => ({ position: 'absolute', ...GARDEN_HOTSPOTS.shed, borderRadius: 28, backgroundColor: pressed ? 'rgba(255,241,189,0.16)' : 'transparent' })} />
        <Pressable accessibilityLabel="Go to the bench to breathe" accessibilityRole="button" onPress={() => router.push('/breathe')} style={({ pressed }) => ({ position: 'absolute', ...GARDEN_HOTSPOTS.bench, borderRadius: 30, backgroundColor: pressed ? 'rgba(255,254,247,0.13)' : 'transparent' })} />
        <Pressable accessibilityLabel="Open the quiet garden by the pond" accessibilityRole="button" onPress={() => { feedback.select(); router.push('/garden' as never); }} style={({ pressed }) => ({ position: 'absolute', ...GARDEN_HOTSPOTS.pond, borderRadius: 42, backgroundColor: pressed ? 'rgba(218,239,230,0.14)' : 'transparent' })} />

        <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 12, left: 18, right: 18, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.push('/garden-progress' as never)} accessibilityRole="button" accessibilityLabel={`Open garden journal. ${garden.current?.title ?? 'The garden is waiting for its first shoots'}`} style={({ pressed }) => ({ borderRadius: 18, backgroundColor: 'rgba(255,254,247,0.82)', paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(49,91,69,0.12)', opacity: pressed ? 0.7 : 1 })}>
            <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.5 }}>{today.day.toUpperCase()}</BodyBold>
            <Display size={25} color={MS.color.inkSoft}>{today.date}</Display>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Feather name="feather" size={11} color={MS.color.forestMuted} /><Body size={10.5} color={MS.color.forestMuted}>{garden.current?.shortTitle ?? 'Garden waiting'}</Body><Feather name="chevron-right" size={11} color={MS.color.forestMuted} /></View>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {pulseDue && <Pressable accessibilityLabel="Open your waiting fortnightly wellbeing letter" accessibilityRole="button" onPress={() => { feedback.select(); router.push('/pulse'); }} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5E8C8', borderWidth: 1, borderColor: 'rgba(99,72,43,0.16)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><Feather name="mail" size={17} color={MS.color.forest} /><View style={{ position: 'absolute', right: 6, top: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#C97C5D', borderWidth: 1, borderColor: '#FFFDF4' }} /></Pressable>}
            <Pressable accessibilityLabel="Open quiet garden" accessibilityHint="Opens an unobstructed garden where you can spend time with Bramble" accessibilityRole="button" onPress={() => { feedback.select(); router.push('/garden' as never); }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.84)', borderWidth: 1, borderColor: 'rgba(49,91,69,0.14)', alignItems: 'center', justifyContent: 'center' }}><Feather name="maximize-2" size={16} color={MS.color.forest} /></Pressable>
          </View>
        </View>

        {!planOpen && <>
          <WanderingBramble size={132} mood={checkin ? 'happy' : 'calm'} state={companionState} accessibilityLabel="Talk to Bramble" message={rewardVisible ? undefined : message} messageVersion={messageVersion} eyebrow={`${today.greeting.toUpperCase()}, FROM BRAMBLE`} onPress={() => react('greet', 'Hi. I was hoping you would visit.')} onPet={() => react('curl', 'That is rather lovely. I might stay here a moment.')} />
        </>}

        {rewardVisible && !planOpen && <Pressable onPress={() => router.push('/garden-progress' as never)} accessibilityRole="button" style={({ pressed }) => ({ position: 'absolute', left: 58, right: 24, bottom: 218, backgroundColor: 'rgba(255,254,247,0.96)', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: `${MS.color.forest}26`, shadowColor: MS.color.shadow, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3, opacity: pressed ? 0.74 : 1 })}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>{growthSummary.eyebrow}</BodyBold><Display size={18} color={MS.color.forest} style={{ marginTop: 2 }}>{growthSummary.title}</Display><Body size={11} color={MS.color.muted} style={{ marginTop: 2 }}>{growthSummary.detail}</Body><BodyBold size={10.5} color={MS.color.forest} style={{ marginTop: 8 }}>Open garden journal →</BodyBold></Pressable>}
      </View>

      {!planOpen ? (
        <Pressable
          onPress={togglePlan}
          accessibilityRole="button"
          accessibilityLabel="Open today’s quiet plan"
          style={({ pressed }) => ({ position: 'absolute', left: 16, bottom: 14, width: dockWidth, minHeight: 58, borderRadius: 20, backgroundColor: 'rgba(255,254,247,0.94)', borderWidth: 1, borderColor: 'rgba(49,91,69,0.14)', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: MS.color.shadow, shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 5, opacity: pressed ? 0.72 : 1 })}>
          <View style={{ width: 36, height: 36, borderRadius: 14, backgroundColor: checkin ? MS.color.sageSoft : MS.color.surfaceWarm, alignItems: 'center', justifyContent: 'center' }}><Feather name={checkin ? 'check' : 'sun'} size={16} color={MS.color.forest} /></View>
          <View style={{ flex: 1 }}><BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.05 }}>TODAY</BodyBold><Heading size={13.5} color={MS.color.inkSoft} numberOfLines={1}>{checkin ? `${doneCount} of ${tasks.length} complete` : 'Start check-in'}</Heading></View>
          <Feather name="chevron-up" size={16} color={MS.color.forest} />
        </Pressable>
      ) : (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: planHeight, backgroundColor: MS.color.cream, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderTopWidth: 1, borderColor: `${MS.color.ink}12`, shadowColor: MS.color.shadow, shadowOpacity: 0.18, shadowRadius: 22, shadowOffset: { width: 0, height: -8 }, elevation: 12, overflow: 'hidden' }}>
          <Pressable onPress={togglePlan} accessibilityRole="button" accessibilityLabel="Close today’s quiet plan" style={{ paddingTop: 10, paddingBottom: 8, paddingHorizontal: 18 }}>
            <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: `${MS.color.ink}24`, alignSelf: 'center' }} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 }}><View style={{ flex: 1 }}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3 }}>TODAY</BodyBold><Heading size={22} color={MS.color.inkSoft}>Your quiet plan</Heading></View><View style={{ alignItems: 'flex-end' }}><BodyBold size={11} color={MS.color.forest}>{doneCount} of {tasks.length}</BodyBold><Body size={10} color={MS.color.faint}>Tap to close</Body></View><Feather name="chevron-down" size={18} color={MS.color.forest} style={{ marginLeft: 8, marginBottom: 8 }} /></View>
          </Pressable>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            <Card color={MS.color.surface} radius={MS.radius.xl} padding={15} style={{ borderWidth: 0 }}>
              {checkin ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MOODS[checkin.mood - 1]?.color, alignItems: 'center', justifyContent: 'center' }}><Feather name="check" size={18} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1 }}>CHECK-IN COMPLETE</BodyBold><Heading size={16} color={MS.color.inkSoft}>You made space for yourself</Heading><Body size={10.5} color={MS.color.muted}>The garden noticed.</Body></View><Pressable onPress={() => router.push('/check-in')} accessibilityRole="button" hitSlop={12}><BodyBold size={11} color={MS.color.forest}>Edit</BodyBold></Pressable></View> : <View><View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}><View style={{ flex: 1 }}><BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1 }}>START HERE</BodyBold><Heading size={17} color={MS.color.inkSoft}>How are you, really?</Heading></View><Body size={10.5} color={MS.color.faint}>About 30 seconds</Body></View><MoodPicker onChange={(mood) => { feedback.select(); router.push({ pathname: '/check-in', params: { mood: String(mood) } }); }} /></View>}
            </Card>

            {checkin && <Pressable onPress={() => router.push(careSuggestion.route)} accessibilityRole="button" accessibilityLabel={`${careSuggestion.title}. ${careSuggestion.action}`} style={({ pressed }) => ({ marginTop: 10, borderRadius: MS.radius.xl, backgroundColor: careSuggestion.tone, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.66 : 1 })}><View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,254,247,0.7)', alignItems: 'center', justifyContent: 'center' }}><Feather name={careSuggestion.icon as never} size={17} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1 }}>A KINDER FIT FOR TODAY</BodyBold><Heading size={14.5} color={MS.color.inkSoft} style={{ marginTop: 1 }}>{careSuggestion.title}</Heading><Body size={10.5} color={MS.color.muted}>{careSuggestion.action}</Body></View><Feather name="arrow-right" size={16} color={MS.color.forestMuted} /></Pressable>}

            <View style={{ height: 5, borderRadius: 3, backgroundColor: `${MS.color.forest}12`, marginTop: 14, overflow: 'hidden' }}><View style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 3, backgroundColor: MS.color.sage }} /></View>
            <Card color={MS.color.surface} radius={MS.radius.xl} padding={12} style={{ marginTop: 10, borderWidth: 0 }}>
              {tasks.map((task, index) => <View key={task.id}><TaskRow title={task.title} icon={task.icon} color={task.color} done={task.done} onToggle={() => handleTask(task.id, task.done)} onRemove={() => { removeTask(task.id); feedback.select(); react('notice', 'A smaller plan is still a good plan.'); }} />{index < tasks.length - 1 && <View style={{ height: 1, backgroundColor: `${MS.color.ink}10`, marginLeft: 50 }} />}</View>)}
              {!tasks.length && <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 }}><Feather name="feather" size={20} color={MS.color.sage} /><Heading size={15} color={MS.color.inkSoft} style={{ marginTop: 8 }}>Nothing is waiting</Heading><Body size={10.5} color={MS.color.muted} style={{ textAlign: 'center', marginTop: 3 }}>Leave today open, or choose one gentle thing through the gate.</Body><Pressable onPress={() => router.push('/activities')} accessibilityRole="button" style={{ marginTop: 12, borderRadius: 999, backgroundColor: MS.color.sageSoft, paddingVertical: 8, paddingHorizontal: 13 }}><BodyBold size={10.5} color={MS.color.forest}>Choose something</BodyBold></Pressable></View>}
            </Card>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
