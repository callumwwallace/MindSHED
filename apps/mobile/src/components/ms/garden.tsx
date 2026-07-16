import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { MS } from '@/constants/mindshed';
import type { GardenRestStateId } from '@/lib/garden-progress';
import { ShedExterior } from './shed-exterior';

export const GARDEN_HOTSPOTS = {
  shed: { left: '77%' as const, top: '24%' as const, width: '16%' as const, height: '17%' as const },
  bench: { left: '3%' as const, top: '39%' as const, width: '35%' as const, height: '14%' as const },
  pond: { left: '65%' as const, top: '40%' as const, width: '35%' as const, height: '17%' as const },
} as const;

interface GardenProps {
  growth: number;
  mode?: 'home' | 'quiet';
  weather?: 'clear' | 'cloud' | 'rain';
  restState?: GardenRestStateId;
  timeOfDay?: 'auto' | 'day' | 'dusk';
}

function Leaves({ resting }: { resting: boolean }) {
  const dark = resting ? '#677B63' : '#53795B';
  const mid = resting ? '#788B6B' : '#71956A';
  const light = resting ? '#8F9D79' : '#91AE79';
  return (
    <G>
      <Path d="M127 321 C119 273 126 229 145 192 C159 165 166 137 165 112" stroke="#76543F" strokeWidth="10" fill="none" strokeLinecap="round" />
      <Path d="M144 226 C119 207 104 179 95 151 M148 207 C174 188 192 163 205 133 M156 169 C133 145 127 119 129 91" stroke="#76543F" strokeWidth="6" fill="none" strokeLinecap="round" />
      <G fill={dark}>
        <Path d="M70 159 C68 120 103 91 141 105 C161 72 217 82 222 124 C251 127 257 170 229 184 C213 210 174 210 157 192 C124 210 82 195 70 159 Z" />
      </G>
      <G fill={mid}>
        <Ellipse cx="92" cy="130" rx="25" ry="22" transform="rotate(-18 92 130)" />
        <Ellipse cx="119" cy="111" rx="29" ry="24" transform="rotate(-8 119 111)" />
        <Ellipse cx="154" cy="104" rx="31" ry="25" transform="rotate(8 154 104)" />
        <Ellipse cx="190" cy="119" rx="30" ry="24" transform="rotate(18 190 119)" />
        <Ellipse cx="207" cy="148" rx="29" ry="23" transform="rotate(20 207 148)" />
        <Ellipse cx="108" cy="161" rx="32" ry="24" transform="rotate(8 108 161)" />
        <Ellipse cx="148" cy="173" rx="34" ry="24" transform="rotate(-3 148 173)" />
        <Ellipse cx="184" cy="169" rx="31" ry="24" transform="rotate(-13 184 169)" />
      </G>
      <G fill={light} opacity="0.88">
        <Ellipse cx="101" cy="119" rx="13" ry="7" transform="rotate(-24 101 119)" />
        <Ellipse cx="151" cy="92" rx="15" ry="8" transform="rotate(13 151 92)" />
        <Ellipse cx="198" cy="125" rx="14" ry="7" transform="rotate(29 198 125)" />
        <Ellipse cx="126" cy="157" rx="16" ry="8" transform="rotate(-11 126 157)" />
        <Ellipse cx="178" cy="157" rx="14" ry="7" transform="rotate(18 178 157)" />
      </G>
      <G fill="none" stroke="#B5C691" strokeLinecap="round" strokeWidth="2" opacity="0.32">
        <Path d="M83 142 q11 -11 22 -13 M131 121 q13 -12 28 -11 M169 139 q14 -9 26 -6 M122 179 q14 -8 29 -5" />
      </G>
      <Path d="M154 199 q18 18 15 43" stroke="#4D6E53" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.65" />
    </G>
  );
}

export function Garden({
  growth,
  mode = 'home',
  weather = 'clear',
  restState = 'bright',
  timeOfDay = 'auto',
}: GardenProps) {
  const hour = new Date().getHours();
  const dusk = timeOfDay === 'dusk' || (timeOfDay === 'auto' && (hour >= 18 || hour < 7));
  const resting = restState === 'resting';
  const quiet = restState === 'quiet';
  const viewBox = mode === 'home' ? '0 145 390 285' : '0 0 390 844';
  const skyTop = dusk ? '#6F8290' : resting ? '#AABFBC' : quiet ? '#BAD2CF' : '#C6E5E1';
  const skyBottom = dusk ? '#C9B89A' : resting ? '#D8D8BD' : '#F1E8C4';
  const lawnTop = resting ? '#96A982' : quiet ? '#A5BC8D' : '#B5D09A';
  const lawnBottom = resting ? '#6B8367' : '#73936A';

  return (
    <View style={styles.scene}>
      <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="gardenSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={skyTop} />
            <Stop offset="1" stopColor={skyBottom} />
          </LinearGradient>
          <LinearGradient id="gardenLawn" x1="0" y1="0" x2="0.15" y2="1">
            <Stop offset="0" stopColor={lawnTop} />
            <Stop offset="0.55" stopColor={resting ? '#829871' : '#91AD79'} />
            <Stop offset="1" stopColor={lawnBottom} />
          </LinearGradient>
          <LinearGradient id="gardenPath" x1="0" y1="0" x2="0.2" y2="1">
            <Stop offset="0" stopColor="#D9C89E" />
            <Stop offset="0.55" stopColor="#C6AE82" />
            <Stop offset="1" stopColor="#A98B68" />
          </LinearGradient>
          <LinearGradient id="gardenWater" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={resting ? '#8AA9A7' : '#A7D3CB'} />
            <Stop offset="0.58" stopColor={resting ? '#678988' : '#77ABA6'} />
            <Stop offset="1" stopColor="#466F70" />
          </LinearGradient>
          <LinearGradient id="gardenBank" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#B7C58E" />
            <Stop offset="1" stopColor="#6D8865" />
          </LinearGradient>
          <LinearGradient id="foregroundShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#355C4B" stopOpacity="0" />
            <Stop offset="1" stopColor="#294B40" stopOpacity="0.24" />
          </LinearGradient>
          <RadialGradient id="gardenLamp" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFE9A6" stopOpacity={dusk ? 0.92 : 0.46} />
            <Stop offset="1" stopColor="#FFE9A6" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Atmospheric background. */}
        <Rect width="390" height="844" fill="url(#gardenSky)" />
        <Circle cx="61" cy="77" r="25" fill={dusk ? '#EFC78E' : '#EED47C'} opacity="0.9" />
        <G fill="#FFFDF3" opacity={weather === 'rain' ? 0.38 : 0.66}>
          <Path d="M92 91 C102 72 126 72 137 87 C151 74 178 79 182 96 C161 103 118 104 92 91 Z" />
          {weather !== 'clear' && <Path d="M271 116 C282 94 310 93 321 109 C339 97 366 107 367 124 C338 130 299 130 271 116 Z" />}
        </G>
        <Path d="M-25 254 C25 205 76 195 119 228 C155 187 210 189 246 230 C288 189 348 196 418 246 L418 347 L-25 347 Z" fill={dusk ? '#5D7775' : '#759890'} />
        <Path d="M-30 296 C42 240 106 244 149 278 C205 232 272 240 311 279 C347 247 387 250 426 273 L426 370 L-30 370 Z" fill={dusk ? '#6E8377' : '#91AA8D'} />
        <Path d="M-25 340 C70 291 151 311 212 338 C283 371 345 315 420 314 L420 396 L-25 396 Z" fill={resting ? '#9EAD87' : '#B8CA98'} />
        <G stroke="#6D7E65" strokeWidth="2" opacity="0.34">
          <Path d="M0 321 Q48 304 96 319 M13 330 v20 M54 316 v24 M91 319 v22" />
          <Path d="M178 330 Q223 317 264 331 M190 327 v23 M231 324 v24" />
        </G>

        {/* The ground uses one perspective system: distant compression, widening foreground. */}
        <Path d="M-20 352 C77 313 170 325 229 355 C290 386 354 340 420 336 L420 870 L-20 870 Z" fill="url(#gardenLawn)" />
        <Path d="M331 324 C307 372 306 426 323 481 C346 558 337 650 289 844 H390 C361 741 370 641 386 548 C402 448 383 365 351 322 Z" fill="#806E58" opacity="0.17" />
        <Path d="M326 322 C306 377 310 431 329 489 C351 560 340 653 287 844 H369 C347 745 354 648 368 552 C384 448 369 368 345 322 Z" fill="url(#gardenPath)" />
        <Path d="M337 339 C324 397 328 450 344 503 C362 570 350 653 318 764" fill="none" stroke="#F1E1BA" strokeLinecap="round" strokeWidth="2" opacity="0.6" />
        <Path d="M352 385 C363 455 371 509 357 575" fill="none" stroke="#8C725A" strokeLinecap="round" strokeWidth="1.3" opacity="0.36" />

        {/* The bench spur visibly joins the main route before passing behind the pond bank. */}
        <Path d="M334 482 C274 477 205 458 112 421" fill="none" stroke="#6D6854" strokeWidth="25" strokeLinecap="round" opacity="0.14" />
        <Path d="M334 477 C272 473 204 454 113 417" fill="none" stroke="#C6B287" strokeWidth="20" strokeLinecap="round" opacity="0.84" />
        <Path d="M332 474 C269 470 202 451 116 417" fill="none" stroke="#E6D7AE" strokeWidth="2" strokeLinecap="round" opacity="0.62" />

        {/* A widening branch gives the foreground gate a physical route to the shed path. */}
        <Path d="M61 738 C126 681 218 632 343 552 L363 574 C232 653 145 704 80 754 Z" fill="#6D6854" opacity="0.14" />
        <Path d="M66 731 C132 678 220 633 347 557 L358 571 C230 647 145 698 77 746 Z" fill="#C2AF84" opacity="0.86" />
        <Path d="M76 730 C141 680 225 636 350 562" fill="none" stroke="#E5D5AA" strokeWidth="2" strokeLinecap="round" opacity="0.62" />
        <G fill="#CFC197" stroke="#8F8065" strokeWidth="0.8" opacity="0.9">
          <Ellipse cx="111" cy="692" rx="9" ry="4" transform="rotate(-25 111 692)" />
          <Ellipse cx="163" cy="660" rx="8" ry="3.6" transform="rotate(-22 163 660)" />
          <Ellipse cx="220" cy="627" rx="7" ry="3" transform="rotate(-24 220 627)" />
          <Ellipse cx="279" cy="593" rx="6" ry="2.7" transform="rotate(-25 279 593)" />
        </G>

        {/* Permanent ground detail connects the large destinations into one habitat. */}
        <G fill="none" strokeLinecap="round" opacity={resting ? 0.46 : 0.66}>
          <G stroke="#527454" strokeWidth="1.8">
            <Path d="M157 380 q-4 -13 -10 -18 M157 380 q3 -15 9 -21 M183 417 q-2 -11 -8 -18 M183 417 q5 -12 12 -17 M73 553 q-4 -15 -11 -21 M73 553 q4 -13 11 -19 M225 530 q-2 -13 -8 -20 M225 530 q5 -12 12 -17" />
          </G>
          <G fill="#E6D49A" stroke="none">
            <Circle cx="146" cy="362" r="2.5" /><Circle cx="166" cy="359" r="2.2" /><Circle cx="175" cy="399" r="2.3" /><Circle cx="195" cy="400" r="2.1" />
          </G>
          <G fill="#6F9166" stroke="none">
            <Ellipse cx="62" cy="531" rx="7" ry="3" transform="rotate(-24 62 531)" /><Ellipse cx="84" cy="534" rx="7" ry="3" transform="rotate(24 84 534)" />
            <Ellipse cx="215" cy="510" rx="7" ry="3" transform="rotate(-24 215 510)" /><Ellipse cx="237" cy="513" rx="7" ry="3" transform="rotate(24 237 513)" />
          </G>
        </G>

        {/* A mature canopy frames the shed and prevents the skyline becoming a row of icons. */}
        <G transform="translate(-8 42)"><Leaves resting={resting} /></G>

        <ShedExterior dusk={dusk} habitatComplete={growth >= 18} />

        {/* Bench: back, seat and legs share one three-quarter perspective. */}
        <G aria-label="Curved timber garden bench" transform="translate(17 348)">
          <Ellipse cx="61" cy="78" rx="58" ry="9" fill="#315343" opacity="0.2" />
          <Path d="M5 21 C34 3 70 3 103 17 L100 29 C69 18 36 18 8 34 Z" fill="#8B6047" stroke="#493B35" strokeWidth="2.2" />
          <Path d="M11 46 C37 34 69 34 97 44 L90 58 C64 50 39 51 15 62 Z" fill="#76513F" stroke="#403734" strokeWidth="2.2" />
          <Path d="M15 62 C39 53 65 53 90 59 L85 65 C62 60 40 61 19 68 Z" fill="#A87552" stroke="#493B35" strokeWidth="1.7" />
          <Path d="M22 63 L18 78 M82 62 L88 76" stroke="#403734" strokeWidth="4.5" strokeLinecap="round" />
          <Path d="M12 31 C40 20 70 20 98 28 M19 57 C41 49 65 48 88 54" fill="none" stroke="#C79163" strokeWidth="1.7" opacity="0.68" />
          <Path d="M13 46 q2 -13 11 -18 M94 44 q1 -10 -4 -16" fill="none" stroke="#493B35" strokeWidth="3" strokeLinecap="round" />
        </G>

        {/* Organic pond bank and water share the same ground plane. */}
        <G aria-label="Garden pond">
          <Path d="M238 388 C250 354 281 337 328 340 C380 343 412 369 417 404 C395 438 362 453 315 447 C272 443 242 424 238 388 Z" fill="#466B5D" opacity="0.27" />
          <Path d="M244 383 C252 359 273 344 299 344 C315 338 337 343 349 349 C378 347 402 370 408 398 C397 416 381 425 363 426 C348 439 326 438 309 432 C286 435 261 423 253 410 C245 404 241 393 244 383 Z" fill="url(#gardenBank)" stroke="#5B785C" strokeWidth="2" />
          <Path d="M256 384 C264 366 282 354 303 356 C318 350 338 356 349 361 C372 360 391 378 396 398 C384 411 370 417 355 416 C344 424 326 422 314 418 C296 421 278 414 269 406 C260 403 253 394 256 384 Z" fill="url(#gardenWater)" stroke="#3E6A69" strokeWidth="2" />
          <Path d="M277 377 q23 -10 47 -1 M331 406 q24 7 45 -2" fill="none" stroke="#DCECE2" strokeWidth="1.5" strokeLinecap="round" opacity="0.58" />
          <Path d="M268 398 q17 8 35 3" fill="none" stroke="#4F8280" strokeWidth="1.2" opacity="0.7" />
          <G fill="#C6BA8F" stroke="#718065" strokeWidth="1">
            <Ellipse cx="253" cy="371" rx="10" ry="5" transform="rotate(-22 253 371)" />
            <Ellipse cx="277" cy="350" rx="11" ry="5" transform="rotate(-10 277 350)" />
            <Ellipse cx="310" cy="344" rx="10" ry="4.5" />
            <Ellipse cx="345" cy="348" rx="11" ry="5" transform="rotate(9 345 348)" />
            <Ellipse cx="384" cy="365" rx="11" ry="5" transform="rotate(24 384 365)" />
            <Ellipse cx="397" cy="410" rx="10" ry="5" transform="rotate(-18 397 410)" />
            <Ellipse cx="365" cy="432" rx="12" ry="5" transform="rotate(-7 365 432)" />
            <Ellipse cx="327" cy="437" rx="11" ry="5" />
            <Ellipse cx="287" cy="427" rx="11" ry="5" transform="rotate(14 287 427)" />
            <Ellipse cx="258" cy="411" rx="10" ry="5" transform="rotate(24 258 411)" />
          </G>
          <G fill="none" stroke="#3E6A4B" strokeLinecap="round" strokeWidth="2.1">
            <Path d="M251 397 q-5 -27 -2 -44 M258 398 q4 -24 13 -37 M389 397 q-1 -30 6 -50" />
          </G>
          {growth >= 7 && <G>
            <Ellipse cx="304" cy="385" rx="14" ry="7" fill="#759B69" transform="rotate(-8 304 385)" />
            <Path d="M304 385 l8 -7" stroke="#4F7855" strokeWidth="1.4" />
            <Ellipse cx="352" cy="407" rx="12" ry="6" fill="#6E9362" transform="rotate(9 352 407)" />
            <G fill="none" stroke="#3C694A" strokeLinecap="round" strokeWidth="2.4">
              <Path d="M387 393 q-4 -34 2 -57 M397 394 q6 -30 17 -42 M378 395 q-8 -27 -19 -39" />
            </G>
            <Path d="M366 393 q6 -10 12 0 q-6 8 -12 0" fill="#D9BD6F" />
          </G>}
        </G>

        {/* Garden progression grows coherent zones instead of scattering unrelated rewards. */}
        {growth >= 1 && <G aria-label="Meadow edge">
          <Path d="M0 426 C42 388 103 391 149 425 C110 452 50 458 0 442 Z" fill="#507255" opacity="0.94" />
          {[13, 31, 50, 71, 94, 118, 140].map((x, index) => <G key={x} transform={`translate(${x} ${440 - (index % 3) * 5})`}>
            <Path d="M0 0 C-2 -19 -6 -31 -12 -41 M0 0 C4 -20 9 -31 15 -39 M0 0 V-45" stroke={index % 2 ? '#416A4A' : '#365E43'} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <Ellipse cx="-12" cy="-41" rx="7" ry="3.2" fill="#8FA47A" transform="rotate(26 -12 -41)" />
            <Circle cx="15" cy="-39" r="2.8" fill={index % 2 ? '#E7DB9E' : '#D7C17F'} />
          </G>)}
        </G>}

        {growth >= 3 && <G aria-label="Stepping-stone trail">
          {[[329, 361, 13, 6], [331, 405, 15, 7], [339, 456, 18, 8], [344, 516, 21, 9], [338, 588, 25, 11], [321, 674, 30, 13]].map(([x, y, rx, ry], index) => <G key={`${x}-${y}`}>
            <Ellipse cx={x} cy={y + 3} rx={rx} ry={ry} fill="#5B584C" opacity="0.2" />
            <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={index % 2 ? '#C7B991' : '#D6C69B'} stroke="#968765" strokeWidth="1.1" />
            <Path d={`M${x - rx * 0.45} ${y - 1} q${rx * 0.45} -3 ${rx * 0.8} -1`} stroke="#F0E2BC" strokeWidth="1" opacity="0.5" fill="none" />
          </G>)}
        </G>}

        {growth >= 5 && <G aria-label="Bird feeder">
          <Path d="M171 269 V338" stroke="#4F4338" strokeWidth="4" />
          <Path d="M155 281 H187 L182 307 H160 Z" fill="#B77950" stroke="#4B3E36" strokeWidth="1.8" />
          <Path d="M151 281 L171 264 L191 281 Z" fill="#34564A" stroke="#2E463E" strokeWidth="1.6" />
          <Circle cx="171" cy="293" r="4" fill="#E1C276" />
        </G>}

        {growth >= 10 && <G aria-label="Low path lanterns">
          {[[303, 390], [315, 451], [321, 526]].map(([x, y]) => <G key={`${x}-${y}`}>
            <Circle cx={x} cy={y} r={dusk ? 24 : 14} fill="url(#gardenLamp)" />
            <Path d={`M${x} ${y + 7} V${y + 29}`} stroke="#314B43" strokeWidth="3" strokeLinecap="round" />
            <Rect x={x - 6} y={y - 8} width="12" height="17" rx="3.5" fill="#314B43" />
            <Rect x={x - 3.5} y={y - 4} width="7" height="8" rx="1.5" fill="#F1CE79" />
            <Path d={`M${x - 3} ${y - 8} q3 -6 6 0`} stroke="#314B43" strokeWidth="1.4" fill="none" />
          </G>)}
        </G>}

        {growth >= 14 && <G aria-label="Kitchen garden" transform="translate(39 466)">
          <Ellipse cx="67" cy="70" rx="68" ry="11" fill="#2F5142" opacity="0.2" />
          <Path d="M0 23 C37 9 89 9 134 24 L124 66 C82 77 40 77 10 64 Z" fill="#8E5942" stroke="#493A34" strokeWidth="2.5" />
          <Path d="M8 24 C45 14 91 14 126 25 C89 39 47 39 9 31 Z" fill="#3E5F46" />
          <Path d="M16 27 C48 21 87 21 119 27" fill="none" stroke="#71503E" strokeWidth="3" opacity="0.72" strokeLinecap="round" />
          <Path d="M13 40 C50 51 87 51 121 39" fill="none" stroke="#BD8158" strokeWidth="2" opacity="0.62" />
          {[21, 43, 66, 90, 113].map((x, index) => <G key={x} transform={`translate(${x} ${24 - (index % 2) * 3})`}>
            <Path d="M0 0 q-2 -21 1 -36" stroke="#436D4C" strokeWidth="2.2" />
            <Ellipse cx="-7" cy="-21" rx="9" ry="4.4" fill="#75986B" transform="rotate(28 -7 -21)" />
            <Ellipse cx="8" cy="-29" rx="9" ry="4.4" fill="#91AB77" transform="rotate(-28 8 -29)" />
            <Ellipse cx="1" cy="-37" rx="8" ry="4" fill={index % 2 ? '#86A678' : '#6F946B'} transform="rotate(4 1 -37)" />
          </G>)}
          <Path d="M126 21 V-12" stroke="#6D503C" strokeWidth="3" />
          <Path d="M110 -24 C123 -31 139 -29 147 -21 L143 -3 C132 3 119 0 113 -6 Z" fill="#D3B977" stroke="#594A3D" strokeWidth="1.5" />
        </G>}

        {/* The gate is a permanent destination and fills the lower garden with purpose. */}
        <G aria-label="Willow garden gate" transform="translate(9 585)">
          <Ellipse cx="79" cy="148" rx="75" ry="12" fill="#26483C" opacity="0.2" />
          <Path d="M-3 144 C34 133 91 133 141 145 C108 160 37 162 -3 149 Z" fill="#638061" opacity="0.72" />
          <Path d="M13 139 V52 C35 12 91 5 122 48 V139" fill="none" stroke="#5D4739" strokeWidth="11" strokeLinecap="round" />
          <Path d="M21 139 V62 C45 34 84 31 112 60 V139" fill="none" stroke="#927051" strokeWidth="5" />
          <Path d="M27 82 C52 61 83 60 108 80 M26 105 C53 85 83 85 109 103 M26 127 C53 111 82 111 109 126" fill="none" stroke="#7A5A43" strokeWidth="5" strokeLinecap="round" />
          <Path d="M16 68 C-1 47 3 24 17 7 M113 58 C132 35 132 15 124 0" fill="none" stroke="#426A4B" strokeWidth="5" strokeLinecap="round" />
          <G fill="#789B69">
            <Ellipse cx="12" cy="14" rx="13" ry="6" transform="rotate(-26 12 14)" />
            <Ellipse cx="4" cy="38" rx="12" ry="6" transform="rotate(25 4 38)" />
            <Ellipse cx="126" cy="10" rx="13" ry="6" transform="rotate(25 126 10)" />
            <Ellipse cx="131" cy="34" rx="11" ry="5.5" transform="rotate(-20 131 34)" />
          </G>
          <Circle cx="102" cy="96" r="3.6" fill="#D5B36F" stroke="#57483B" strokeWidth="1.3" />
        </G>

        {/* Foreground framing establishes the viewer inside the garden. */}
        <G transform="translate(0 711)">
          <Path d="M0 145 C8 119 23 111 37 128 C48 110 67 113 79 145 Z" fill="#315747" />
          <G fill="none" stroke="#456B52" strokeLinecap="round" strokeWidth="4">
            <Path d="M9 145 Q14 104 20 70 M27 145 Q39 104 53 79 M49 145 Q61 119 75 104" />
          </G>
          <G fill="#6F9165">
            <Ellipse cx="19" cy="72" rx="17" ry="8" transform="rotate(-64 19 72)" />
            <Ellipse cx="51" cy="81" rx="19" ry="9" transform="rotate(-39 51 81)" />
            <Ellipse cx="74" cy="105" rx="17" ry="8" transform="rotate(-23 74 105)" />
          </G>
          <Path d="M390 145 C378 116 362 111 347 127 C335 111 316 117 307 145 Z" fill="#2F5244" />
          <G fill="none" stroke="#436851" strokeLinecap="round" strokeWidth="4">
            <Path d="M380 145 Q374 101 367 69 M358 145 Q347 105 333 82 M335 145 Q323 123 309 109" />
          </G>
          <G fill="#668960">
            <Ellipse cx="367" cy="72" rx="17" ry="8" transform="rotate(62 367 72)" />
            <Ellipse cx="334" cy="84" rx="19" ry="9" transform="rotate(38 334 84)" />
            <Ellipse cx="310" cy="109" rx="16" ry="8" transform="rotate(23 310 109)" />
          </G>
        </G>
        <Rect y="680" width="390" height="164" fill="url(#foregroundShade)" pointerEvents="none" />

        {weather === 'rain' && <G stroke="#789AA1" strokeWidth="1.15" opacity="0.58">
          {[24, 67, 110, 153, 196, 239, 282, 325, 368].map((x) => <G key={x}>
            <Line x1={x} y1="132" x2={x - 7} y2="158" />
            <Line x1={x + 16} y1="196" x2={x + 9} y2="222" />
            <Line x1={x - 9} y1="284" x2={x - 16} y2="310" />
          </G>)}
        </G>}
        {restState !== 'bright' && <Rect width="390" height="844" fill="#3D5552" opacity={resting ? 0.11 : 0.055} pointerEvents="none" />}
      </Svg>
      <View pointerEvents="none" style={[styles.vignette, dusk && styles.dusk]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, backgroundColor: MS.color.skyPale, overflow: 'hidden' },
  vignette: { ...StyleSheet.absoluteFill, borderColor: 'rgba(23,48,39,0.05)', borderWidth: 7 },
  dusk: { backgroundColor: 'rgba(20,31,40,0.035)' },
});
