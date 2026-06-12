import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { MS } from '@/constants/mindshed';
import { Heading } from './text';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function PillButton({
  label,
  onPress,
  color = MS.color.mint,
  size = 16,
  style,
}: PillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: color,
          borderRadius: MS.radius.pill,
          borderWidth: MS.border,
          borderColor: MS.color.ink,
          paddingVertical: 12,
          paddingHorizontal: 20,
          alignItems: 'center',
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}>
      <Heading size={size}>{label}</Heading>
    </Pressable>
  );
}
