import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { MS } from '@/constants/mindshed';
import { BodyBold } from './text';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  textColor?: string;
}

export function PillButton({
  label,
  onPress,
  color = MS.color.forest,
  size = 16,
  style,
  disabled = false,
  textColor,
}: PillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          backgroundColor: color,
          borderRadius: MS.radius.pill,
          borderWidth: 1,
          borderColor: color === MS.color.forest ? MS.color.forest : `${MS.color.forest}2E`,
          paddingVertical: 14,
          paddingHorizontal: 20,
          alignItems: 'center',
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: disabled ? 0.45 : 1,
          shadowColor: MS.color.shadow,
          shadowOpacity: color === MS.color.forest ? 0.14 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: color === MS.color.forest ? 2 : 0,
        },
        style,
      ]}>
      <BodyBold size={size} color={textColor ?? (color === MS.color.forest || color === MS.color.danger ? MS.color.surface : MS.color.forest)}>{label}</BodyBold>
    </Pressable>
  );
}
