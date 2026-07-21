import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { MS } from '@/constants/mindshed';

export type WorldTabIconName = 'shed' | 'wellbeing' | 'gate' | 'profile';

export function WorldTabIcon({
  name,
  focused,
}: {
  name: WorldTabIconName;
  focused: boolean;
}) {
  const ink = focused ? MS.color.forest : '#78877A';
  const fill = focused ? '#D1DFC8' : 'none';

  return (
    <View
      style={{
        width: 40,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={27} height={23} viewBox="0 0 28 24">
        {name === 'shed' && <>
          <Path d="M4 20V10Q4 8 6 8H22Q24 8 24 10V20Z" fill={fill} stroke={ink} strokeWidth={1.8} />
          <Path d="M3 9C5 4 9 2 14 2C19 2 23 5 25 9C18 7 10 7 3 9Z" fill={fill} stroke={ink} strokeWidth={1.8} />
          <Rect x={15} y={12} width={5} height={8} rx={2} fill={ink} />
        </>}

        {name === 'wellbeing' && <>
          <Ellipse cx={14} cy={19} rx={10} ry={3} fill={fill} stroke={ink} strokeWidth={1.6} />
          <Path d="M14 17C14 12 14 8 15 5" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
          <Path d="M14 10C10 10 8 7 8 4C12 4 14 6 14 10Z" fill={fill} stroke={ink} strokeWidth={1.5} />
          <Path d="M15 12C19 12 21 9 21 6C17 6 15 8 15 12Z" fill={fill} stroke={ink} strokeWidth={1.5} />
        </>}

        {name === 'gate' && <>
          <Path d="M5 21V12C5 6 9 3 14 3S23 6 23 12V21" fill="none" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M9 21V13C12 10 16 10 19 13V21M9 15H19M9 18H19" fill="none" stroke={ink} strokeWidth={1.7} strokeLinecap="round" />
        </>}

        {name === 'profile' && <>
          <Circle cx={14} cy={8} r={4.2} fill={fill} stroke={ink} strokeWidth={1.7} />
          <Path d="M6 21C7 15.5 9.8 13 14 13C18.2 13 21 15.5 22 21Z" fill={fill} stroke={ink} strokeWidth={1.7} strokeLinejoin="round" />
          <Path d="M20.5 7C23.7 4.2 26 5.1 25.2 8.4C23.2 9.4 21.5 9 20.5 7Z" fill={MS.color.sage} stroke={ink} strokeWidth={1.1} strokeLinejoin="round" />
        </>}
      </Svg>
    </View>
  );
}
