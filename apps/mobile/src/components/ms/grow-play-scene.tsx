import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { AnimatedBramble, type CompanionState } from './animated-bramble';
import { BodyBold, CharacterText } from './text';
import { MS } from '@/constants/mindshed';

function NurseryBackdrop() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice">
      <Rect width="360" height="220" fill="#CDE8E1" />
      <Circle cx="301" cy="40" r="25" fill="#F1D58A" />
      <Path d="M0 98 Q79 59 165 94 Q248 57 360 94 V220 H0 Z" fill="#91B28A" />
      <Path d="M34 192 V71 Q34 22 91 22 H256 Q313 22 313 71 V192" fill="#F2F5DE" fillOpacity="0.42" stroke="#567660" strokeWidth="9" />
      <Path d="M174 23 V193 M37 83 H310" stroke="#6D8B75" strokeWidth="4" opacity="0.7" />
      <Path d="M0 178 Q75 152 150 175 Q235 148 360 174 V220 H0 Z" fill="#6F523B" />
      <Path d="M12 180 Q69 164 129 178 M215 176 Q275 158 348 175" fill="none" stroke="#B4875E" strokeWidth="11" strokeLinecap="round" />
      <G stroke="#486E50" strokeWidth="4" strokeLinecap="round">
        <Path d="M53 174 V137 M91 174 V145 M260 171 V132 M302 173 V146" />
      </G>
      <G fill="#6E9A67">
        <Ellipse cx="42" cy="141" rx="15" ry="7" transform="rotate(-25 42 141)" /><Ellipse cx="65" cy="142" rx="15" ry="7" transform="rotate(25 65 142)" />
        <Ellipse cx="82" cy="149" rx="12" ry="6" transform="rotate(-25 82 149)" /><Ellipse cx="101" cy="149" rx="12" ry="6" transform="rotate(25 101 149)" />
        <Ellipse cx="247" cy="136" rx="16" ry="7" transform="rotate(-27 247 136)" /><Ellipse cx="273" cy="137" rx="16" ry="7" transform="rotate(27 273 137)" />
        <Ellipse cx="291" cy="149" rx="12" ry="6" transform="rotate(-25 291 149)" /><Ellipse cx="311" cy="149" rx="12" ry="6" transform="rotate(25 311 149)" />
      </G>
      <G fill="#E6CD83"><Circle cx="52" cy="133" r="4" /><Circle cx="260" cy="128" r="4" /></G>
    </Svg>
  );
}

function PottingBackdrop() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice">
      <Rect width="360" height="220" fill="#CFE7E9" />
      <Path d="M0 91 Q79 51 166 87 Q253 46 360 82 V220 H0 Z" fill="#8FAA89" />
      <Path d="M0 134 Q88 102 173 129 Q270 94 360 124 V220 H0 Z" fill="#ADC699" />
      <G fill="#73986B"><Ellipse cx="47" cy="59" rx="29" ry="12" transform="rotate(-25 47 59)" /><Ellipse cx="319" cy="58" rx="29" ry="12" transform="rotate(25 319 58)" /></G>
      <Path d="M25 139 H335 V160 H25 Z M48 158 H64 V220 H48 Z M296 158 H312 V220 H296 Z" fill="#79543C" />
      <Path d="M29 132 Q180 117 330 132 V151 H29 Z" fill="#B58458" stroke="#654A38" strokeWidth="4" />
      <Path d="M72 89 H126 L119 131 H80 Z" fill="#C97F5A" /><Path d="M67 82 H131 V96 H67 Z" fill="#A76549" />
      <Path d="M236 94 H282 L277 130 H241 Z" fill="#D8AC6D" /><Path d="M231 87 H287 V101 H231 Z" fill="#AA7D4E" />
      <Path d="M99 83 V52 M259 87 V63" stroke="#4D7354" strokeWidth="5" />
      <G fill="#719B68"><Ellipse cx="84" cy="56" rx="20" ry="9" transform="rotate(-26 84 56)" /><Ellipse cx="113" cy="54" rx="20" ry="9" transform="rotate(25 113 54)" /><Ellipse cx="246" cy="67" rx="15" ry="7" transform="rotate(-25 246 67)" /><Ellipse cx="272" cy="66" rx="15" ry="7" transform="rotate(25 272 66)" /></G>
      <Path d="M117 177 H219 V210 H117 Z" fill="#D8C790" stroke="#816E4E" strokeWidth="4" /><Path d="M168 177 V210" stroke="#816E4E" strokeWidth="3" />
      <G fill="#688961"><Circle cx="138" cy="191" r="5" /><Circle cx="192" cy="196" r="5" /><Circle cx="204" cy="186" r="4" /></G>
    </Svg>
  );
}

export function GrowPlayScene({
  variant,
  state = variant === 'nursery' ? 'plant' : 'notice',
  message,
  eyebrow,
  height = 230,
}: {
  variant: 'nursery' | 'potting';
  state?: CompanionState;
  message?: string;
  eyebrow?: string;
  height?: number;
}) {
  return (
    <View style={{ height, borderRadius: 28, overflow: 'hidden', backgroundColor: variant === 'nursery' ? '#CDE8E1' : '#CFE7E9', borderWidth: 1, borderColor: `${MS.color.forest}12` }}>
      <View style={StyleSheet.absoluteFill}>{variant === 'nursery' ? <NurseryBackdrop /> : <PottingBackdrop />}</View>
      {!!eyebrow && <View style={{ position: 'absolute', left: 15, top: 14, borderRadius: 999, backgroundColor: 'rgba(255,254,247,0.84)', paddingHorizontal: 11, paddingVertical: 6 }}><BodyBold size={8.5} color={MS.color.forestMuted} style={{ letterSpacing: 1 }}>{eyebrow}</BodyBold></View>}
      {!!message && <View style={{ position: 'absolute', left: 15, top: 53, maxWidth: '62%', borderRadius: 17, borderBottomLeftRadius: 5, backgroundColor: 'rgba(255,254,247,0.94)', borderWidth: 1, borderColor: 'rgba(49,91,69,0.09)', paddingHorizontal: 12, paddingVertical: 9 }}><CharacterText size={10.5} color={MS.color.forest}>{message}</CharacterText></View>}
      <View style={{ position: 'absolute', right: 15, bottom: 4 }}><AnimatedBramble size={112} state={state} mood={state === 'celebrate' ? 'happy' : 'calm'} style={variant === 'potting' ? { transform: [{ scaleX: -1 }] } : undefined} /></View>
    </View>
  );
}
