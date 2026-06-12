import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { MS } from '@/constants/mindshed';

type BrambleMood = 'happy' | 'calm' | 'sleepy';

// The hedgehog, sticker-style. Placeholder art — replaced by the Rive rig.
export function Bramble({ size = 120, mood = 'happy' }: { size?: number; mood?: BrambleMood }) {
  const ink = MS.color.ink;
  return (
    <Svg width={size} height={size * 0.78} viewBox="0 0 110 86">
      <Ellipse cx="55" cy="81" rx="38" ry="5" fill="#8FD98A" />
      <Path
        d="M55 20 C27 20 18 43 22 58 C26 72 41 76 55 76 C69 76 84 72 88 58 C92 43 83 20 55 20 Z"
        fill={MS.color.wood}
        stroke={ink}
        strokeWidth="2.5"
      />
      <Path
        d="M55 16 C31 16 20 41 24 56 L28 52 L32 58 L38 50 L44 58 L50 50 L56 58 L62 50 L68 58 L74 50 L80 58 L86 52 L90 56 C94 41 79 16 55 16 Z"
        fill="#5C4634"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <Ellipse cx="55" cy="62" rx="20" ry="13" fill={MS.color.paper} stroke={ink} strokeWidth="2.5" />
      <Ellipse cx="42" cy="65" rx="4" ry="2.5" fill={MS.color.orange} />
      <Ellipse cx="68" cy="65" rx="4" ry="2.5" fill={MS.color.orange} />
      {mood === 'happy' && (
        <>
          <Circle cx="47" cy="58" r="2.6" fill={ink} />
          <Circle cx="63" cy="58" r="2.6" fill={ink} />
          <Circle cx="48" cy="57" r="0.9" fill="#FFFFFF" />
          <Circle cx="64" cy="57" r="0.9" fill="#FFFFFF" />
        </>
      )}
      {mood === 'calm' && (
        <>
          <Path d="M44 57 q3 -3 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <Path d="M60 57 q3 -3 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <Path d="M44 58 q3 2 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <Path d="M60 58 q3 2 6 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      )}
      <Ellipse cx="55" cy="67" rx="3.6" ry="2.8" fill={ink} />
      <Path d="M46 71 Q55 77 64 71" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}
