import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { AnimatedBramble, type CompanionState } from './animated-bramble';

export function BenchBreathingScene({
  brambleState = 'breathe',
  brambleSize = 176,
}: {
  brambleState?: CompanionState;
  brambleSize?: number;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="breathSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#526F85" />
            <Stop offset="0.48" stopColor="#92B3B5" />
            <Stop offset="1" stopColor="#C9D5B7" />
          </LinearGradient>
          <LinearGradient id="breathGrass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8AA079" />
            <Stop offset="1" stopColor="#536F57" />
          </LinearGradient>
          <LinearGradient id="benchWood" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#BA865E" />
            <Stop offset="1" stopColor="#6F4A3B" />
          </LinearGradient>
        </Defs>
        <Rect width="390" height="844" fill="url(#breathSky)" />
        <Circle cx="316" cy="126" r="44" fill="#F4D99B" opacity="0.5" />
        <Path d="M0 307 Q80 245 170 292 Q270 224 390 284 V492 H0 Z" fill="#738B7B" opacity="0.72" />
        <Path d="M0 367 Q103 305 201 353 Q298 291 390 340 V536 H0 Z" fill="#687F67" />
        <Path d="M0 454 Q97 392 197 430 Q307 374 390 419 V844 H0 Z" fill="url(#breathGrass)" />
        <G opacity="0.72" fill="#45604E">
          <Ellipse cx="22" cy="488" rx="54" ry="20" transform="rotate(-18 22 488)" />
          <Ellipse cx="356" cy="459" rx="61" ry="23" transform="rotate(18 356 459)" />
          <Ellipse cx="376" cy="524" rx="48" ry="18" transform="rotate(-10 376 524)" />
        </G>
        <Path d="M52 770 C116 737 273 736 342 771" fill="none" stroke="#294A3D" strokeWidth="25" strokeLinecap="round" opacity="0.22" />
        <G transform="translate(25 422)">
          <Ellipse cx="173" cy="226" rx="168" ry="18" fill="#243D35" opacity="0.3" />
          <Path d="M12 26 Q165 -8 328 25 L318 74 Q169 49 23 77 Z" fill="url(#benchWood)" stroke="#453A35" strokeWidth="5" />
          <Path d="M24 97 Q169 66 316 95 L300 151 Q166 126 40 156 Z" fill="#765040" stroke="#403631" strokeWidth="5" />
          <Path d="M39 155 Q168 130 301 151 L292 176 Q167 158 47 180 Z" fill="#A57250" stroke="#453A35" strokeWidth="4" />
          <Path d="M59 175 L42 232 M280 172 L301 228" stroke="#413632" strokeWidth="12" strokeLinecap="round" />
          <Path d="M25 53 Q170 25 319 51 M38 130 Q167 103 304 126" fill="none" stroke="#D09B6B" strokeWidth="4" opacity="0.58" />
        </G>
        <G fill="#B7C38D" opacity="0.78">
          <Circle cx="50" cy="427" r="3" /><Circle cx="77" cy="451" r="2.5" /><Circle cx="332" cy="402" r="3" />
        </G>
      </Svg>
      <View style={{ position: 'absolute', left: '24%', bottom: '31%' }}>
        <AnimatedBramble size={brambleSize} mood="calm" state={brambleState} />
      </View>
    </View>
  );
}

export function GateChoiceScene({ brambleState = 'wander' }: { brambleState?: CompanionState }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="gateSky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#BFDDE0" /><Stop offset="1" stopColor="#E7E0B5" /></LinearGradient>
          <LinearGradient id="gateGrass" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#9DB781" /><Stop offset="1" stopColor="#698465" /></LinearGradient>
        </Defs>
        <Rect width="390" height="844" fill="url(#gateSky)" />
        <Path d="M0 245 Q82 183 171 231 Q277 164 390 227 V500 H0 Z" fill="#76937D" opacity="0.82" />
        <Path d="M0 331 Q104 270 212 312 Q309 264 390 295 V844 H0 Z" fill="url(#gateGrass)" />
        <Path d="M185 844 C177 741 197 655 230 586 C254 536 256 477 231 421" fill="none" stroke="#B49E77" strokeWidth="116" strokeLinecap="round" />
        <Path d="M185 844 C178 741 198 657 231 586 C255 536 256 478 231 421" fill="none" stroke="#D9C99F" strokeWidth="92" strokeLinecap="round" />
        <G transform="translate(61 250)">
          <Ellipse cx="172" cy="201" rx="142" ry="18" fill="#28483A" opacity="0.24" />
          <Path d="M20 204 V87 C51 9 153 -6 210 75 V204" fill="none" stroke="#4F3D34" strokeWidth="25" strokeLinecap="round" />
          <Path d="M25 202 V92 C58 27 148 15 204 82 V202" fill="none" stroke="#8D6A4D" strokeWidth="13" />
          <Path d="M34 111 C80 72 154 68 196 103 M34 143 C81 105 153 101 197 136 M34 177 C85 139 153 138 198 171" fill="none" stroke="#74543F" strokeWidth="14" strokeLinecap="round" />
          <Circle cx="186" cy="146" r="8" fill="#D8B56F" stroke="#514238" strokeWidth="3" />
        </G>
        <G fill="#507457"><Ellipse cx="34" cy="305" rx="56" ry="21" transform="rotate(-22 34 305)" /><Ellipse cx="350" cy="332" rx="67" ry="25" transform="rotate(20 350 332)" /></G>
        <G fill="#E5D28D"><Circle cx="30" cy="529" r="4" /><Circle cx="353" cy="556" r="4" /><Circle cx="67" cy="618" r="3" /></G>
      </Svg>
      <View style={{ position: 'absolute', left: 22, bottom: '37%' }}>
        <AnimatedBramble size={112} mood="calm" state={brambleState} />
      </View>
    </View>
  );
}

const TRAIL_PALETTES = [
  { skyTop: '#B8D9D8', skyBottom: '#E4DDBD', groundTop: '#91AA7C', groundBottom: '#CAD2A8' },
  { skyTop: '#B9D3C9', skyBottom: '#E1DAB8', groundTop: '#88A07A', groundBottom: '#C5CBA5' },
  { skyTop: '#A9CDD1', skyBottom: '#DED7B6', groundTop: '#809B77', groundBottom: '#C0CAA7' },
  { skyTop: '#C0D2D0', skyBottom: '#E6D8BA', groundTop: '#94A97C', groundBottom: '#CFCEA7' },
  { skyTop: '#AAC9D0', skyBottom: '#DED6BD', groundTop: '#829D83', groundBottom: '#C4CEB0' },
] as const;

function SenseLandmark({ step }: { step: number }) {
  if (step === 0) return <>
    <Path d="M42 381 L126 272 L201 357 L283 246 L357 377 Z" fill="#789188" opacity="0.78" />
    <Path d="M302 282 q12 -12 24 0 q12 -12 24 0" fill="none" stroke="#49655B" strokeLinecap="round" strokeWidth="3" />
    <G><Circle cx="104" cy="424" r="7" fill="#E5C86F" /><Circle cx="132" cy="439" r="6" fill="#D99B87" /><Circle cx="163" cy="419" r="5" fill="#B09BC1" /></G>
  </>;
  if (step === 1) return <>
    <Ellipse cx="196" cy="456" rx="95" ry="15" fill="#486256" opacity="0.2" />
    <Path d="M105 438 Q122 351 198 339 Q270 335 286 420 Q244 461 171 460 Q126 459 105 438 Z" fill="#6B7C70" stroke="#455B50" strokeWidth="4" />
    <Path d="M119 414 Q149 352 211 350 Q252 351 271 393 Q223 375 183 392 Q145 409 119 414 Z" fill="#91A87D" />
  </>;
  if (step === 2) return <>
    <Path d="M68 438 Q165 385 286 409" fill="none" stroke="#4A6752" strokeWidth="13" strokeLinecap="round" />
    <G fill="#738F69"><Ellipse cx="110" cy="412" rx="28" ry="11" transform="rotate(-20 110 412)" /><Ellipse cx="250" cy="407" rx="30" ry="11" transform="rotate(18 250 407)" /></G>
    <Path d="M155 336 q15 -17 30 0 q15 -17 30 0" fill="none" stroke="#405E55" strokeLinecap="round" strokeWidth="4" />
    <G fill="none" stroke="#F4E8BD" strokeLinecap="round"><Path d="M229 345 q38 20 0 41" strokeWidth="6" /><Path d="M242 329 q68 36 0 73" strokeWidth="4" /></G>
  </>;
  if (step === 3) return <>
    <G stroke="#486C50" strokeLinecap="round">
      <Path d="M139 455 Q130 388 143 335 M194 458 Q207 375 193 322 M250 458 Q239 389 253 343" fill="none" strokeWidth="5" />
      <G fill="#A889B0"><Circle cx="143" cy="343" r="14" /><Circle cx="194" cy="331" r="15" /></G>
      <Circle cx="252" cy="351" r="14" fill="#E2C474" />
    </G>
  </>;
  return <G>
    <Ellipse cx="194" cy="454" rx="91" ry="14" fill="#365A50" opacity="0.2" />
    <Path d="M111 387 Q194 347 277 387 L262 440 Q195 468 127 440 Z" fill="#627D70" stroke="#365A58" strokeWidth="4" />
    <Ellipse cx="194" cy="387" rx="81" ry="34" fill="#67908C" stroke="#365A58" strokeWidth="4" />
    <Path d="M137 393 Q178 371 215 388 Q240 398 258 381" fill="none" stroke="#C4DDCD" strokeWidth="4" opacity="0.7" />
  </G>;
}

export function FiveSensesTrailScene({ step, travelling }: { step: number; travelling: boolean }) {
  const reduceMotion = useReducedMotion();
  const [travel] = useState(() => new Animated.Value(0));
  const [sceneOpacity] = useState(() => new Animated.Value(1));
  const palette = TRAIL_PALETTES[step];

  useEffect(() => {
    sceneOpacity.setValue(reduceMotion ? 1 : 0.35);
    Animated.timing(sceneOpacity, { toValue: 1, duration: reduceMotion ? 0 : 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    Animated.timing(travel, {
      toValue: step,
      duration: reduceMotion ? 0 : 1900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [reduceMotion, sceneOpacity, step, travel]);

  const left = travel.interpolate({ inputRange: [0, 1, 2, 3, 4], outputRange: ['4%', '64%', '4%', '64%', '4%'] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: sceneOpacity }]}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="trailSky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={palette.skyTop} /><Stop offset="1" stopColor={palette.skyBottom} /></LinearGradient>
          <LinearGradient id="trailGround" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={palette.groundTop} /><Stop offset="1" stopColor={palette.groundBottom} /></LinearGradient>
        </Defs>
        <Rect width="390" height="844" fill="url(#trailSky)" />
        <Circle cx="318" cy="139" r="39" fill="#F0D79C" opacity="0.42" />
        <Path d="M0 311 Q91 250 184 298 Q288 237 390 290 V844 H0 Z" fill="url(#trailGround)" />
        <Path d="M0 548 Q103 505 198 546 Q294 493 390 538 V844 H0 Z" fill="#D3D5AE" opacity="0.82" />
        <SenseLandmark step={step} />
      </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', left, bottom: 286 }}>
        <AnimatedBramble size={112} mood="calm" state={travelling ? 'wander' : step === 2 ? 'listen' : 'notice'} style={{ transform: [{ scaleX: step % 2 ? -1 : 1 }] }} />
      </Animated.View>
    </View>
  );
}
