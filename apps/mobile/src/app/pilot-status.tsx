import Feather from '@expo/vector-icons/Feather';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { endPilotIdentityLocally, synchronizePendingPilotAction } from '@/lib/pilot-governance';
import { pilotErrorCode } from '@/lib/pilot-governance-policy';
import { getPendingPilotAction } from '@/lib/pilot-governance-storage';
import { getPilotIdentity } from '@/lib/pilot-identity';
import { apiClient, trpc } from '@/lib/trpc';
import { retryPilotEventsNow, usePilotQueue } from '@/store/pilot-queue';

type ConnectionState = 'loading' | 'not-enrolled' | 'connected' | 'ended' | 'offline';

export default function PilotStatusScreen() {
  const insets = useSafeAreaInsets();
  const config = trpc.pilot.config.useQuery(undefined, { retry: 1 });
  const pilotConnection = useQuery({
    queryKey: ['pilot-status'],
    retry: false,
    queryFn: async () => {
      const identity = await getPilotIdentity();
      if (!identity) return { connection: 'not-enrolled' as const, status: null };
      try {
        const status = await apiClient.pilot.status.mutate({
          participantId: identity.participantId,
          participantToken: identity.participantToken,
        });
        return { connection: 'connected' as const, status };
      } catch (error) {
        if (pilotErrorCode(error) === 'UNAUTHORIZED') {
          await endPilotIdentityLocally();
          return { connection: 'ended' as const, status: null };
        }
        return { connection: 'offline' as const, status: null };
      }
    },
  });
  const pendingGovernance = useQuery({
    queryKey: ['pending-pilot-governance'],
    queryFn: getPendingPilotAction,
  });
  const queuedEvents = usePilotQueue((state) => state.events.length);
  const failureCount = usePilotQueue((state) => state.failureCount);
  const nextAttemptAt = usePilotQueue((state) => state.nextAttemptAt);
  const blockedReason = usePilotQueue((state) => state.blockedReason);
  const droppedEvents = usePilotQueue((state) => state.droppedEvents);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const connection: ConnectionState = pilotConnection.data?.connection ?? 'loading';

  const retryNow = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const governance = await synchronizePendingPilotAction();
      if (governance.status === 'pending') {
        setSyncMessage('Your stop or deletion instruction is still waiting for a secure connection. No research events can upload first.');
      } else {
        await retryPilotEventsNow();
        setSyncMessage('Encrypted pilot queue is up to date.');
      }
      await pendingGovernance.refetch();
      await pilotConnection.refetch();
    } catch {
      setSyncMessage('Still offline. Your encrypted queue is safe and will retry later.');
    } finally {
      setSyncing(false);
    }
  };

  const pilotStatus = pilotConnection.data?.status;
  const consent = pilotStatus?.consent;
  const retryLabel = nextAttemptAt > 0
    ? new Date(nextAttemptAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'when the app is active';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 40 }}>
      <ScreenHeader eyebrow="Quietly connected" title="Pilot status" description="See what this device can send, what is waiting and how your pseudonymous access works." />

      <View style={{ marginTop: 24, borderRadius: MS.radius.xl, backgroundColor: connection === 'connected' ? MS.color.forest : MS.color.surface, padding: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: connection === 'connected' ? 'rgba(255,254,247,0.15)' : MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={connection === 'connected' ? 'shield' : connection === 'offline' ? 'wifi-off' : 'minus-circle'} size={19} color={connection === 'connected' ? MS.color.surface : MS.color.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <BodyBold size={10} color={connection === 'connected' ? 'rgba(255,254,247,0.68)' : MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>THIS DEVICE</BodyBold>
            <Heading size={17} color={connection === 'connected' ? MS.color.surface : MS.color.inkSoft} style={{ marginTop: 2 }}>
              {connection === 'loading' ? 'Checking securely…' : connection === 'connected' ? 'Pseudonymous pilot link active' : connection === 'ended' ? 'Previous pilot link ended' : connection === 'not-enrolled' ? 'Not enrolled' : 'Connection unavailable'}
            </Heading>
          </View>
        </View>
        <Body size={11} color={connection === 'connected' ? 'rgba(255,254,247,0.74)' : MS.color.muted} style={{ marginTop: 12 }}>
          {connection === 'connected'
            ? 'The server recognises a random participant number, not your name, email or student identity.'
            : connection === 'ended'
              ? 'The server no longer recognises this pseudonymous record. Its local credentials and research queue were removed; local wellbeing features still work.'
              : connection === 'not-enrolled'
              ? 'No pilot access key is stored on this device. Local wellbeing features still work.'
              : 'Local features keep working. No queued content is discarded while the server is unavailable.'}
        </Body>
      </View>

      <View style={{ marginTop: 12, borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, padding: 18 }}>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>RESEARCH UPLOAD</BodyBold>
        <Heading size={17} color={MS.color.inkSoft} style={{ marginTop: 5 }}>
          {pilotStatus?.researchWithdrawn ? 'Permanently withdrawn' : consent?.researchConsent && consent.healthDataConsent ? 'Consent active' : 'Uploads are off'}
        </Heading>
        <Body size={11} color={MS.color.muted} style={{ marginTop: 5 }}>
          {queuedEvents === 0 ? 'Nothing is waiting to upload.' : `${queuedEvents} structured ${queuedEvents === 1 ? 'event is' : 'events are'} held in the encrypted queue.`}
        </Body>
        {pendingGovernance.data && <View accessibilityRole="alert" style={{ marginTop: 10, borderRadius: 14, backgroundColor: MS.color.sageSoft, padding: 11 }}><Body size={10.5} color={MS.color.inkSoft}>A {pendingGovernance.data.kind === 'consent' ? 'research stop' : pendingGovernance.data.kind} instruction is pending. It always retries before research events, which remain blocked.</Body></View>}
        {!!blockedReason && <View accessibilityRole="alert" style={{ marginTop: 10, borderRadius: 14, backgroundColor: '#F8E8D7', padding: 11 }}><Body size={10.5} color={MS.color.inkSoft}>{blockedReason}</Body></View>}
        {droppedEvents > 0 && <Body accessibilityRole="alert" size={10} color={MS.color.danger} style={{ marginTop: 7 }}>{droppedEvents} older {droppedEvents === 1 ? 'event was' : 'events were'} not retained after the encrypted offline queue reached its safety limit.</Body>}
        {failureCount > 0 && !blockedReason && <Body size={10} color={MS.color.faint} style={{ marginTop: 5 }}>Automatic retry {retryLabel}. Attempt {failureCount}.</Body>}
        {queuedEvents > 0 && <PillButton label={syncing ? 'Trying securely…' : 'Try upload now'} onPress={retryNow} disabled={syncing} style={{ marginTop: 15 }} />}
        {!!syncMessage && <Body size={10.5} color={MS.color.forestMuted} style={{ marginTop: 10 }}>{syncMessage}</Body>}
      </View>

      <View style={{ marginTop: 12, borderRadius: MS.radius.xl, backgroundColor: MS.color.sageSoft, padding: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><Feather name="key" size={17} color={MS.color.forest} /><Heading size={16} color={MS.color.inkSoft}>Your recovery boundary</Heading></View>
        <Body size={11} color={MS.color.muted} style={{ marginTop: 7 }}>The pseudonymous access and deletion keys exist only on this device. MindSHED cannot recover or locate the pilot record by your name if this device is lost, erased or unavailable.</Body>
      </View>

      <View style={{ marginTop: 12, borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, padding: 18 }}>
        <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>SERVICE CONTROLS</BodyBold>
        {config.isError ? (
          <Body size={11} color={MS.color.muted} style={{ marginTop: 7 }}>Service status is unavailable while offline. This does not change your saved consent or local data.</Body>
        ) : (
          <>
            <Body size={11} color={MS.color.muted} style={{ marginTop: 7 }}>Enrolment: {config.data?.enrolmentOpen ? 'open' : 'paused'} · Research uploads: {config.data?.researchUploadsEnabled ? 'available' : 'paused'}</Body>
            <Body size={10} color={MS.color.muted} style={{ marginTop: 3 }}>SWEMWBS uploads: {config.data?.swemwbsUploadsEnabled ? 'approved and available' : 'held behind approval gate'}</Body>
            <Body size={9.5} color={MS.color.faint} style={{ marginTop: 5 }}>Schema {config.data?.schemaVersion ?? 'checking…'} · Minimum app {config.data?.minimumAppVersion ?? 'checking…'}</Body>
          </>
        )}
      </View>

      {(connection === 'not-enrolled' || connection === 'ended') && <PillButton label="Enter a pilot code" onPress={() => router.push('/onboarding')} style={{ marginTop: 18 }} />}
      <Pressable onPress={() => { setSyncMessage(''); void config.refetch(); void pilotConnection.refetch(); void pendingGovernance.refetch(); }} accessibilityRole="button" style={{ alignItems: 'center', padding: 16 }}><BodyBold size={11} color={MS.color.forest}>Refresh status</BodyBold></Pressable>
    </ScrollView>
  );
}
