import { View, type StyleProp, type ViewStyle } from 'react-native';

import { MS } from '@/constants/mindshed';
import { Body } from './text';

export function SpeechBubble({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: MS.color.white,
          borderWidth: MS.border,
          borderColor: MS.color.ink,
          borderRadius: 14,
          borderBottomLeftRadius: 2,
          paddingVertical: 9,
          paddingHorizontal: 12,
        },
        style,
      ]}>
      <Body size={13}>{text}</Body>
    </View>
  );
}
