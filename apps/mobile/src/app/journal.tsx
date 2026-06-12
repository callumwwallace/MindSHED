import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bramble } from '@/components/ms/bramble';
import { Card } from '@/components/ms/card';
import { PillButton } from '@/components/ms/pill-button';
import { Body, BodyBold, Heading } from '@/components/ms/text';
import { MS } from '@/constants/mindshed';
import { useWellness } from '@/store/wellness';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const journal = useWellness((s) => s.journal);
  const addJournalEntry = useWellness((s) => s.addJournalEntry);
  const [text, setText] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: MS.color.cream }}>
      <View
        style={{
          backgroundColor: MS.color.woodLight,
          borderBottomWidth: MS.border,
          borderColor: MS.color.ink,
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            backgroundColor: MS.color.cream,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Feather name="arrow-left" size={15} color={MS.color.ink} />
        </Pressable>
        <Heading size={17} style={{ flex: 1 }}>
          Journal
        </Heading>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: MS.color.mint,
            borderWidth: 1.5,
            borderColor: MS.color.ink,
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}>
          <Feather name="lock" size={11} color={MS.color.ink} />
          <BodyBold size={10}>Only you</BodyBold>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind today?"
          placeholderTextColor={MS.color.faint}
          multiline
          style={{
            borderWidth: MS.border,
            borderColor: MS.color.ink,
            borderRadius: MS.radius.lg,
            backgroundColor: MS.color.white,
            padding: 14,
            minHeight: 120,
            fontFamily: MS.font.body,
            fontSize: 14,
            color: MS.color.ink,
            textAlignVertical: 'top',
          }}
        />
        <PillButton
          label={text.trim() ? 'Save entry' : 'Write something first'}
          color={text.trim() ? MS.color.mint : MS.color.white}
          onPress={() => {
            if (text.trim()) {
              addJournalEntry(text.trim());
              setText('');
            }
          }}
          style={{ marginTop: 12 }}
        />
        {journal.length > 0 && (
          <Heading size={15} style={{ marginTop: 22, marginBottom: 10 }}>
            Earlier entries
          </Heading>
        )}
        <View style={{ gap: 9 }}>
          {journal.map((e) => (
            <Card key={e.id} padding={12}>
              <BodyBold size={10} color={MS.color.faint} style={{ marginBottom: 4 }}>
                {new Date(e.date)
                  .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
                  .toUpperCase()}
              </BodyBold>
              <Body size={13}>{e.text}</Body>
            </Card>
          ))}
        </View>
        <View style={{ alignItems: 'center', marginTop: 24, opacity: 0.8 }}>
          <Bramble size={64} mood="sleepy" />
          <Body size={11} color={MS.color.muted} style={{ marginTop: 4 }}>
            Bramble&apos;s asleep in the corner — he never reads a word.
          </Body>
        </View>
      </ScrollView>
    </View>
  );
}
