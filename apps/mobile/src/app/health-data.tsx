import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import type { HealthAccessResult } from '@/lib/health-context';
import { checkHealthAvailability, openHealthSettings, readHealthDailySummaries, requestHealthAccess } from '@/lib/health-service';
import { useWellness } from '@/store/wellness';

type ScreenState = 'checking' | 'idle' | 'connecting' | 'syncing' | 'ready' | 'error';

export default function HealthDataScreen() {
  const insets = useSafeAreaInsets();
  const connected = useWellness((state) => state.healthConnected);
  const summaries = useWellness((state) => state.healthDailySummaries);
  const lastSyncedAt = useWellness((state) => state.healthLastSyncedAt);
  const setConnected = useWellness((state) => state.setHealthConnected);
  const saveSummaries = useWellness((state) => state.saveHealthDailySummaries);
  const disconnect = useWellness((state) => state.disconnectHealth);
  const [availability, setAvailability] = useState<HealthAccessResult>({ available: false, source: 'none' });
  const [screenState, setScreenState] = useState<ScreenState>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void checkHealthAvailability().then((result) => {
      if (!active) return;
      setAvailability(result);
      setScreenState(connected ? 'ready' : 'idle');
    });
    return () => { active = false; };
  }, [connected]);

  const sourceName = availability.source === 'apple-health' ? 'Apple Health' : availability.source === 'health-connect' ? 'Health Connect' : 'Phone health';
  const sleepDays = summaries.filter((day) => day.sleepMinutes !== undefined).length;
  const stepDays = summaries.filter((day) => day.steps !== undefined).length;

  const sync = async () => {
    setScreenState('syncing');
    setError('');
    try {
      const next = await readHealthDailySummaries(21);
      saveSummaries(next);
      setScreenState('ready');
    } catch {
      setError(`MindSHED could not read the selected ${sourceName} data. You can review access in your phone settings.`);
      setScreenState('error');
    }
  };

  const connect = async () => {
    setScreenState('connecting');
    setError('');
    try {
      const granted = await requestHealthAccess();
      if (!granted) {
        setError(`No ${sourceName} access was added. MindSHED still works fully with your own check-ins.`);
        setScreenState('error');
        return;
      }
      setConnected(true);
      await sync();
    } catch {
      setError(`The ${sourceName} permission screen could not be opened. A new development build may be required after adding the native integration.`);
      setScreenState('error');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 42 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="Optional context" title="Phone health" description="Let sleep and movement add context to the feelings you choose to record." />

      <View style={{ marginTop: 24, borderRadius: 28, backgroundColor: connected ? MS.color.forest : '#E7E9D5', padding: 18 }}>
        <View style={{ width: 54, height: 54, borderRadius: 19, backgroundColor: connected ? 'rgba(255,254,247,0.14)' : MS.color.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={connected ? 'check' : 'heart'} size={22} color={connected ? MS.color.surface : MS.color.forest} />
        </View>
        <BodyBold size={9.5} color={connected ? 'rgba(255,254,247,0.7)' : MS.color.forestMuted} style={{ marginTop: 16, letterSpacing: 1.2 }}>{connected ? 'CONNECTED FOR LOCAL CONTEXT' : 'YOUR CHOICE'}</BodyBold>
        <Heading size={21} color={connected ? MS.color.surface : MS.color.inkSoft} style={{ marginTop: 4 }}>{connected ? `${sourceName} is adding context` : `Connect ${sourceName}`}</Heading>
        <Body size={11.5} color={connected ? 'rgba(255,254,247,0.76)' : MS.color.muted} style={{ marginTop: 6, lineHeight: 18 }}>
          MindSHED reads only daily step totals and sleep duration from the most recent 21 days. It never writes to your health app.
        </Body>
        {!connected && <PillButton label={screenState === 'connecting' ? 'Opening permission…' : `Choose ${sourceName} access`} onPress={connect} disabled={!availability.available || screenState === 'connecting'} style={{ marginTop: 18 }} />}
      </View>

      {!availability.available && screenState !== 'checking' && <View style={{ marginTop: 12, borderRadius: 18, backgroundColor: '#F8E8D7', padding: 14, flexDirection: 'row', gap: 10 }}><Feather name="info" size={16} color={MS.color.inkSoft} /><Body size={10.5} color={MS.color.inkSoft} style={{ flex: 1 }}>{availability.reason}</Body></View>}
      {!!error && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 18, backgroundColor: '#F8DFD7', padding: 14, flexDirection: 'row', gap: 10 }}><Feather name="alert-circle" size={16} color={MS.color.danger} /><Body size={10.5} color={MS.color.inkSoft} style={{ flex: 1 }}>{error}</Body></View>}

      {connected && <View style={{ marginTop: 12, borderRadius: 24, backgroundColor: MS.color.surface, padding: 17 }}>
        <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>AVAILABLE TO YOUR INSIGHTS</BodyBold>
        <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
          <View style={{ flex: 1, borderRadius: 18, backgroundColor: MS.color.sageSoft, padding: 14 }}><Feather name="moon" size={17} color={MS.color.forest} /><Heading size={19} color={MS.color.inkSoft} style={{ marginTop: 10 }}>{sleepDays}</Heading><Body size={10} color={MS.color.muted}>sleep days</Body></View>
          <View style={{ flex: 1, borderRadius: 18, backgroundColor: '#F2E7C7', padding: 14 }}><Feather name="navigation" size={17} color={MS.color.inkSoft} /><Heading size={19} color={MS.color.inkSoft} style={{ marginTop: 10 }}>{stepDays}</Heading><Body size={10} color={MS.color.muted}>movement days</Body></View>
        </View>
        <PillButton label={screenState === 'syncing' ? 'Refreshing…' : 'Refresh recent days'} onPress={sync} disabled={screenState === 'syncing'} style={{ marginTop: 15 }} />
        {!!lastSyncedAt && <Body size={9.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 9 }}>Last refreshed {new Date(lastSyncedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Body>}
      </View>}

      <View style={{ marginTop: 12, borderRadius: 24, backgroundColor: '#E7E9D5', padding: 17 }}>
        <BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>WHAT THIS DOES — AND DOES NOT DO</BodyBold>
        {[
          ['smartphone', 'Processed on this phone', 'MindSHED stores only one daily step total and sleep duration, encrypted with your other private app data.'],
          ['slash', 'Never part of the pilot upload', 'Raw health records and these local summaries are excluded from the research event schema.'],
          ['compass', 'Context, not a verdict', 'Sleep and movement can help describe repeated differences. They never create a hidden score, diagnosis or prediction.'],
        ].map(([icon, title, detail]) => <View key={title} style={{ flexDirection: 'row', gap: 11, marginTop: 15 }}><View style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: MS.color.surface, alignItems: 'center', justifyContent: 'center' }}><Feather name={icon as never} size={15} color={MS.color.forest} /></View><View style={{ flex: 1 }}><BodyBold size={11.5} color={MS.color.inkSoft}>{title}</BodyBold><Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>{detail}</Body></View></View>)}
      </View>

      {connected && <>
        <Pressable onPress={() => void openHealthSettings()} accessibilityRole="button" style={({ pressed }) => ({ marginTop: 16, minHeight: 52, borderRadius: 18, backgroundColor: MS.color.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, opacity: pressed ? 0.65 : 1 })}><Feather name="settings" size={16} color={MS.color.forest} /><BodyBold size={11.5} color={MS.color.forest} style={{ flex: 1, marginLeft: 10 }}>Manage access in {Platform.OS === 'ios' ? 'iPhone Settings' : 'Health Connect'}</BodyBold><Feather name="external-link" size={15} color={MS.color.forestMuted} /></Pressable>
        <Pressable onPress={disconnect} accessibilityRole="button" style={({ pressed }) => ({ marginTop: 8, minHeight: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}><BodyBold size={11} color={MS.color.danger}>Stop using phone health and remove summaries</BodyBold></Pressable>
      </>}
      <Body size={10} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 12 }}>You can use every core MindSHED activity without connecting phone health.</Body>
    </ScrollView>
  );
}

