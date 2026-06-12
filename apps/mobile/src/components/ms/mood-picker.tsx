import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, View } from 'react-native';

import { MOODS, MS } from '@/constants/mindshed';

interface MoodPickerProps {
  value?: number;
  onChange: (mood: number) => void;
  size?: number;
}

export function MoodPicker({ value, onChange, size = 24 }: MoodPickerProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {MOODS.map((m) => {
        const selected = value === m.value;
        return (
          <Pressable
            key={m.value}
            onPress={() => onChange(m.value)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              backgroundColor: m.color,
              borderRadius: MS.radius.md,
              borderWidth: selected ? 3 : MS.border,
              borderColor: MS.color.ink,
              transform: [{ scale: pressed || selected ? 1.04 : 1 }],
            })}>
            <MaterialCommunityIcons name={m.icon as never} size={size} color={MS.color.ink} />
          </Pressable>
        );
      })}
    </View>
  );
}
