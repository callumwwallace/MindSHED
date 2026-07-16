import { type ReactNode } from 'react';
import { View } from 'react-native';

import { MS } from '@/constants/mindshed';
import { BodyBold } from './text';

export function SettingsSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <BodyBold size={10} color={MS.color.forestMuted} style={{ letterSpacing: 1.3, marginBottom: 8 }}>
        {label.toUpperCase()}
      </BodyBold>
      <View style={{ backgroundColor: MS.color.surface, borderRadius: MS.radius.xl, paddingHorizontal: 14 }}>
        {children}
      </View>
    </View>
  );
}

