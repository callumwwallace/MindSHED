import Feather from '@expo/vector-icons/Feather';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ScreenHeader } from '@/components/ms/screen-header';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { getPilotIdentity } from '@/lib/pilot-identity';
import { apiClient } from '@/lib/trpc';
import { useWellness } from '@/store/wellness';

export default function ExportDataScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [pilotIncluded, setPilotIncluded] = useState(false);
  const checkins = useWellness((state) => state.checkins.length);
  const journal = useWellness((state) => state.journal.length);
  const pulses = useWellness((state) => state.wellbeingPulses.length);
  const healthDays = useWellness((state) => state.healthDailySummaries.length);
  const prepared = status === 'ready';

  const prepareExport = async () => {
    setStatus('preparing');
    setError('');
    setWarning('');
    setPilotIncluded(false);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('File sharing is not available on this device.');
      }

      const state = useWellness.getState();
      const exportedAt = new Date().toISOString();
      const identity = await getPilotIdentity();
      let pilotServerData: unknown = null;
      if (identity) {
        try {
          pilotServerData = await apiClient.pilot.exportData.mutate({
            participantId: identity.participantId,
            participantToken: identity.participantToken,
          });
          setPilotIncluded(true);
        } catch {
          setWarning('The pilot server could not be reached, so this copy contains local data only. Try again online for a combined export.');
        }
      }
      const payload = {
        format: 'MindSHED participant export',
        schemaVersion: 3,
        exportedAt,
        data: {
          checkins: state.checkins,
          wellbeingPulses: state.wellbeingPulses,
          unfinishedWellbeingPulse: state.pulseDraft ?? null,
          phoneHealthDailySummaries: state.healthDailySummaries,
          journal: state.journal,
          todayPlan: { date: state.tasksDate, tasks: state.tasks },
          gardenGrowth: state.gardenGrowth,
          profile: { name: state.profileName },
          preferences: {
            dailyNudge: { enabled: state.nudgeEnabled, time: state.nudgeTime },
            reduceMotion: state.reduceMotion,
            haptics: state.hapticsEnabled,
            phoneHealthConnected: state.healthConnected,
          },
          carePlan: state.carePlan,
          consent: {
            appUseAcceptedAt: state.appConsentAcceptedAt ?? null,
            researchParticipation: state.researchConsent,
            healthDataProcessing: state.healthDataConsent,
            marketing: state.marketingConsent,
            researchPreferenceUpdatedAt: state.researchConsentUpdatedAt ?? null,
          },
          pilotServerData,
        },
      };
      const day = exportedAt.slice(0, 10);
      const file = new File(Paths.cache, `mindshed-export-${day}.json`);
      file.create({ overwrite: true });
      file.write(JSON.stringify(payload, null, 2));
      await Sharing.shareAsync(file.uri, {
        dialogTitle: 'Save or share your MindSHED data',
        mimeType: 'application/json',
        UTI: 'public.json',
      });
      file.delete();
      setStatus('ready');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The export could not be prepared. Please try again.');
      setStatus('error');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: MS.color.cream }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 38 }}>
      <ScreenHeader eyebrow="A copy for you" title="Export your data" description="Create a portable JSON file with local content and, when available, your pseudonymous pilot record." />
      <View style={{ marginTop: 25, borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, padding: 18 }}>
        <View style={{ width: 54, height: 54, borderRadius: 19, backgroundColor: MS.color.sageSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name={prepared ? 'check' : 'archive'} size={22} color={MS.color.forest} /></View>
        <Heading size={18} color={MS.color.inkSoft} style={{ marginTop: 16 }}>{prepared ? 'Your export was prepared' : 'Included in your export'}</Heading>
        <View style={{ marginTop: 13, gap: 9 }}>
          <Body size={12} color={MS.color.muted}>• {checkins} check-ins with mood, energy and stress</Body>
          <Body size={12} color={MS.color.muted}>• {pulses} completed SWEMWBS wellbeing {pulses === 1 ? 'check' : 'checks'}</Body>
          <Body size={12} color={MS.color.muted}>• {healthDays} optional phone-health daily {healthDays === 1 ? 'summary' : 'summaries'}</Body>
          <Body size={12} color={MS.color.muted}>• {journal} private reflections</Body>
          <Body size={12} color={MS.color.muted}>• Current daily plan and garden progress</Body>
          <Body size={12} color={MS.color.muted}>• Profile and preference settings</Body>
          <Body size={12} color={MS.color.muted}>• {pilotIncluded ? 'Pseudonymous pilot consent and structured events' : 'Pilot record when enrolled and online'}</Body>
        </View>
        {prepared && <BodyBold size={10.5} color={MS.color.forest} style={{ marginTop: 16 }}>DEVICE SAVE/SHARE OPTIONS OPENED</BodyBold>}
      </View>
      <View style={{ marginTop: 12, borderRadius: 18, backgroundColor: '#F8E8D7', padding: 14, flexDirection: 'row', gap: 10 }}><Feather name="lock" size={16} color={MS.color.inkSoft} /><Body size={10.5} color={MS.color.inkSoft} style={{ flex: 1 }}>This JSON export is readable, not encrypted. It can include private reflections and support-plan notes. Save it only somewhere you trust.</Body></View>
      {!!warning && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: MS.color.sageSoft, padding: 13, flexDirection: 'row', gap: 9 }}><Feather name="wifi-off" size={16} color={MS.color.forest} /><Body size={10.5} color={MS.color.inkSoft} style={{ flex: 1 }}>{warning}</Body></View>}
      {!!error && <View accessibilityRole="alert" style={{ marginTop: 12, borderRadius: 16, backgroundColor: '#F8DFD7', padding: 13, flexDirection: 'row', gap: 9 }}><Feather name="alert-circle" size={16} color={MS.color.danger} /><Body size={10.5} color={MS.color.danger} style={{ flex: 1 }}>{error}</Body></View>}
      <PillButton label={status === 'preparing' ? 'Preparing…' : prepared ? 'Prepare another export' : 'Prepare and choose where to save'} onPress={prepareExport} disabled={status === 'preparing'} style={{ marginTop: 18 }} />
      <Body size={10.5} color={MS.color.faint} style={{ textAlign: 'center', marginTop: 14 }}>The temporary app-cache copy is removed after the save/share sheet closes. Fetching the pilot copy does not upload local wellbeing content.</Body>
    </ScrollView>
  );
}
