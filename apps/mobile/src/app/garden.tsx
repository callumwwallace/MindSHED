import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type CompanionState } from '@/components/ms/animated-bramble';
import { Garden, GARDEN_HOTSPOTS } from '@/components/ms/garden';
import { WanderingBramble } from '@/components/ms/wandering-bramble';
import { MS } from '@/constants/mindshed';
import { getGardenRestState } from '@/lib/garden-progress';
import { feedback } from '@/lib/haptics';
import { goBackOrReplace } from '@/lib/navigation';
import { useTodayCheckin, useWellness } from '@/store/wellness';

export default function QuietGardenScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ previewGrowth?: string; previewRest?: string }>();
  const gardenGrowth = useWellness((state) => state.gardenGrowth);
  const checkins = useWellness((state) => state.checkins);
  const checkin = useTodayCheckin();
  const gardenRest = getGardenRestState(checkins.map((item) => item.date));
  const requestedGrowth = Number(params.previewGrowth);
  const displayGrowth = __DEV__ && Number.isFinite(requestedGrowth) ? Math.max(0, Math.floor(requestedGrowth)) : gardenGrowth;
  const requestedRest = params.previewRest;
  const displayRest = __DEV__ && ['waiting', 'bright', 'quiet', 'resting'].includes(requestedRest ?? '')
    ? requestedRest as typeof gardenRest.id
    : gardenRest.id;
  const [message, setMessage] = useState('Nothing to finish here. Just stay awhile.');
  const [messageVersion, setMessageVersion] = useState(0);
  const [state, setState] = useState<CompanionState>('wander');

  const respond = (nextState: CompanionState, nextMessage: string) => {
    setState(nextState);
    setMessage(nextMessage);
    setMessageVersion((version) => version + 1);
    setTimeout(() => setState('wander'), 1800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.skyPale }}>
      <Garden growth={displayGrowth} mode="quiet" restState={displayRest} />

      <Pressable
        accessibilityLabel="Sit with Bramble on the bench"
        accessibilityRole="button"
        onPress={() => {
          feedback.select();
          respond('listen', 'We can sit here as long as you like.');
        }}
        style={({ pressed }) => ({ position: 'absolute', ...GARDEN_HOTSPOTS.bench, borderRadius: 30, backgroundColor: pressed ? 'rgba(255,254,247,0.13)' : 'transparent' })}
      />
      <Pressable
        accessibilityLabel="Look at the pond"
        accessibilityRole="button"
        onPress={() => {
          feedback.select();
          respond('notice', 'I think I saw something move under the lily pad.');
        }}
        style={({ pressed }) => ({ position: 'absolute', ...GARDEN_HOTSPOTS.pond, borderRadius: 42, backgroundColor: pressed ? 'rgba(218,239,230,0.14)' : 'transparent' })}
      />

      <Pressable
        onPress={() => goBackOrReplace('/')}
        accessibilityLabel="Leave quiet garden"
        accessibilityRole="button"
        style={{
          position: 'absolute',
          top: insets.top + 12,
          right: 18,
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 254, 247, 0.72)',
        }}>
        <Feather name="x" size={16} color={MS.color.forest} />
      </Pressable>

      <WanderingBramble
        size={140}
        mood={checkin ? 'happy' : 'calm'}
        state={state}
        message={message}
        messageVersion={messageVersion}
        onPress={() => respond('greet', 'Oh, hello. I was listening to the garden.')}
        onPet={() => respond('curl', 'A quiet little fuss. My favourite kind.')}
      />
    </View>
  );
}
