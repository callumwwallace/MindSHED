import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { GroundShadow } from './ground-shadow';

export type BrambleMood = 'happy' | 'calm' | 'sleepy';
export type BramblePose =
  | 'standing'
  | 'curled'
  | 'walk'
  | 'listen'
  | 'notice'
  | 'plant'
  | 'celebrate'
  | 'greet'
  | 'breathe';

const INK = '#443A36';
const QUILL_INK = '#4D3B38';
const FUR = '#D88E62';
const FUR_FAR = '#BD6F55';
const FUR_LIGHT = '#F3C89D';

function HedgehogFace({ mood, pose }: { mood: BrambleMood; pose: BramblePose }) {
  const closed = mood === 'sleepy' || pose === 'breathe';
  const alert = pose === 'notice' || pose === 'listen';
  const cheerful = pose === 'greet' || pose === 'celebrate' || mood === 'happy';

  return (
    <G>
      {closed ? (
        <Path d="M177 90 q6 5 12 0" fill="none" stroke={INK} strokeLinecap="round" strokeWidth="2.4" />
      ) : (
        <G>
          <Ellipse cx="182" cy="89" rx={alert ? 4.4 : 4} ry={alert ? 5.2 : 4.7} fill={INK} />
          <Circle cx={pose === 'notice' ? 183.6 : 182.5} cy="87.6" r="1.15" fill="#FFF9EC" />
        </G>
      )}
      {pose === 'listen' && <Path d="M170 79 q8 -4 15 -1" fill="none" stroke="#805044" strokeLinecap="round" strokeWidth="1.7" />}
      <Path
        d={cheerful ? 'M204 114 q6 5 12 -1' : 'M205 115 q5 3 10 -1'}
        fill="none"
        stroke="#7D4840"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </G>
  );
}

function QuillCoat({ compact }: { compact: boolean }) {
  return (
    <G>
      <Path
        d="M48 128 L31 123 L39 110 L25 101 L37 88 L26 77 L43 68 L38 53 L57 50 L62 35 L78 43 L91 28 L104 41 L121 26 L130 43 L148 34 L154 52 L172 52 L169 71 C176 77 180 85 178 94 L168 91 L172 104 L161 102 L164 116 L153 114 L155 129 C149 136 141 140 132 142 C94 145 64 140 48 128 Z"
        fill="url(#brambleQuills)"
        stroke={INK}
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <G fill="none" stroke="#B96A4A" strokeLinecap="round" opacity="0.66" strokeWidth={compact ? 3 : 3.4}>
        <Path d="M41 107 l22 -11 M39 82 l24 -6 M55 59 l21 6 M76 44 l12 20 M100 39 l3 24 M125 40 l-8 24 M150 54 l-16 17 M58 129 l21 -14 M84 141 l11 -21 M115 142 l-2 -23 M146 134 l-12 -18" />
      </G>
      {!compact && (
        <G fill="none" stroke={QUILL_INK} strokeLinecap="round" opacity="0.5" strokeWidth="1.8">
          <Path d="M36 96 l21 -8 M47 69 l20 1 M67 51 l14 14 M91 38 l6 25 M116 38 l-5 25 M141 46 l-13 21 M163 70 l-18 10 M49 118 l20 -10 M73 137 l14 -20 M102 143 l3 -23 M134 138 l-8 -21" />
        </G>
      )}
    </G>
  );
}

function ShortLeg({
  x,
  y,
  far = false,
}: {
  x: number;
  y: number;
  far?: boolean;
}) {
  return (
    <Path
      d={`M${x} ${y - 27} C${x - 4} ${y - 17} ${x - 5} ${y - 7} ${x} ${y - 2} C${x + 5} ${y + 2} ${x + 16} ${y + 2} ${x + 21} ${y - 2} C${x + 24} ${y - 5} ${x + 22} ${y - 9} ${x + 17} ${y - 11} C${x + 12} ${y - 14} ${x + 12} ${y - 22} ${x + 10} ${y - 28} Z`}
      fill={far ? FUR_FAR : FUR}
      stroke={INK}
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  );
}

function StandingHedgehog({
  size,
  mood,
  pose,
  phase,
}: {
  size: number;
  mood: BrambleMood;
  pose: BramblePose;
  phase: 0 | 1;
}) {
  const compact = size <= 76;
  const walking = pose === 'walk';
  const planting = pose === 'plant';
  const celebrating = pose === 'celebrate';
  const rearFarX = walking ? (phase ? 54 : 70) : 62;
  const frontFarX = walking ? (phase ? 148 : 132) : 137;
  const rearNearX = walking ? (phase ? 102 : 86) : 89;
  const frontNearX = walking ? (phase ? 158 : 174) : pose === 'greet' ? 171 : 162;
  const headTransform = pose === 'listen'
    ? 'rotate(-5 155 108) translate(-1 -3)'
    : pose === 'notice'
      ? 'rotate(-2 157 108) translate(2 -1)'
      : pose === 'plant'
        ? 'rotate(8 158 109) translate(1 3)'
        : pose === 'celebrate'
          ? 'rotate(-7 157 108) translate(0 -3)'
          : pose === 'greet'
            ? 'rotate(-3 157 108) translate(1 -2)'
            : undefined;

  return (
    <Svg width={size} height={size * 0.69} viewBox="0 0 240 166">
      <Defs>
        <LinearGradient id="brambleQuills" x1="0.08" y1="0" x2="0.92" y2="1">
          <Stop offset="0" stopColor="#74483F" />
          <Stop offset="0.52" stopColor="#8C4D3E" />
          <Stop offset="1" stopColor="#503936" />
        </LinearGradient>
        <RadialGradient id="brambleFur" cx="35%" cy="18%" r="88%">
          <Stop offset="0" stopColor="#F6D1A7" />
          <Stop offset="0.62" stopColor="#DF9A69" />
          <Stop offset="1" stopColor="#C47456" />
        </RadialGradient>
      </Defs>

      <GroundShadow cx={123} cy={156} rx={walking ? 87 : 90} ry={6.5} opacity={walking ? 0.16 : 0.2} />

      {/* Four attached, load-bearing legs establish the quadruped skeleton. */}
      <ShortLeg x={rearFarX} y={148} far />
      <ShortLeg x={frontFarX} y={147} far />
      <ShortLeg x={rearNearX} y={151} />
      {!planting && <ShortLeg x={frontNearX} y={150} />}

      {/* One low torso connects the coat, underside, shoulders and neck. */}
      <Path
        d="M73 104 C91 91 121 88 149 94 C169 98 180 110 177 125 C173 143 147 149 113 145 C84 142 66 132 65 119 C64 113 67 108 73 104 Z"
        fill="url(#brambleFur)"
        stroke={INK}
        strokeWidth="2.8"
      />

      <G transform={headTransform}>
        {/* The ear and rear cheek sit behind the quill edge, avoiding a circular neck seam. */}
        <Path d="M145 82 C138 74 141 64 151 62 C160 64 163 73 158 84 Z" fill="#BD7156" stroke={INK} strokeLinejoin="round" strokeWidth="2.4" />
        <Path d="M148 78 C144 73 146 68 151 67 C156 68 157 73 154 79 Z" fill="#E3A176" />
        <Path
          d="M138 80 C151 70 167 69 181 76 C194 82 201 93 211 100 C218 104 226 106 231 111 C233 113 231 116 228 118 C220 123 209 126 198 125 C187 124 179 120 173 116 C167 127 157 134 145 135 C135 135 128 130 126 122 C123 112 127 98 132 89 C134 85 136 82 138 80 Z"
          fill="url(#brambleFur)"
          stroke={INK}
          strokeLinejoin="round"
          strokeWidth="2.9"
        />
        <Path d="M180 99 C192 94 207 98 217 105 C221 108 225 109 228 112 C222 118 211 121 201 120 C189 120 180 115 177 108 C175 104 176 101 180 99 Z" fill={FUR_LIGHT} />
      </G>

      {/* The coat overlaps the head root as real quills do, creating one tapered silhouette. */}
      <QuillCoat compact={compact} />

      <G transform={headTransform}>
        <HedgehogFace mood={mood} pose={pose} />
        <Ellipse cx="229" cy="112" rx="5.3" ry="4.2" fill="#293D39" />
        {!compact && <Circle cx="230.2" cy="110.8" r="0.9" fill="#A9BBB2" />}
        {!compact && <Path d="M194 104 q10 3 18 1" fill="none" stroke="#D5966D" strokeLinecap="round" strokeWidth="1.3" opacity="0.68" />}
      </G>

      {planting && (
        <G>
          {/* The reaching paw remains visibly joined to the shoulder and meets the soil. */}
          <Path d="M157 122 C168 124 178 132 182 142 C185 149 194 152 200 148 C204 145 202 140 197 139 C189 137 187 128 177 120 Z" fill={FUR} stroke={INK} strokeLinejoin="round" strokeWidth="2.4" />
          <Path d="M207 154 C209 142 209 133 207 124" fill="none" stroke="#477453" strokeLinecap="round" strokeWidth="2.3" />
          <Path d="M208 137 C200 129 191 131 190 137 C196 144 203 145 208 142 Z" fill="#789D6C" stroke="#3F684B" strokeWidth="1.4" />
          <Path d="M208 132 C214 122 224 122 229 128 C227 137 218 141 209 139 Z" fill="#93AE79" stroke="#3F684B" strokeWidth="1.4" />
          <Path d="M198 154 q10 6 20 0" fill="none" stroke="#875940" strokeLinecap="round" strokeWidth="5" />
        </G>
      )}

      {celebrating && (
        <G fill="#D8B85F" stroke="#715C3E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1">
          <Path d="M43 55 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 Z" />
          <Path d="M205 61 q7 -9 13 -1 q-3 9 -13 9 q-4 -4 0 -8 Z" fill="#86A374" />
          <Circle cx="211" cy="83" r="3" />
        </G>
      )}

      {!compact && (
        <G fill="none" stroke="#75483F" strokeLinecap="round" strokeWidth="1.2" opacity="0.72">
          <Path d={`M${rearNearX + 7} 151 l-1 3 M${frontNearX + 8} 150 l1 3`} />
        </G>
      )}
    </Svg>
  );
}

function CurledHedgehog({ size, sleeping }: { size: number; sleeping: boolean }) {
  const compact = size <= 76;
  return (
    <Svg width={size} height={size * 0.69} viewBox="0 0 240 166">
      <Defs>
        <LinearGradient id="curledQuills" x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#75483F" />
          <Stop offset="0.55" stopColor="#8C4D3F" />
          <Stop offset="1" stopColor="#4E3936" />
        </LinearGradient>
        <RadialGradient id="curledFur" cx="33%" cy="18%" r="86%">
          <Stop offset="0" stopColor="#F5CEA3" />
          <Stop offset="0.68" stopColor="#DD9767" />
          <Stop offset="1" stopColor="#BE6D53" />
        </RadialGradient>
      </Defs>
      <GroundShadow cx={121} cy={151} rx={84} ry={7} />
      <Path
        d="M42 128 L27 118 L36 104 L24 91 L39 80 L32 65 L51 60 L53 45 L72 48 L84 33 L99 44 L116 30 L129 45 L148 37 L157 55 L175 57 L177 75 L194 84 L190 102 L201 116 C191 139 160 150 122 149 C84 149 54 142 42 128 Z"
        fill="url(#curledQuills)"
        stroke={INK}
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <G fill="none" stroke="#B96A4A" strokeLinecap="round" opacity="0.63" strokeWidth={compact ? 3 : 3.3}>
        <Path d="M40 106 l21 -11 M40 82 l22 -5 M56 59 l19 6 M78 45 l11 19 M102 41 l2 22 M127 44 l-8 21 M151 57 l-16 15 M178 82 l-20 7 M56 128 l20 -13 M82 143 l11 -22 M113 145 l-2 -24 M145 137 l-11 -18 M178 120 l-17 -13" />
      </G>
      <Path d="M130 106 C141 87 161 80 179 87 C194 93 203 106 199 119 C194 133 177 140 159 136 C145 133 134 125 130 116 C128 112 128 109 130 106 Z" fill="url(#curledFur)" stroke={INK} strokeWidth="2.7" />
      <Path d="M151 99 C145 91 148 83 157 82 C166 83 169 91 165 100 Z" fill="#C57759" stroke={INK} strokeLinejoin="round" strokeWidth="2.1" />
      <Path d="M176 107 C187 103 198 108 205 116 C199 123 188 127 178 123 C171 121 170 111 176 107 Z" fill={FUR_LIGHT} />
      <Path d={sleeping ? 'M166 102 q6 5 12 0' : 'M166 102 q6 4 12 0'} fill="none" stroke={INK} strokeLinecap="round" strokeWidth="2.3" />
      <Ellipse cx="204" cy="116" rx="5" ry="4" fill="#293D39" />
      <Path d="M178 123 q6 4 12 0" fill="none" stroke="#7D4840" strokeLinecap="round" strokeWidth="1.8" />
      {!compact && <Path d="M142 129 q13 8 26 3" fill="none" stroke="#E2A274" strokeLinecap="round" strokeWidth="5" opacity="0.62" />}
    </Svg>
  );
}

export function Bramble({
  size = 120,
  mood = 'happy',
  pose = 'standing',
  phase = 0,
}: {
  size?: number;
  mood?: BrambleMood;
  pose?: BramblePose;
  phase?: 0 | 1;
}) {
  return pose === 'curled'
    ? <CurledHedgehog size={size} sleeping={mood === 'sleepy'} />
    : <StandingHedgehog size={size} mood={mood} pose={pose} phase={phase} />;
}
