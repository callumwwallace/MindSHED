import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GrowPlayScene } from '@/components/ms/grow-play-scene';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { HABIT_RHYTHMS, habitReturnsInLastDays, recentHabitDays, type HabitRhythm } from '@/lib/habits';
import { goBackOrReplace } from '@/lib/navigation';
import { todayKey, useWellness } from '@/store/wellness';

const PRESETS = [
  { title: 'Step outside', tinyVersion: 'Open a window for one slow breath', icon: 'sun' },
  { title: 'Drink some water', tinyVersion: 'Take three unhurried sips', icon: 'droplet' },
  { title: 'Reach out', tinyVersion: 'Send one simple hello', icon: 'message-circle' },
  { title: 'Move a little', tinyVersion: 'Roll my shoulders once', icon: 'activity' },
  { title: 'Wind down', tinyVersion: 'Put my phone down for two minutes', icon: 'moon' },
  { title: 'Write one thought', tinyVersion: 'Write one honest sentence', icon: 'edit-3' },
] as const;

const RHYTHMS: HabitRhythm[] = ['three-week', 'daily', 'weekdays', 'flexible'];
type Stage = 'overview' | 'choose' | 'custom' | 'rhythm';

export default function NurseryScreen() {
  const insets = useSafeAreaInsets();
  const habits = useWellness((state) => state.habits);
  const addHabit = useWellness((state) => state.addHabit);
  const toggleHabitToday = useWellness((state) => state.toggleHabitToday);
  const setHabitPaused = useWellness((state) => state.setHabitPaused);
  const removeHabit = useWellness((state) => state.removeHabit);
  const [stage, setStage] = useState<Stage>('overview');
  const [title, setTitle] = useState('');
  const [tinyVersion, setTinyVersion] = useState('');
  const [rhythm, setRhythm] = useState<HabitRhythm>('three-week');
  const today = todayKey();

  const resetBuilder = () => {
    setTitle('');
    setTinyVersion('');
    setRhythm('three-week');
    setStage('overview');
  };

  const choosePreset = (preset: (typeof PRESETS)[number]) => {
    setTitle(preset.title);
    setTinyVersion(preset.tinyVersion);
    setStage('rhythm');
    feedback.select();
  };

  const add = () => {
    if (!title.trim() || !tinyVersion.trim() || habits.length >= 3) return;
    addHabit(title, tinyVersion, rhythm);
    feedback.success();
    resetBuilder();
  };

  const confirmRemove = (id: string, habitTitle: string) => Alert.alert(
    'Remove this habit?',
    `The Nursery will remove “${habitTitle}” and its return history.`,
    [{ text: 'Keep it', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeHabit(id) }],
  );

  const builderBack = () => {
    if (stage === 'rhythm') setStage(title && !PRESETS.some((preset) => preset.title === title) ? 'custom' : 'choose');
    else if (stage === 'custom') setStage('choose');
    else resetBuilder();
  };

  if (stage !== 'overview') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 38 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Pressable onPress={builderBack} accessibilityRole="button" accessibilityLabel="Go back one step" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="arrow-left" size={18} color={MS.color.forest} /></Pressable>
          <BodyBold size={9.5} color={MS.color.forestMuted} style={{ marginLeft: 12, letterSpacing: 1.2 }}>PLANT A HABIT</BodyBold>
        </View>
        <GrowPlayScene variant="nursery" height={190} state={stage === 'rhythm' ? 'plant' : 'notice'} message={stage === 'choose' ? 'Would a ready-made idea help, or do you have one of your own?' : stage === 'custom' ? 'Keep it kind enough for a difficult day.' : 'One last choice, then we can plant it.'} />

        {stage === 'choose' && <>
          <Display size={25} color={MS.color.inkSoft} style={{ marginTop: 22 }}>What would you like to grow?</Display>
          <Body size={11} color={MS.color.muted} style={{ marginTop: 5 }}>Start with one of these, or write something that fits your life.</Body>
          <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.1, marginTop: 21, marginBottom: 9 }}>READY-MADE IDEAS</BodyBold>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
            {PRESETS.map((preset) => <Pressable key={preset.title} onPress={() => choosePreset(preset)} accessibilityRole="button" accessibilityLabel={`Choose ${preset.title}`} style={({ pressed }) => ({ width: '48.5%', minHeight: 82, borderRadius: 19, backgroundColor: MS.color.surface, padding: 13, opacity: pressed ? 0.7 : 1 })}><Feather name={preset.icon} size={16} color={MS.color.forest} /><BodyBold size={11} color={MS.color.inkSoft} style={{ marginTop: 8 }}>{preset.title}</BodyBold><Body size={8.8} color={MS.color.muted} style={{ marginTop: 2 }}>{preset.tinyVersion}</Body></Pressable>)}
          </View>
          <Pressable onPress={() => { setTitle(''); setTinyVersion(''); setStage('custom'); feedback.select(); }} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 58, borderRadius: 19, borderWidth: 1.5, borderColor: MS.color.forest, marginTop: 13, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.7 : 1 })}><View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="edit-3" size={15} color={MS.color.forest} /></View><BodyBold size={12} color={MS.color.forest}>Write my own habit</BodyBold><Feather name="chevron-right" size={17} color={MS.color.forest} style={{ marginLeft: 'auto' }} /></Pressable>
        </>}

        {stage === 'custom' && <>
          <Display size={25} color={MS.color.inkSoft} style={{ marginTop: 22 }}>Write your own</Display>
          <Body size={11} color={MS.color.muted} style={{ marginTop: 5 }}>Two short answers are enough.</Body>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ marginTop: 22, marginBottom: 7 }}>MY HABIT</BodyBold>
          <TextInput value={title} onChangeText={setTitle} placeholder="For example, read before bed" placeholderTextColor={MS.color.faint} maxLength={80} accessibilityLabel="My habit" style={{ minHeight: 56, borderRadius: 18, backgroundColor: MS.color.surface, paddingHorizontal: 15, fontFamily: MS.font.bodyBold, fontSize: 14, color: MS.color.inkSoft }} />
          <BodyBold size={10} color={MS.color.forestMuted} style={{ marginTop: 17, marginBottom: 7 }}>ON A HARD DAY, I CAN SIMPLY…</BodyBold>
          <TextInput value={tinyVersion} onChangeText={setTinyVersion} placeholder="For example, read one sentence" placeholderTextColor={MS.color.faint} maxLength={120} accessibilityLabel="Smallest version of my habit" style={{ minHeight: 56, borderRadius: 18, backgroundColor: MS.color.surface, paddingHorizontal: 15, fontFamily: MS.font.body, fontSize: 14, color: MS.color.inkSoft }} />
          <PillButton label="Choose a gentle rhythm" onPress={() => setStage('rhythm')} disabled={!title.trim() || !tinyVersion.trim()} style={{ marginTop: 22 }} />
        </>}

        {stage === 'rhythm' && <>
          <Display size={25} color={MS.color.inkSoft} style={{ marginTop: 22 }}>How often feels realistic?</Display>
          <Body size={11} color={MS.color.muted} style={{ marginTop: 5 }}>This is a reminder, never a target. You can pause it anytime.</Body>
          <View style={{ borderRadius: 20, backgroundColor: MS.color.surface, padding: 14, marginTop: 17 }}><BodyBold size={9} color={MS.color.forestMuted}>YOU CHOSE</BodyBold><Heading size={16} color={MS.color.inkSoft} style={{ marginTop: 3 }}>{title}</Heading><Body size={10} color={MS.color.muted} style={{ marginTop: 2 }}>Hard-day version: {tinyVersion}</Body></View>
          <View style={{ gap: 8, marginTop: 12 }}>{RHYTHMS.map((key) => { const item = HABIT_RHYTHMS[key]; const selected = rhythm === key; return <Pressable key={key} onPress={() => { setRhythm(key); feedback.select(); }} accessibilityRole="radio" accessibilityState={{ selected }} style={{ minHeight: 57, borderRadius: 18, backgroundColor: selected ? MS.color.sageSoft : MS.color.surface, borderWidth: 1.5, borderColor: selected ? MS.color.forest : 'transparent', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 11 }}><View style={{ width: 21, height: 21, borderRadius: 11, borderWidth: 1.5, borderColor: selected ? MS.color.forest : MS.color.faint, alignItems: 'center', justifyContent: 'center' }}>{selected && <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: MS.color.forest }} />}</View><View style={{ flex: 1 }}><BodyBold size={11.5} color={MS.color.inkSoft}>{item.label}</BodyBold><Body size={9.3} color={MS.color.muted}>{item.detail}</Body></View></Pressable>; })}</View>
          <PillButton label="Plant this habit" onPress={add} style={{ marginTop: 18 }} />
        </>}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 42 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}><Pressable onPress={() => goBackOrReplace('/(tabs)/places')} accessibilityRole="button" accessibilityLabel="Back to Places" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name="arrow-left" size={18} color={MS.color.forest} /></Pressable><BodyBold size={9.5} color={MS.color.forestMuted} style={{ marginLeft: 12, letterSpacing: 1.25 }}>THE NURSERY</BodyBold></View>
      <View style={{ marginTop: 15 }}><GrowPlayScene variant="nursery" state={habits.length ? 'notice' : 'plant'} eyebrow="NO STREAKS · NO LOST PROGRESS" message={habits.length ? 'Your habits are here whenever you want to return.' : 'Let’s choose one small thing to grow together.'} /></View>
      <Display size={29} color={MS.color.inkSoft} style={{ marginTop: 20 }}>Grow one small habit</Display>
      <Body size={11.5} color={MS.color.muted} style={{ marginTop: 5 }}>Returning counts, and resting never loses progress.</Body>

      {!!habits.length && <>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.25, marginTop: 24, marginBottom: 9 }}>YOUR HABITS</BodyBold>
        <View style={{ gap: 10 }}>{habits.map((habit) => {
          const tended = habit.completions.includes(today);
          const days = recentHabitDays(habit, today);
          const returns = habitReturnsInLastDays(habit, today);
          return <View key={habit.id} style={{ borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, padding: 16, opacity: habit.paused ? 0.68 : 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}><View style={{ width: 46, height: 46, borderRadius: 17, backgroundColor: tended ? MS.color.mintSoft : MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name={habit.paused ? 'pause' : tended ? 'check' : 'sun'} size={18} color={MS.color.forest} /></View><View style={{ flex: 1 }}><Heading size={16} color={MS.color.inkSoft}>{habit.title}</Heading><Body size={10.3} color={MS.color.muted} style={{ marginTop: 2 }}>On a hard day: {habit.tinyVersion}</Body><BodyBold size={9.3} color={MS.color.forestMuted} style={{ marginTop: 5 }}>{returns} {returns === 1 ? 'return' : 'returns'} in the last week</BodyBold></View></View>
            <View style={{ flexDirection: 'row', gap: 7, marginTop: 14 }}>{days.map((day) => <View key={day.key} style={{ flex: 1, alignItems: 'center', gap: 5 }}><View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: day.completed ? MS.color.forest : `${MS.color.forest}0E`, borderWidth: 1, borderColor: day.completed ? MS.color.forest : `${MS.color.forest}20`, alignItems: 'center', justifyContent: 'center' }}>{day.completed && <Feather name="check" size={11} color={MS.color.surface} />}</View><Body size={8.5} color={MS.color.faint}>{day.label}</Body></View>)}</View>
            {!habit.paused && <PillButton label={tended ? 'Done today — undo' : 'I did this today'} onPress={() => { toggleHabitToday(habit.id); feedback.soft(); }} color={tended ? MS.color.sageSoft : MS.color.forest} textColor={tended ? MS.color.forest : MS.color.surface} style={{ marginTop: 14 }} size={11.5} />}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 8 }}><Pressable onPress={() => setHabitPaused(habit.id, !habit.paused)} accessibilityRole="button" style={{ padding: 7 }}><BodyBold size={10} color={MS.color.forestMuted}>{habit.paused ? 'Bring back' : 'Pause'}</BodyBold></Pressable><Pressable onPress={() => confirmRemove(habit.id, habit.title)} accessibilityRole="button" style={{ padding: 7 }}><BodyBold size={10} color={MS.color.danger}>Remove</BodyBold></Pressable></View>
          </View>;
        })}</View>
      </>}

      {habits.length < 3 ? <View style={{ marginTop: habits.length ? 18 : 22 }}><PillButton label={habits.length ? 'Plant another habit' : 'Choose or write a habit'} onPress={() => setStage('choose')} /><Body size={10} color={MS.color.forestMuted} style={{ textAlign: 'center', marginTop: 9 }}>{habits.length}/3 spaces used · habits can be paused or removed</Body></View> : <Body size={10.5} color={MS.color.forestMuted} style={{ textAlign: 'center', marginTop: 18 }}>The Nursery has three habits for now. Pause or remove one before planting another.</Body>}
    </ScrollView>
  );
}
