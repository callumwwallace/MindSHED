import { View } from 'react-native';

import { MS } from '@/constants/mindshed';
import { Heading } from './text';

export function HeaderPill({ title, size = 20 }: { title: string; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 4, height: 22, borderRadius: 2, backgroundColor: MS.color.sage }} />
      <Heading size={size} color={MS.color.inkSoft}>{title}</Heading>
    </View>
  );
}
