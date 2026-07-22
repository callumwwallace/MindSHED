import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AnimatedBramble } from './animated-bramble';
import { SleepingBrambleNest } from './sleeping-bramble-nest';

type PlaceVariant = 'bench' | 'shed' | 'gate' | 'path' | 'nursery' | 'potting';

function BenchVignette() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 100" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="benchGround" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#B9D09D" /><Stop offset="1" stopColor="#78976F" /></LinearGradient>
      </Defs>
      <Rect width="360" height="100" fill="#C7E2DD" />
      <Path d="M0 45 Q65 20 131 39 Q198 14 270 42 Q315 29 360 36 V65 H0 Z" fill="#89A78C" />
      <Path d="M0 55 Q87 34 166 52 Q253 30 360 54 V100 H0 Z" fill="url(#benchGround)" />
      <Path d="M190 100 C184 86 173 78 157 74 C140 70 129 64 123 54" fill="none" stroke="#C9B58A" strokeLinecap="round" strokeWidth="17" opacity="0.8" />
      <Path d="M190 100 C184 86 173 79 158 75 C141 71 131 65 124 55" fill="none" stroke="#E3D3AA" strokeLinecap="round" strokeWidth="2" opacity="0.62" />
      <G transform="translate(22 22)">
        <Ellipse cx="66" cy="58" rx="62" ry="7" fill="#315343" opacity="0.2" />
        <Path d="M4 18 C39 1 83 3 126 18 L122 29 C82 18 41 18 8 32 Z" fill="#8C6047" stroke="#4B3D37" strokeWidth="2" />
        <Path d="M10 41 C43 30 82 30 118 41 L110 55 C77 48 45 49 14 59 Z" fill="#76513F" stroke="#423834" strokeWidth="2" />
        <Path d="M14 59 C45 51 78 51 110 56 L105 63 C76 58 47 59 18 66 Z" fill="#AA7752" stroke="#4B3D37" strokeWidth="1.6" />
        <Path d="M23 61 L19 76 M100 59 L106 74" stroke="#423834" strokeWidth="4" strokeLinecap="round" />
        <Path d="M11 30 C45 20 86 20 121 29 M19 54 C47 47 78 46 108 52" fill="none" stroke="#C99465" strokeWidth="1.5" opacity="0.7" />
      </G>
      <G fill="#638A60" opacity="0.9"><Ellipse cx="326" cy="76" rx="18" ry="7" transform="rotate(-22 326 76)" /><Ellipse cx="345" cy="65" rx="18" ry="8" transform="rotate(21 345 65)" /></G>
    </Svg>
  );
}

function ShedVignette() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 180 100" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="miniShedWall" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#405757" /><Stop offset="1" stopColor="#263B3A" /></LinearGradient>
        <LinearGradient id="miniWindow" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#8097A0" /><Stop offset="1" stopColor="#709172" /></LinearGradient>
      </Defs>
      <Rect width="180" height="100" fill="url(#miniShedWall)" />
      <Path d="M0 9 Q88 -2 180 10" fill="none" stroke="#1B302E" strokeWidth="14" />
      <Path d="M18 0 L21 100 M91 0 L92 100 M164 0 L158 100" stroke="#1B302E" strokeWidth="7" opacity="0.8" />
      <G transform="translate(12 18)">
        <Path d="M0 0 Q27 -6 54 0 L53 53 Q27 59 1 53 Z" fill="#172B2A" stroke="#B28B60" strokeWidth="4" />
        <Path d="M7 6 Q27 2 47 6 L46 47 Q27 51 8 47 Z" fill="url(#miniWindow)" />
        <Circle cx="35" cy="18" r="9" fill="#F1D28A" opacity="0.85" />
        <Path d="M7 37 Q27 27 47 36 V47 Q27 52 8 47 Z" fill="#4C6D5B" />
        <Path d="M27 3 V50 M5 27 Q27 24 49 27" stroke="#896C4E" strokeWidth="1.8" />
      </G>
      <G transform="translate(108 22)">
        <Path d="M0 0 Q28 -4 57 0 M1 25 Q29 21 57 25 M2 50 Q30 46 57 50" stroke="#A47A55" strokeWidth="5" strokeLinecap="round" />
        <Rect x="8" y="6" width="10" height="14" rx="2" fill="#B77A5B" /><Rect x="22" y="9" width="9" height="11" rx="2" fill="#D0B06D" /><Path d="M38 20 q7 -17 14 0" fill="#6F8E68" />
      </G>
      <Path d="M82 80 Q130 70 180 80 V100 H75 Z" fill="#604738" />
      <Path d="M78 80 Q129 71 180 80" fill="none" stroke="#B5875B" strokeWidth="4" />
      <Ellipse cx="132" cy="91" rx="44" ry="8" fill="#182B28" opacity="0.24" />
    </Svg>
  );
}

function GateVignette() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 180 100" preserveAspectRatio="xMidYMid slice">
      <Rect width="180" height="100" fill="#C7E2DD" />
      <Path d="M0 38 Q46 17 91 35 Q135 20 180 39 V100 H0 Z" fill="#88A486" />
      <Path d="M88 100 C91 84 91 70 84 55" fill="none" stroke="#C8B486" strokeWidth="25" strokeLinecap="round" />
      <Path d="M88 100 C91 83 90 70 84 55" fill="none" stroke="#E3D3A8" strokeWidth="2" opacity="0.65" />
      <G transform="translate(10 17)">
        <Ellipse cx="55" cy="75" rx="54" ry="7" fill="#284A3D" opacity="0.2" />
        <Path d="M4 73 V29 C20 0 62 -3 85 27 V73" fill="none" stroke="#5D4739" strokeWidth="8" strokeLinecap="round" />
        <Path d="M10 73 V34 C28 14 58 13 79 33 V73" fill="none" stroke="#927051" strokeWidth="4" />
        <Path d="M14 44 C34 29 57 29 76 43 M14 57 C34 43 57 43 76 56 M14 69 C34 58 57 58 76 68" fill="none" stroke="#785942" strokeWidth="4" strokeLinecap="round" />
        <Circle cx="72" cy="56" r="2.7" fill="#D6B36F" stroke="#55473A" strokeWidth="1" />
      </G>
      <G fill="#739669"><Ellipse cx="19" cy="18" rx="14" ry="6" transform="rotate(-22 19 18)" /><Ellipse cx="91" cy="17" rx="14" ry="6" transform="rotate(22 91 17)" /></G>
    </Svg>
  );
}

function PathVignette() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 100" preserveAspectRatio="xMidYMid slice">
      <Rect width="120" height="100" fill="#B9CF99" />
      <Path d="M17 104 C25 79 48 67 82 59 C103 54 114 39 121 22" fill="none" stroke="#B5A078" strokeWidth="34" strokeLinecap="round" />
      <Path d="M17 104 C26 80 49 68 82 60 C104 54 114 40 120 23" fill="none" stroke="#D8C89E" strokeWidth="27" strokeLinecap="round" />
      <G fill="#CFC39E" stroke="#8C8068" strokeWidth="1">
        <Ellipse cx="28" cy="87" rx="15" ry="6" transform="rotate(-18 28 87)" />
        <Ellipse cx="52" cy="72" rx="12" ry="5" transform="rotate(-12 52 72)" />
        <Ellipse cx="79" cy="62" rx="10" ry="4" transform="rotate(-8 79 62)" />
        <Ellipse cx="100" cy="47" rx="8" ry="3.5" transform="rotate(-19 100 47)" />
      </G>
      <G fill="none" stroke="#4E7653" strokeLinecap="round" strokeWidth="2"><Path d="M12 69 q1 -16 8 -28 M108 84 q-4 -18 -13 -29 M8 93 q-4 -12 -9 -18" /></G>
      <G fill="#779B6C"><Ellipse cx="21" cy="42" rx="10" ry="4" transform="rotate(-28 21 42)" /><Ellipse cx="95" cy="56" rx="9" ry="4" transform="rotate(28 95 56)" /><Ellipse cx="107" cy="80" rx="11" ry="4" transform="rotate(-20 107 80)" /></G>
      <Circle cx="11" cy="66" r="2.5" fill="#E5D38F" /><Circle cx="91" cy="38" r="2.4" fill="#E8D79A" />
    </Svg>
  );
}

function NurseryVignette() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 180 100" preserveAspectRatio="xMidYMid slice">
      <Rect width="180" height="100" fill="#CAE6DE" />
      <Circle cx="149" cy="19" r="12" fill="#F3D789" />
      <Path d="M0 51 Q43 31 88 48 Q132 28 180 47 V100 H0 Z" fill="#94B58B" />
      <Path d="M15 91 V34 Q15 10 42 10 H117 Q144 10 144 34 V91" fill="#EAF3DE" fillOpacity="0.38" stroke="#55735F" strokeWidth="5" />
      <Path d="M80 11 V91 M17 37 H143" stroke="#688873" strokeWidth="2.5" opacity="0.75" />
      <Path d="M9 83 Q47 72 87 83 Q127 71 166 82 V100 H9 Z" fill="#7A5A3E" />
      <Path d="M17 83 Q48 77 77 84 M95 83 Q125 76 157 83" fill="none" stroke="#B7895E" strokeWidth="5" strokeLinecap="round" />
      <G stroke="#496C50" strokeWidth="2" strokeLinecap="round">
        <Path d="M45 80 V62 M72 82 V67 M116 81 V60 M141 82 V69" />
      </G>
      <G fill="#6F9A67">
        <Ellipse cx="39" cy="65" rx="8" ry="4" transform="rotate(-25 39 65)" /><Ellipse cx="51" cy="66" rx="8" ry="4" transform="rotate(25 51 66)" />
        <Ellipse cx="67" cy="70" rx="6" ry="3" transform="rotate(-28 67 70)" /><Ellipse cx="77" cy="71" rx="6" ry="3" transform="rotate(28 77 71)" />
        <Ellipse cx="109" cy="63" rx="8" ry="4" transform="rotate(-27 109 63)" /><Ellipse cx="122" cy="64" rx="8" ry="4" transform="rotate(27 122 64)" />
        <Ellipse cx="136" cy="71" rx="6" ry="3" transform="rotate(-25 136 71)" /><Ellipse cx="146" cy="72" rx="6" ry="3" transform="rotate(25 146 72)" />
      </G>
    </Svg>
  );
}

function PottingVignette() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 180 100" preserveAspectRatio="xMidYMid slice">
      <Rect width="180" height="100" fill="#CFE6E8" />
      <Path d="M0 49 Q45 30 89 47 Q135 28 180 45 V100 H0 Z" fill="#91AD8B" />
      <Path d="M0 72 Q43 57 84 68 Q134 52 180 67 V100 H0 Z" fill="#AFC798" />
      <Path d="M21 58 H159 V68 H21 Z M31 67 H39 V100 H31 Z M141 67 H149 V100 H141 Z" fill="#805B40" />
      <Path d="M24 55 Q91 48 157 55 V64 H24 Z" fill="#B58458" stroke="#674A37" strokeWidth="2" />
      <G>
        <Path d="M44 37 H69 L66 55 H47 Z" fill="#C77E59" /><Path d="M42 34 H71 V40 H42 Z" fill="#A96448" />
        <Path d="M107 39 H130 L127 55 H110 Z" fill="#D6AA69" /><Path d="M105 36 H132 V42 H105 Z" fill="#A77C4C" />
        <Path d="M56 34 V23" stroke="#4D7454" strokeWidth="2" /><Ellipse cx="50" cy="25" rx="8" ry="4" fill="#719B68" transform="rotate(-24 50 25)" /><Ellipse cx="62" cy="24" rx="8" ry="4" fill="#719B68" transform="rotate(24 62 24)" />
        <Path d="M118 37 V28" stroke="#4D7454" strokeWidth="2" /><Ellipse cx="112" cy="29" rx="7" ry="3.5" fill="#719B68" transform="rotate(-24 112 29)" /><Ellipse cx="124" cy="29" rx="7" ry="3.5" fill="#719B68" transform="rotate(24 124 29)" />
      </G>
      <Path d="M67 78 H112 V92 H67 Z" fill="#D7C58F" stroke="#816E4D" strokeWidth="2" /><Path d="M89 78 V92" stroke="#816E4D" strokeWidth="2" />
      <Circle cx="78" cy="84" r="2.5" fill="#6E8E62" /><Circle cx="101" cy="86" r="2.5" fill="#6E8E62" />
    </Svg>
  );
}

export function PlaceVignette({
  variant,
  height = 92,
  showBramble = true,
}: {
  variant: PlaceVariant;
  height?: number;
  showBramble?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const size = Math.max(52, Math.min(68, height * (variant === 'bench' ? 0.68 : 0.62), width ? width * 0.36 : 68));

  return (
    <View
      pointerEvents="none"
      onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
      style={{ height, overflow: 'hidden' }}>
      <View style={StyleSheet.absoluteFill}>
        {variant === 'bench' && <BenchVignette />}
        {variant === 'shed' && <ShedVignette />}
        {variant === 'gate' && <GateVignette />}
        {variant === 'path' && <PathVignette />}
        {variant === 'nursery' && <NurseryVignette />}
        {variant === 'potting' && <PottingVignette />}
      </View>
      {showBramble && variant === 'bench' && (
        <View style={{ position: 'absolute', left: Math.min(width * 0.43, Math.max(8, width - size - 8)), bottom: 3 }}>
          <AnimatedBramble size={size} state="breathe" mood="calm" style={{ transform: [{ scaleX: -1 }] }} />
        </View>
      )}
      {showBramble && variant === 'shed' && (
        <View style={{ position: 'absolute', right: 4, bottom: 1 }}>
          <SleepingBrambleNest size={Math.min(58, size)} />
        </View>
      )}
      {showBramble && variant === 'gate' && (
        <View style={{ position: 'absolute', right: 3, bottom: 2 }}>
          <AnimatedBramble size={size} state="wander" mood="calm" style={{ transform: [{ scaleX: -1 }] }} />
        </View>
      )}
      {showBramble && variant === 'path' && (
        <View style={{ position: 'absolute', right: 0, bottom: 1 }}>
          <AnimatedBramble size={size} state="notice" mood="calm" />
        </View>
      )}
      {showBramble && variant === 'nursery' && (
        <View style={{ position: 'absolute', right: 3, bottom: 1 }}>
          <AnimatedBramble size={size} state="plant" mood="happy" />
        </View>
      )}
      {showBramble && variant === 'potting' && (
        <View style={{ position: 'absolute', right: 2, bottom: 1 }}>
          <AnimatedBramble size={size} state="notice" mood="calm" style={{ transform: [{ scaleX: -1 }] }} />
        </View>
      )}
    </View>
  );
}
