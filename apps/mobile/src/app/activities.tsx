import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CompanionState } from '@/components/ms/animated-bramble';
import { GateChoiceScene } from '@/components/ms/immersive-place-scene';
import { Body, BodyBold, CharacterText, Display, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { goBackOrReplace } from '@/lib/navigation';
import { useWellness } from '@/store/wellness';

interface Activity {
  id: string;
  title: string;
  category: string;
  duration: string;
  icon: string;
  color: string;
}

const ACTIVITIES: Activity[] = [
  { id: 'a1', title: 'Walk a different route home', category: 'Move', duration: '15 min', icon: 'map', color: MS.color.sageSoft },
  { id: 'a2', title: 'Call someone from home', category: 'Connect', duration: '10 min', icon: 'phone', color: '#F6E8C3' },
  { id: 'a3', title: 'Phone-free lunch', category: 'Unplug', duration: '30 min', icon: 'smartphone', color: '#DDECEF' },
  { id: 'a4', title: 'Lights out by 11 tonight', category: 'Rest', duration: 'Tonight', icon: 'moon', color: '#F2D7B8' },
  { id: 'a5', title: 'Tidy one small corner', category: 'Reset', duration: '10 min', icon: 'home', color: MS.color.sageSoft },
  { id: 'a6', title: 'Stretch for five minutes', category: 'Move', duration: '5 min', icon: 'activity', color: '#F8DFD7' },
  { id: 'a7', title: 'Message a coursemate', category: 'Connect', duration: '5 min', icon: 'message-circle', color: '#F6E8C3' },
  { id: 'a8', title: 'Drink water before coffee', category: 'Care', duration: '1 min', icon: 'droplet', color: '#DDECEF' },
  { id: 'a9', title: 'Stand by an open window', category: 'Reset', duration: '2 min', icon: 'wind', color: MS.color.sageSoft },
  { id: 'a10', title: 'Put one task on paper', category: 'Unplug', duration: '3 min', icon: 'edit-3', color: '#F6E8C3' },
  { id: 'a11', title: 'Walk to the end of the street', category: 'Move', duration: '8 min', icon: 'navigation', color: '#DDECEF' },
  { id: 'a12', title: 'Ask someone how they are', category: 'Connect', duration: '5 min', icon: 'users', color: '#F8DFD7' },
  { id: 'a13', title: 'Make the next drink slowly', category: 'Care', duration: '5 min', icon: 'coffee', color: '#F2D7B8' },
  { id: 'a14', title: 'Put your phone across the room', category: 'Unplug', duration: '20 min', icon: 'smartphone', color: '#E6E9D2' },
  { id: 'a15', title: 'Stretch your shoulders', category: 'Move', duration: '3 min', icon: 'activity', color: '#F8DFD7' },
  { id: 'a16', title: 'Choose tomorrow’s first step', category: 'Reset', duration: '4 min', icon: 'corner-down-right', color: MS.color.sageSoft },
  { id: 'a17', title: 'Eat something away from a screen', category: 'Care', duration: '15 min', icon: 'circle', color: '#F6E8C3' },
  { id: 'a18', title: 'Send one honest message', category: 'Connect', duration: '5 min', icon: 'send', color: '#DDECEF' },
  { id: 'a19', title: 'Notice five things around you', category: 'Reset', duration: '2 min', icon: 'eye', color: '#E6E9D2' },
  { id: 'a20', title: 'Take the stairs once', category: 'Move', duration: '5 min', icon: 'trending-up', color: '#F2D7B8' },
];

const CATEGORIES = ['All', 'Move', 'Connect', 'Care', 'Reset', 'Unplug'];

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const addTask = useWellness((state) => state.addTask);
  const removeTask = useWellness((state) => state.removeTask);
  const tasks = useWellness((state) => state.tasks);
  const [filter, setFilter] = useState('All');
  const [brambleState, setBrambleState] = useState<CompanionState>('wander');
  const [message, setMessage] = useState('Choose the smallest thing that feels possible.');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const filtered = ACTIVITIES.filter((activity) => filter === 'All' || activity.category === filter);
  const suggestion = filtered[suggestionIndex % filtered.length];
  const existing = tasks.find((task) => task.title === suggestion.title);

  const add = (activity: Activity) => {
    addTask(activity.title, activity.icon, activity.color);
    setBrambleState('plant');
    setMessage("I'll carry that one back to today.");
    feedback.soft();
    setTimeout(() => setBrambleState('wander'), 1400);
  };

  const chooseFilter = (category: string) => {
    setFilter(category);
    setSuggestionIndex(0);
    setBrambleState(category === 'All' ? 'wander' : 'notice');
    setMessage(category === 'All' ? 'Let’s see what the path offers.' : `${category} feels like a useful direction.`);
    feedback.select();
  };

  const another = () => {
    setSuggestionIndex((value) => (value + 1) % filtered.length);
    setBrambleState('notice');
    setMessage('Or perhaps this would fit more gently.');
    feedback.select();
    setTimeout(() => setBrambleState('wander'), 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#A9C296' }}>
      <GateChoiceScene brambleState={brambleState} />
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(31,57,44,0.08)' }} />

      <Pressable
        onPress={() => goBackOrReplace('/(tabs)/places')}
        accessibilityLabel="Back to Places"
        accessibilityRole="button"
        style={{ position: 'absolute', zIndex: 5, left: 18, top: insets.top + 12, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.9)', alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="arrow-left" size={17} color={MS.color.forest} />
      </Pressable>

      <View pointerEvents="none" style={{ position: 'absolute', left: 76, right: 18, top: insets.top + 15 }}>
        <BodyBold size={9.5} color="rgba(49,91,69,0.72)" style={{ letterSpacing: 1.25 }}>THROUGH THE GATE</BodyBold>
        <Display size={28} color={MS.color.inkSoft}>One gentle thing</Display>
      </View>

      <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 15, borderRadius: 28, backgroundColor: 'rgba(255,249,218,0.93)', borderWidth: 1, borderColor: 'rgba(49,91,69,0.13)', padding: 15 }}>
        <CharacterText size={11.5} color={MS.color.forestMuted} style={{ lineHeight: 16 }}>{message}</CharacterText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingVertical: 11 }} accessibilityLabel="Choose a direction">
          {CATEGORIES.map((category) => <Pressable key={category} onPress={() => chooseFilter(category)} accessibilityRole="radio" accessibilityState={{ selected: filter === category }} style={{ paddingVertical: 7, paddingHorizontal: 11, borderRadius: 8, backgroundColor: filter === category ? MS.color.forest : '#E2D4AD', borderWidth: 1, borderColor: filter === category ? MS.color.forest : '#BBAA81' }}><BodyBold size={9.5} color={filter === category ? MS.color.surface : MS.color.inkSoft}>{category}</BodyBold></Pressable>)}
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,254,247,0.82)', padding: 13 }}>
          <View style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: suggestion.color, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={suggestion.icon as never} size={18} color={MS.color.inkSoft} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Heading size={14} color={MS.color.inkSoft}>{suggestion.title}</Heading>
            <Body size={10} color={MS.color.muted} style={{ marginTop: 2 }}>{suggestion.category} · {suggestion.duration}</Body>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 9, marginTop: 10 }}>
          <Pressable onPress={another} accessibilityRole="button" accessibilityLabel="Show another suggestion" style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: `${MS.color.forest}2A`, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}><Feather name="refresh-cw" size={17} color={MS.color.forest} /></Pressable>
          <Pressable
            onPress={() => {
              if (existing) {
                removeTask(existing.id);
                setBrambleState('notice');
                setMessage('Smaller is allowed. I left that one here.');
                feedback.select();
              } else add(suggestion);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: !!existing }}
            accessibilityLabel={`${existing ? 'Remove' : 'Add'} ${suggestion.title} ${existing ? 'from' : 'to'} today's plan`}
            style={({ pressed }) => ({ flex: 1, minHeight: 48, borderRadius: 24, backgroundColor: existing ? MS.color.sageSoft : MS.color.forest, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: pressed ? 0.7 : 1 })}>
            <Feather name={existing ? 'check' : 'plus'} size={16} color={existing ? MS.color.forest : MS.color.surface} />
            <BodyBold size={11.5} color={existing ? MS.color.forest : MS.color.surface}>{existing ? 'Added to today' : 'Take this with me'}</BodyBold>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
