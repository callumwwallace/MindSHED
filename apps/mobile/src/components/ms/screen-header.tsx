import Feather from '@expo/vector-icons/Feather';
import type { Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { MS } from '@/constants/mindshed';
import { goBackOrReplace } from '@/lib/navigation';
import { Body, BodyBold, Heading } from './text';

export function ScreenHeader({
  eyebrow,
  title,
  description,
  close = false,
  fallback = '/',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  close?: boolean;
  fallback?: Href;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => goBackOrReplace(fallback)}
          accessibilityRole="button"
          accessibilityLabel={close ? 'Close' : 'Go back'}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: MS.color.surface,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.65 : 1,
          })}>
          <Feather name={close ? 'x' : 'arrow-left'} size={18} color={MS.color.forest} />
        </Pressable>
        {!!eyebrow && (
          <BodyBold size={10} color={MS.color.forestMuted} style={{ marginLeft: 12, letterSpacing: 1.35 }}>
            {eyebrow.toUpperCase()}
          </BodyBold>
        )}
      </View>
      <Heading size={25} color={MS.color.inkSoft} style={{ marginTop: 20 }}>{title}</Heading>
      {!!description && <Body size={12.5} color={MS.color.muted} style={{ marginTop: 5 }}>{description}</Body>}
    </View>
  );
}
