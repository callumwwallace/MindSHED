import { View, type StyleProp, type ViewStyle } from 'react-native';

import { MS } from '@/constants/mindshed';
import { Body, BodyBold } from './text';

interface RiveBoxProps {
  url: string;
  stateMachineName?: string;
  artboardName?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

// rive-react-native is a native runtime. This platform fallback prevents its
// native component from entering the web bundle.
export function RiveBox({ height = 260, style }: RiveBoxProps) {
  return (
    <View
      style={[
        {
          height,
          width: '100%',
          borderRadius: MS.radius.xl,
          backgroundColor: MS.color.sageSoft,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        },
        style,
      ]}>
      <BodyBold size={14} color={MS.color.forest}>Rive preview is native-only</BodyBold>
      <Body size={11} color={MS.color.muted} style={{ marginTop: 5, textAlign: 'center' }}>
        Bramble&apos;s normal app interactions remain available on web.
      </Body>
    </View>
  );
}
