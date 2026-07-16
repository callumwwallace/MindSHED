import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

export function ShedInterior({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.wrap, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="insideWall" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#3A5150" /><Stop offset="0.58" stopColor="#2C4140" /><Stop offset="1" stopColor="#223433" /></LinearGradient>
          <LinearGradient id="insideFloor" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#765941" /><Stop offset="1" stopColor="#45372F" /></LinearGradient>
          <LinearGradient id="outsideWindow" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#738A9A" /><Stop offset="0.62" stopColor="#AAB7A5" /><Stop offset="1" stopColor="#6D8B70" /></LinearGradient>
          <LinearGradient id="deskWood" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#B3815A" /><Stop offset="0.55" stopColor="#8B6046" /><Stop offset="1" stopColor="#5F4536" /></LinearGradient>
          <LinearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFF9E7" /><Stop offset="1" stopColor="#DDD1AE" /></LinearGradient>
          <RadialGradient id="roomLight" cx="50%" cy="42%" r="58%"><Stop offset="0" stopColor="#F6D08A" stopOpacity="0.32" /><Stop offset="0.55" stopColor="#E8AF62" stopOpacity="0.1" /><Stop offset="1" stopColor="#1C302F" stopOpacity="0" /></RadialGradient>
          <RadialGradient id="lampGlow" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#FFF2BA" stopOpacity="0.64" /><Stop offset="1" stopColor="#F1BF69" stopOpacity="0" /></RadialGradient>
          <LinearGradient id="rug" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#73846E" /><Stop offset="1" stopColor="#455D55" /></LinearGradient>
        </Defs>

        <Rect width="390" height="535" fill="url(#insideWall)" />
        <Path d="M0 0 L390 0 L390 77 Q285 57 198 72 Q93 88 0 63 Z" fill="#172A2A" opacity="0.82" />
        <Path d="M22 0 L49 0 L57 535 L26 535 Z M181 0 L211 0 L215 535 L183 535 Z M350 0 L380 0 L365 535 L338 535 Z" fill="#1B2D2C" opacity="0.88" />
        {[102, 176, 252, 329, 407, 483].map((y, index) => <Path key={y} d={`M0 ${y} Q${96 + index * 6} ${y - 8} 201 ${y + 1} Q292 ${y + 9} 390 ${y - 4}`} stroke="#73817A" strokeWidth="1.2" opacity="0.22" fill="none" />)}
        <G stroke="#829087" strokeWidth="0.8" opacity="0.17" fill="none"><Path d="M75 111 q43 13 78 0 M227 206 q45 -10 91 1 M62 359 q36 -12 78 -1 M238 447 q43 12 83 0" /></G>

        <G>
          <Path d="M39 137 Q95 123 151 135 L148 313 Q95 323 42 309 Z" fill="#162827" stroke="#A3835B" strokeWidth="7" />
          <Path d="M49 147 Q96 137 141 146 L139 302 Q95 309 51 300 Z" fill="url(#outsideWindow)" />
          <Circle cx="113" cy="181" r="21" fill="#F2D79A" opacity="0.86" />
          <Path d="M50 260 Q90 223 140 246 L139 302 Q95 309 51 300 Z" fill="#597668" />
          <Path d="M50 277 Q92 245 139 266 V302 Q96 309 51 300 Z" fill="#45645B" />
          <Path d="M96 140 L96 307 M47 222 Q96 214 143 220" stroke="#876B4E" strokeWidth="4" />
          <Path d="M37 132 Q96 114 157 130" stroke="#C09B66" strokeWidth="4" strokeLinecap="round" />
          <G fill="#809B78"><Ellipse cx="43" cy="124" rx="13" ry="7" transform="rotate(-29 43 124)" /><Ellipse cx="57" cy="117" rx="12" ry="6" transform="rotate(20 57 117)" /><Ellipse cx="145" cy="121" rx="13" ry="7" transform="rotate(28 145 121)" /></G>
        </G>

        <G transform="translate(258 121)">
          <Path d="M0 17 Q48 10 100 16" stroke="#172927" strokeWidth="8" strokeLinecap="round" />
          <Path d="M7 19 L5 159 M93 17 L98 159" stroke="#1B2D2B" strokeWidth="6" />
          <Path d="M2 61 Q49 54 99 60 M3 108 Q51 101 97 107 M4 155 Q51 149 99 154" stroke="#9D7553" strokeWidth="8" strokeLinecap="round" />
          <G transform="translate(11 29)"><Rect width="14" height="28" rx="2" fill="#9E6657" /><Rect x="16" y="7" width="12" height="21" rx="2" fill="#C4A56C" /><Rect x="30" y="2" width="16" height="26" rx="2" fill="#687C67" /><Path d="M51 28 q10 -25 22 0" fill="#425E51" /><Ellipse cx="57" cy="8" rx="6" ry="14" fill="#78966F" transform="rotate(-25 57 8)" /><Ellipse cx="69" cy="7" rx="6" ry="15" fill="#6D8D66" transform="rotate(24 69 7)" /></G>
          <G transform="translate(13 76)"><Rect width="18" height="28" rx="3" fill="#536B65" /><Path d="M4 8 q5 -5 10 0 v12 H4 Z" fill="#E8C779" opacity="0.75" /><Rect x="26" y="8" width="42" height="18" rx="3" fill="#B87A59" /><Path d="M32 13 h29 M32 18 h22" stroke="#E2BA83" strokeWidth="1.5" opacity="0.65" /></G>
          <G transform="translate(12 121)"><Path d="M0 28 Q8 5 17 28 Z" fill="#647A64" /><Ellipse cx="8" cy="5" rx="5" ry="12" fill="#86A277" transform="rotate(-20 8 5)" /><Ellipse cx="18" cy="8" rx="5" ry="13" fill="#78986F" transform="rotate(25 18 8)" /><Rect x="34" y="10" width="42" height="17" rx="2" fill="#D1B57C" /></G>
        </G>

        <Path d="M205 0 V118" stroke="#182928" strokeWidth="4" />
        <Path d="M174 116 Q205 102 236 116 L228 145 Q205 155 182 145 Z" fill="#687567" stroke="#263834" strokeWidth="2" />
        <Ellipse cx="205" cy="156" rx="85" ry="72" fill="url(#lampGlow)" />
        <Circle cx="205" cy="136" r="12" fill="#F4D188" /><Circle cx="201" cy="132" r="4" fill="#FFF4C2" opacity="0.8" />

        <G transform="translate(49 354)">
          <Path d="M0 8 Q50 -4 101 7 L97 101 Q49 113 3 99 Z" fill="#243735" stroke="#9A7957" strokeWidth="4" />
          <Path d="M12 21 Q49 13 88 20" stroke="#C99E69" strokeWidth="3" />
          <Path d="M18 35 l25 19 l42 -34 M19 81 l25 -18 l41 19" stroke="#687A6D" strokeWidth="2" opacity="0.7" />
          <Path d="M51 3 v103" stroke="#8B6C50" strokeWidth="3" opacity="0.7" />
          <Circle cx="27" cy="30" r="4" fill="#D3B378" /><Circle cx="76" cy="78" r="4" fill="#D3B378" />
        </G>

        <G>
          <Path d="M249 477 Q311 468 377 477 L373 491 Q312 501 253 492 Z" fill="#6B4B37" stroke="#243330" strokeWidth="2" />
          <Path d="M255 477 Q312 470 371 477" stroke="#B1845B" strokeWidth="4" fill="none" strokeLinecap="round" />
        </G>

        <Path d="M0 522 Q190 505 390 526 V844 H0 Z" fill="url(#insideFloor)" />
        {[558, 618, 685, 760].map((y) => <Path key={y} d={`M0 ${y} Q195 ${y - 20} 390 ${y + 2}`} stroke="#382E29" strokeWidth="2" opacity="0.38" fill="none" />)}
        <Path d="M76 561 L91 844 M195 532 L196 844 M312 555 L296 844" stroke="#392F2A" strokeWidth="2" opacity="0.32" />
        <Ellipse cx="198" cy="747" rx="141" ry="78" fill="#2C332E" opacity="0.22" />
        <Path d="M61 685 Q193 644 331 686 L307 819 Q196 846 79 810 Z" fill="url(#rug)" stroke="#31473F" strokeWidth="2" />
        <Path d="M86 706 Q194 675 307 706 M81 779 Q194 809 313 778" stroke="#A7A77A" strokeWidth="2" opacity="0.42" fill="none" />
        <Path d="M115 681 Q194 729 276 682 M105 815 Q194 763 288 816" stroke="#C2A06E" strokeWidth="2" opacity="0.28" fill="none" />

        <Ellipse cx="198" cy="652" rx="153" ry="34" fill="#251E1A" opacity="0.3" />
        <Path d="M47 539 Q194 505 345 541 L326 659 Q197 691 64 655 Z" fill="url(#deskWood)" stroke="#49372E" strokeWidth="4" />
        <Path d="M64 654 L77 784 L99 784 L112 663 M283 663 L293 785 L315 785 L327 655" fill="#5A4032" stroke="#3C302A" strokeWidth="3" />
        <Path d="M66 558 Q193 530 326 558" stroke="#D0A074" strokeWidth="2" opacity="0.34" fill="none" />
        <Path d="M81 608 Q189 583 310 607" stroke="#5B4032" strokeWidth="1.4" opacity="0.5" fill="none" />

        <G>
          <Path d="M115 550 Q156 530 196 547 L193 631 Q154 615 116 633 Z" fill="url(#paper)" stroke="#A89A78" strokeWidth="1.5" />
          <Path d="M196 547 Q237 530 277 551 L274 633 Q235 615 193 631 Z" fill="#F1E8CD" stroke="#A89A78" strokeWidth="1.5" />
          <Path d="M195 548 V629" stroke="#BDB08B" strokeWidth="2" />
          <G stroke="#9A927C" strokeWidth="1" opacity="0.62"><Path d="M130 570 q22 -6 47 -2 M130 582 q24 -5 47 -1 M130 594 q18 -4 38 -1 M211 569 q23 -5 46 -1 M211 582 q25 -4 48 0 M211 595 q19 -3 40 0" /></G>
          <Path d="M244 530 L256 612" stroke="#506558" strokeWidth="5" strokeLinecap="round" /><Path d="M243 527 l5 -8 l7 7 l-10 6" fill="#D9B46F" />
        </G>
        <G transform="translate(76 557)"><Ellipse cx="22" cy="43" rx="23" ry="8" fill="#2B2824" opacity="0.22" /><Path d="M3 3 Q22 -3 42 4 L38 39 Q21 48 6 39 Z" fill="#B67155" stroke="#533F34" strokeWidth="2" /><Path d="M42 10 q20 2 13 19 q-6 9 -16 5" stroke="#B67155" strokeWidth="7" fill="none" /><Ellipse cx="22" cy="4" rx="19" ry="5" fill="#F0D39B" opacity="0.8" /></G>
        <G transform="translate(292 478)"><Path d="M10 83 V30" stroke="#5A4435" strokeWidth="5" /><Path d="M-8 32 Q10 9 29 32 Z" fill="#C27A50" stroke="#5C4638" strokeWidth="2" /><Ellipse cx="10" cy="34" rx="42" ry="36" fill="url(#lampGlow)" /><Circle cx="10" cy="31" r="7" fill="#F4D28A" /></G>

        <G transform="translate(20 580)">
          <Path d="M0 42 q16 -38 34 0 v67 H0 Z" fill="#405B50" stroke="#263B35" strokeWidth="2" />
          <Ellipse cx="7" cy="17" rx="9" ry="24" fill="#75966D" transform="rotate(-31 7 17)" /><Ellipse cx="29" cy="13" rx="9" ry="26" fill="#6B8E66" transform="rotate(28 29 13)" /><Ellipse cx="18" cy="4" rx="8" ry="22" fill="#86A179" />
        </G>
        <Rect width="390" height="844" fill="url(#roomLight)" pointerEvents="none" />
        <Path d="M0 0 H390 V844 H0 Z" stroke="#112220" strokeWidth="18" opacity="0.12" fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { flex: 1, overflow: 'hidden', backgroundColor: '#243638' } });
