import { View } from 'react-native';

import { MS } from '@/constants/mindshed';
import { Heading } from './text';

export function HeaderPill({ title, size = 20 }: { title: string; size?: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: MS.color.white,
          borderRadius: MS.radius.lg,
          borderWidth: MS.border,
          borderColor: MS.color.ink,
          paddingVertical: 8,
          paddingHorizontal: 24,
        }}>
        <Heading size={size}>{title}</Heading>
      </View>
    </View>
  );
}
