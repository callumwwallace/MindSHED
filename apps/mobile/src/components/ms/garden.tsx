import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { MS } from '@/constants/mindshed';

// Static placeholder garden — replaced by the Rive scene later.
// `flowers` is long-term progress made visible: one bloom per check-in day.
const FLOWER_SPOTS = [
  { x: 52, y: 226 },
  { x: 78, y: 234 },
  { x: 252, y: 230 },
  { x: 282, y: 238 },
  { x: 110, y: 240 },
  { x: 226, y: 242 },
  { x: 36, y: 244 },
  { x: 300, y: 226 },
];
const FLOWER_COLORS = [MS.color.red, MS.color.yellow, MS.color.orange, MS.color.red];

export function Garden({ flowers }: { flowers: number }) {
  const ink = MS.color.ink;
  const shown = FLOWER_SPOTS.slice(0, Math.min(flowers, FLOWER_SPOTS.length));

  return (
    <Svg width="100%" height="100%" viewBox="0 0 340 290" preserveAspectRatio="xMidYMax slice">
      <Rect x="0" y="0" width="340" height="290" fill={MS.color.sky} />
      <Circle cx="288" cy="46" r="20" fill={MS.color.yellow} stroke={ink} strokeWidth="2.5" />
      <Ellipse cx="66" cy="48" rx="26" ry="11" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
      <Ellipse cx="90" cy="40" rx="18" ry="8" fill="#FFFFFF" stroke={ink} strokeWidth="2" />
      <Path
        d="M-5 150 L42 92 L80 136 L122 84 L168 142 L212 100 L256 146 L298 108 L345 142 L345 190 L-5 190 Z"
        fill={MS.color.mountain}
      />
      <Path
        d="M-5 168 Q85 140 170 158 Q255 174 345 152 L345 295 L-5 295 Z"
        fill={MS.color.hill}
        stroke={ink}
        strokeWidth="2.5"
      />
      <G>
        <Rect x="84" y="84" width="92" height="98" fill={MS.color.orange} stroke={ink} strokeWidth="2.5" />
        <Line x1="86" y1="102" x2="174" y2="102" stroke="#E8985C" strokeWidth="1.8" />
        <Line x1="86" y1="120" x2="174" y2="120" stroke="#E8985C" strokeWidth="1.8" />
        <Line x1="86" y1="138" x2="174" y2="138" stroke="#E8985C" strokeWidth="1.8" />
        <Line x1="86" y1="156" x2="174" y2="156" stroke="#E8985C" strokeWidth="1.8" />
        <Path d="M70 88 L130 42 L190 88 Z" fill={MS.color.red} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <Rect x="116" y="126" width="30" height="56" rx="3" fill={MS.color.wood} stroke={ink} strokeWidth="2.5" />
        <Circle cx="140" cy="156" r="2.4" fill={ink} />
        <Circle cx="101" cy="110" r="11" fill="#FFFFFF" stroke={ink} strokeWidth="2.5" />
        <Line x1="101" y1="99" x2="101" y2="121" stroke={ink} strokeWidth="2" />
        <Line x1="90" y1="110" x2="112" y2="110" stroke={ink} strokeWidth="2" />
      </G>
      <G stroke={ink} strokeWidth="2">
        <Circle cx="206" cy="172" r="8" fill={MS.color.woodLight} />
        <Circle cx="222" cy="172" r="8" fill={MS.color.woodLight} />
        <Circle cx="214" cy="160" r="8" fill={MS.color.woodLight} />
      </G>
      <Path
        d="M-5 218 Q80 202 170 212 Q260 222 345 208 L345 295 L-5 295 Z"
        fill={MS.color.grass}
        stroke={ink}
        strokeWidth="2.5"
      />
      <Ellipse cx="278" cy="252" rx="32" ry="13" fill={MS.color.skyDeep} stroke={ink} strokeWidth="2.5" />
      <Circle cx="268" cy="248" r="5" fill="#9FE39A" stroke={ink} strokeWidth="1.6" />
      {shown.map((spot, i) => (
        <G key={`f${spot.x}`}>
          <Line x1={spot.x} y1={spot.y} x2={spot.x} y2={spot.y - 18} stroke={ink} strokeWidth="2" strokeLinecap="round" />
          <Circle
            cx={spot.x}
            cy={spot.y - 23}
            r="6"
            fill={FLOWER_COLORS[i % FLOWER_COLORS.length]}
            stroke={ink}
            strokeWidth="2"
          />
          <Circle cx={spot.x} cy={spot.y - 23} r="2" fill={MS.color.cream} />
        </G>
      ))}
      {flowers === 0 && (
        <Path d="M60 230 q4 -10 8 0 M64 230 v-11" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
    </Svg>
  );
}
