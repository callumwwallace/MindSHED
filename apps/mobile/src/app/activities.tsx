import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBramble, type CompanionState } from '@/components/ms/animated-bramble';
import { BrambleDialogue } from '@/components/ms/bramble-dialogue';
import { Body, BodyBold, Heading } from '@/components/ms/text';
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
  const [messageVersion, setMessageVersion] = useState(0);

  const add = (activity: Activity) => {
    addTask(activity.title, activity.icon, activity.color);
    setBrambleState('plant');
    setMessage("I'll carry that one back to today.");
    setMessageVersion((version) => version + 1);
    feedback.soft();
    setTimeout(() => setBrambleState('wander'), 1400);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => goBackOrReplace('/(tabs)/places')}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={16} color={MS.color.forest} />
        </Pressable>
        <BodyBold size={9.5} color={MS.color.forestMuted} style={{ marginLeft: 12, letterSpacing: 1.3 }}>THROUGH THE GATE</BodyBold>
      </View>

      <Heading size={24} color={MS.color.inkSoft} style={{ marginTop: 20 }}>One gentle thing</Heading>
      <Body size={12} color={MS.color.muted} style={{ marginTop: 4, maxWidth: 300 }}>
        Add one small action to today. Enough is enough; there is no target to hit.
      </Body>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 20, marginBottom: 14 }}>
        <AnimatedBramble size={76} state={brambleState} mood="calm" />
        <BrambleDialogue message={message} messageVersion={messageVersion} width={238} tailSide="left" style={{ marginLeft: 4, marginBottom: 13 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
        {CATEGORIES.map((category) => <Pressable key={category} onPress={() => setFilter(category)} accessibilityRole="radio" accessibilityState={{ selected: filter === category }} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 999, backgroundColor: filter === category ? MS.color.forest : MS.color.surface }}><BodyBold size={10.5} color={filter === category ? MS.color.surface : MS.color.forest}>{category}</BodyBold></Pressable>)}
      </ScrollView>

      <View style={{ borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, paddingHorizontal: 14 }}>
        {ACTIVITIES.filter((activity) => filter === 'All' || activity.category === filter).map((activity, index, filtered) => {
          const existing = tasks.find((task) => task.title === activity.title);
          const isAdded = !!existing;
          return (
            <View key={activity.id}>
              <Pressable
                onPress={() => {
                  if (existing) {
                    removeTask(existing.id);
                    setBrambleState('notice');
                    setMessage('Smaller is allowed. I left that one here.');
                    setMessageVersion((version) => version + 1);
                    feedback.select();
                  } else add(activity);
                }}
                accessibilityLabel={`${isAdded ? 'Remove' : 'Add'} ${activity.title} ${isAdded ? 'from' : 'to'} today's plan`}
                accessibilityRole="button"
                accessibilityState={{ selected: isAdded }}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, opacity: pressed ? 0.62 : 1 })}>
                <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: activity.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={activity.icon as never} size={16} color={MS.color.inkSoft} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <BodyBold size={12.5} color={MS.color.inkSoft}>{activity.title}</BodyBold>
                  <Body size={10} color={MS.color.muted}>{activity.category} · {activity.duration}</Body>
                </View>
                <View style={{ width: 31, height: 31, borderRadius: 16, borderWidth: 1, borderColor: isAdded ? MS.color.sage : `${MS.color.forest}36`, backgroundColor: isAdded ? MS.color.sageSoft : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={isAdded ? 'minus' : 'plus'} size={15} color={MS.color.forest} />
                </View>
              </Pressable>
              {index < filtered.length - 1 && <View style={{ height: 1, marginLeft: 50, backgroundColor: `${MS.color.ink}0F` }} />}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
