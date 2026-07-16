import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, View } from 'react-native';

import { MOODS, MS } from '@/constants/mindshed';
import { BodyBold } from './text';

interface MoodPickerProps {
  value?: number;
  onChange: (mood: number) => void;
  size?: number;
  showLabels?: boolean;
}

const MOOD_LABELS = ['Rough', 'Low', 'Okay', 'Good', 'Great'] as const;

export function MoodPicker({ value, onChange, size = 22, showLabels = false }: MoodPickerProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {MOODS.map((m, index) => {
        const selected = value === m.value;
        return (
          <Pressable
            key={m.value}
            onPress={() => onChange(m.value)}
            accessibilityRole="radio"
            accessibilityLabel={`${MOOD_LABELS[index]}, ${m.value} out of 5`}
            accessibilityState={{ selected }}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              minHeight: showLabels ? 68 : 52,
              paddingVertical: 7,
              backgroundColor: 'transparent',
              borderRadius: MS.radius.md,
              transform: [{ scale: pressed ? 0.96 : selected ? 1.03 : 1 }],
            })}>
            <View
              style={{
                width: size + 16,
                height: size + 16,
                borderRadius: (size + 16) / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: m.color,
                borderWidth: selected ? 2.5 : 1,
                borderColor: selected ? MS.color.forest : `${MS.color.ink}55`,
                shadowColor: selected ? MS.color.shadow : 'transparent',
                shadowOpacity: selected ? 0.12 : 0,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 2 },
                elevation: selected ? 2 : 0,
              }}>
              <MaterialCommunityIcons name={m.icon as never} size={size} color={MS.color.ink} />
            </View>
            {showLabels && (
              <BodyBold size={10} color={selected ? MS.color.forest : MS.color.muted}>
                {MOOD_LABELS[index]}
              </BodyBold>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
