import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBramble } from '@/components/ms/animated-bramble';
import { Garden } from '@/components/ms/garden';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { GARDEN_MILESTONES, GARDEN_REST_STATES, getGardenProgress, getGardenRestState } from '@/lib/garden-progress';
import { useWellness } from '@/store/wellness';

export default function GardenProgressScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ previewGrowth?: string; previewRest?: string }>();
  const growth = useWellness((state) => state.gardenGrowth);
  const checkins = useWellness((state) => state.checkins);
  const requestedGrowth = Number(params.previewGrowth);
  const displayGrowth = __DEV__ && Number.isFinite(requestedGrowth) ? Math.max(0, Math.floor(requestedGrowth)) : growth;
  const gardenRest = getGardenRestState(checkins.map((item) => item.date));
  const requestedRest = params.previewRest;
  const displayRest = __DEV__ && ['waiting', 'bright', 'quiet', 'resting'].includes(requestedRest ?? '')
    ? requestedRest as typeof gardenRest.id
    : gardenRest.id;
  const displayRestCopy = displayRest === gardenRest.id ? gardenRest : GARDEN_REST_STATES[displayRest];
  const progress = getGardenProgress(displayGrowth);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MS.color.cream }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="Bramble’s garden journal" title="How the garden grows" description="Each completed check-in adds to one shared habitat. Every larger change has a name and a place." />

      <View style={{ height: 228, borderRadius: 28, overflow: 'hidden', marginTop: 22, borderWidth: 1, borderColor: `${MS.color.forest}18` }}>
        <Garden growth={displayGrowth} mode="home" restState={displayRest} />
        <View pointerEvents="none" style={{ position: 'absolute', right: 12, bottom: 2 }}><AnimatedBramble size={90} mood="calm" state="notice" /></View>
      </View>

      <View style={{ marginTop: 12, borderRadius: MS.radius.xl, backgroundColor: '#EEF0DE', padding: 15, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name={displayRest === 'resting' ? 'moon' : displayRest === 'quiet' ? 'cloud' : 'sun'} size={17} color={MS.color.forest} /></View>
        <View style={{ flex: 1 }}><BodyBold size={11.5} color={MS.color.inkSoft}>{displayRestCopy.title}</BodyBold><Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>{displayRestCopy.description}</Body></View>
      </View>

      <View style={{ marginTop: 12, borderRadius: MS.radius.xl, backgroundColor: MS.color.sageSoft, padding: 17 }}>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>YOUR GARDEN NOW</BodyBold>
        <Heading size={18} color={MS.color.inkSoft} style={{ marginTop: 5 }}>{progress.current?.title ?? 'The garden is waiting for its first shoots'}</Heading>
        <Body size={11} color={MS.color.muted} style={{ marginTop: 5 }}>{progress.current?.description ?? 'Your first completed check-in will wake the wild patch beside the bench.'}</Body>
        {progress.next ? <>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(49,91,69,0.12)', marginTop: 15, overflow: 'hidden' }}><View style={{ width: `${progress.progressToNext * 100}%`, height: '100%', backgroundColor: MS.color.forest, borderRadius: 3 }} /></View>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ marginTop: 8 }}>{progress.remaining} more {progress.remaining === 1 ? 'check-in' : 'check-ins'} until {progress.next.shortTitle.toLowerCase()}</BodyBold>
        </> : <BodyBold size={10} color={MS.color.forestMuted} style={{ marginTop: 12 }}>THE MAIN HABITAT IS COMPLETE</BodyBold>}
      </View>

      <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.25, marginTop: 26, marginBottom: 9 }}>HABITAT MILESTONES</BodyBold>
      <View style={{ borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, paddingHorizontal: 15 }}>
        {GARDEN_MILESTONES.map((milestone, index) => {
          const unlocked = displayGrowth >= milestone.at;
          return <View key={milestone.id} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: index < GARDEN_MILESTONES.length - 1 ? 1 : 0, borderBottomColor: `${MS.color.ink}0E`, opacity: unlocked ? 1 : 0.58 }}>
            <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: unlocked ? MS.color.sageSoft : '#ECEBE2', alignItems: 'center', justifyContent: 'center' }}><Feather name={(unlocked ? milestone.icon : 'lock') as never} size={17} color={unlocked ? MS.color.forest : MS.color.faint} /></View>
            <View style={{ flex: 1 }}><BodyBold size={12.5} color={MS.color.inkSoft}>{milestone.title}</BodyBold><Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>{unlocked ? milestone.description : `Appears after ${milestone.at} completed ${milestone.at === 1 ? 'check-in' : 'check-ins'}.`}</Body></View>
            {unlocked && <Feather name="check-circle" size={17} color={MS.color.forest} style={{ marginTop: 4 }} />}
          </View>;
        })}
      </View>

      <Body size={10.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 17, paddingHorizontal: 20 }}>There are no streaks. A quiet or resting season changes the atmosphere only; no chapter is ever removed.</Body>
    </ScrollView>
  );
}
