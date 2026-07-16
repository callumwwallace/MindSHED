import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { AnimatedBramble } from './animated-bramble';

export function SleepingBrambleNest({ size = 132 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size * 0.72 }} accessibilityLabel="Bramble sleeping in a soft leaf nest">
      <Svg width="100%" height="100%" viewBox="0 0 150 108" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="nestMoss" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#9CAE7E" /><Stop offset="1" stopColor="#617A63" /></LinearGradient>
          <LinearGradient id="nestLeaf" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#D5BD75" /><Stop offset="1" stopColor="#9A714C" /></LinearGradient>
        </Defs>
        <Ellipse cx="75" cy="95" rx="65" ry="9" fill="#172724" opacity="0.26" />
        <Path d="M12 77 Q24 47 75 42 Q126 47 139 77 Q113 94 75 95 Q37 94 12 77 Z" fill="url(#nestMoss)" stroke="#36483E" strokeWidth="2.5" />
        <Path d="M25 70 Q76 48 127 70 Q110 83 75 84 Q40 83 25 70 Z" fill="#C7D1A8" />
        <G fill="url(#nestLeaf)" stroke="#675545" strokeWidth="1.5">
          <Path d="M22 73 Q3 58 10 42 Q30 46 34 67 Q30 72 22 73 Z" />
          <Path d="M33 58 Q22 34 39 22 Q56 39 47 61 Q41 63 33 58 Z" />
          <Path d="M116 63 Q120 38 138 35 Q145 56 128 73 Q121 71 116 63 Z" />
          <Path d="M101 53 Q110 27 127 28 Q131 47 114 64 Q106 61 101 53 Z" />
        </G>
        <G fill="#E6D395" opacity="0.85"><Circle cx="26" cy="80" r="3" /><Circle cx="124" cy="78" r="3.5" /><Circle cx="47" cy="86" r="2.5" /></G>
      </Svg>
      <View style={{ position: 'absolute', left: size * 0.1, top: size * 0.02 }}><AnimatedBramble size={size * 0.8} mood="sleepy" state="sleep" /></View>
      <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 150 108" style={StyleSheet.absoluteFill}>
        <Path d="M13 76 Q75 98 138 76 Q130 102 75 105 Q20 102 13 76 Z" fill="#6E8667" stroke="#36483E" strokeWidth="2.5" />
        <Path d="M20 82 Q75 99 131 82 M28 91 Q75 103 122 91" stroke="#A6B488" strokeWidth="3" fill="none" opacity="0.72" />
        <Path d="M39 96 Q52 79 66 101 M87 102 Q101 81 114 96" stroke="#D7C487" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.76" />
      </Svg>
    </View>
  );
}
