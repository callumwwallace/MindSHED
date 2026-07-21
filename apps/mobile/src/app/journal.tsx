import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/ms/pill-button';
import { ShedInterior } from '@/components/ms/shed-interior';
import { SleepingBrambleNest } from '@/components/ms/sleeping-bramble-nest';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { feedback } from '@/lib/haptics';
import { goBackOrReplace } from '@/lib/navigation';
import { useWellness } from '@/store/wellness';

const PROMPTS = ['Today felt…', 'Something I carried…', 'One thing I need…', 'A small good thing…'];

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const journal = useWellness((state) => state.journal);
  const addJournalEntry = useWellness((state) => state.addJournalEntry);
  const updateJournalEntry = useWellness((state) => state.updateJournalEntry);
  const deleteJournalEntry = useWellness((state) => state.deleteJournalEntry);
  const [entry, setEntry] = useState('');
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [editingId, setEditingId] = useState<string>();
  const [writerOpen, setWriterOpen] = useState(false);
  const canSave = !!entry.trim();
  const sheetHeight = Math.min(650, Math.max(520, height * 0.72));
  const compact = height <= 620;
  const sceneWidth = Math.min(width, 520);
  const sceneScale = Math.max(sceneWidth / 390, height / 844);
  const sourceTop = (844 - height / sceneScale) / 2;
  const nestSize = compact ? 112 : 138;
  const nestTop = Math.max(insets.top + 76, (490 - sourceTop) * sceneScale - nestSize * 0.72);

  const save = () => {
    if (!canSave) return;
    if (editingId) updateJournalEntry(editingId, entry.trim()); else addJournalEntry(entry.trim());
    setEntry(''); setEditingId(undefined); setWriterOpen(false); feedback.success();
  };

  const remove = (id: string) => Alert.alert(
    'Delete this reflection?',
    'This cannot be undone.',
    [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJournalEntry(id) },
    ],
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#1F3034' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        <ShedInterior />
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(8,18,19,0.08)' }} />
        <Pressable onPress={() => goBackOrReplace('/(tabs)/places')} accessibilityRole="button" accessibilityLabel="Back to Places" style={{ position: 'absolute', left: 18, top: insets.top + 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,254,247,0.92)', alignItems: 'center', justifyContent: 'center' }}><Feather name="arrow-left" size={18} color={MS.color.forest} /></Pressable>
        <View style={{ position: 'absolute', right: 18, top: insets.top + 15, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(18,33,34,0.78)', borderRadius: 16, paddingVertical: 7, paddingHorizontal: 10 }}><Feather name="moon" size={12} color={MS.color.surface} /><BodyBold size={9.5} color={MS.color.surface}>BRAMBLE IS ASLEEP</BodyBold></View>
        {!writerOpen && <>
          <View style={{ position: 'absolute', right: 14, top: nestTop }}><SleepingBrambleNest size={nestSize} /></View>
          <Pressable
            onPress={() => setWriterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Write a reflection"
            style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 16, minHeight: 92, borderRadius: 24, backgroundColor: 'rgba(255,254,247,0.96)', paddingHorizontal: 18, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#071313', shadowOpacity: 0.22, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
          >
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: MS.color.mintSoft, alignItems: 'center', justifyContent: 'center', marginRight: 13 }}><Feather name="edit-3" size={18} color={MS.color.forest} /></View>
            <View style={{ flex: 1 }}><BodyBold size={9.5} color={MS.color.forestMuted} style={{ letterSpacing: 1.2 }}>INSIDE THE SHED</BodyBold><Heading size={20} color={MS.color.inkSoft} style={{ marginTop: 2 }}>Write a reflection</Heading><Body size={10.5} color={MS.color.muted} style={{ marginTop: 2 }}>{journal.length ? `${journal.length} saved on this device` : 'A private place to put the day down'}</Body></View>
            <Feather name="chevron-up" size={20} color={MS.color.forest} />
          </Pressable>
        </>}

        {writerOpen && <>
          <Pressable onPress={() => setWriterOpen(false)} accessibilityRole="button" accessibilityLabel="Close reflection writer" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(8,18,19,0.28)' }} />
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: sheetHeight, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: MS.color.cream }}>
            <Pressable onPress={() => setWriterOpen(false)} accessibilityRole="button" accessibilityLabel="Close reflection writer" style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 3 }}><View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: `${MS.color.ink}22` }} /></Pressable>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: insets.bottom + 32 }}>
          <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3 }}>INSIDE THE SHED</BodyBold>
          <Heading size={25} color={MS.color.inkSoft} style={{ marginTop: 4 }}>{editingId ? 'Change what you wrote' : 'Put it down here'}</Heading>
          <Body size={12} color={MS.color.muted} style={{ marginTop: 4 }}>Unfinished, brief or only one honest sentence is enough.</Body>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 16 }}>
            {PROMPTS.map((item) => <Pressable key={item} onPress={() => setPrompt(item)} accessibilityRole="radio" accessibilityState={{ selected: prompt === item }} style={{ borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: prompt === item ? MS.color.forest : MS.color.surface }}><BodyBold size={10.5} color={prompt === item ? MS.color.surface : MS.color.forest}>{item}</BodyBold></Pressable>)}
          </ScrollView>

          <View style={{ borderRadius: MS.radius.xl, backgroundColor: MS.color.surfaceWarm, padding: 16 }}>
            <TextInput value={entry} onChangeText={setEntry} placeholder={prompt} placeholderTextColor={MS.color.faint} multiline maxLength={8000} accessibilityLabel="Journal entry" style={{ minHeight: 164, fontFamily: MS.font.body, fontSize: 15, lineHeight: 23, color: MS.color.inkSoft, textAlignVertical: 'top' }} />
            <View style={{ height: 1, backgroundColor: `${MS.color.ink}10`, marginBottom: 13 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}><Body size={9.5} color={MS.color.faint} style={{ flex: 1 }}>Encrypted on this device · never uploaded</Body><Feather name="hard-drive" size={14} color={MS.color.forestMuted} /></View>
          </View>
          <PillButton label={editingId ? 'Update reflection' : canSave ? 'Save reflection' : 'Write something first'} onPress={save} disabled={!canSave} style={{ marginTop: 12 }} />
          {!!editingId && <Pressable onPress={() => { setEditingId(undefined); setEntry(''); }} accessibilityRole="button" accessibilityLabel="Cancel editing reflection" style={{ alignSelf: 'center', padding: 12 }}><BodyBold size={11} color={MS.color.forestMuted}>Cancel editing</BodyBold></Pressable>}

          {journal.length > 0 && <>
            <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3, marginTop: 28, marginBottom: 8 }}>EARLIER REFLECTIONS</BodyBold>
            <View style={{ borderRadius: MS.radius.xl, backgroundColor: MS.color.surface, paddingHorizontal: 15 }}>
              {journal.map((item, index) => <View key={item.id} style={{ paddingVertical: 15, borderBottomWidth: index < journal.length - 1 ? 1 : 0, borderBottomColor: `${MS.color.ink}0F` }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}><BodyBold size={9.5} color={MS.color.forestMuted} style={{ flex: 1, letterSpacing: 0.7 }}>{new Date(item.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</BodyBold><Pressable onPress={() => { setEditingId(item.id); setEntry(item.text); setWriterOpen(true); }} accessibilityRole="button" accessibilityLabel="Edit reflection" hitSlop={10} style={{ padding: 5 }}><Feather name="edit-2" size={14} color={MS.color.forestMuted} /></Pressable><Pressable onPress={() => remove(item.id)} accessibilityRole="button" accessibilityLabel="Delete reflection" hitSlop={10} style={{ padding: 5 }}><Feather name="trash-2" size={14} color={MS.color.danger} /></Pressable></View>
                <Body size={12.5} color={MS.color.inkSoft} style={{ marginTop: 5 }}>{item.text}</Body>
              </View>)}
            </View>
          </>}
            </ScrollView>
          </View>
        </>}
      </View>
    </KeyboardAvoidingView>
  );
}
