import { Circle, Defs, Ellipse, G, LinearGradient, Line, Path, Rect, Stop } from 'react-native-svg';

export function ShedExterior({ dusk = false, habitatComplete = false }: { dusk?: boolean; habitatComplete?: boolean }) {
  return (
    <G aria-label="Bramble's round-roof garden studio">
      <Defs>
        <LinearGradient id="newShedWall" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#C77C55" /><Stop offset="0.62" stopColor="#A95545" /><Stop offset="1" stopColor="#74413F" /></LinearGradient>
        <LinearGradient id="newShedRoof" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#47645A" /><Stop offset="1" stopColor="#263F3A" /></LinearGradient>
        <LinearGradient id="newShedGlass" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFF0B0" /><Stop offset="1" stopColor="#E4A85E" /></LinearGradient>
      </Defs>

      <Ellipse cx="291" cy="345" rx="101" ry="19" fill="#29443B" opacity="0.17" />

      {/* A side-on garden studio with one readable barrel roof. */}
      <Path d="M211 181 Q211 163 229 163 H348 Q366 163 366 181 V334 H211 Z" fill="url(#newShedWall)" stroke="#34453F" strokeWidth="2.8" />
      <Path d="M366 181 L384 191 V319 L366 334 Z" fill="#6C3E3B" stroke="#34453F" strokeWidth="2.6" />

      {/* A solid barrel cap: the previous arch-band left a sky-filled hole and read as a handle. */}
      <Path d="M199 184 C204 145 222 121 253 110 C274 102 320 102 341 112 C363 123 376 145 381 174 L365 191 C322 179 266 177 215 194 Z" fill="url(#newShedRoof)" stroke="#2D403A" strokeWidth="3" strokeLinejoin="round" />
      <Path d="M365 191 L381 174 L386 185 L384 207 L366 216 Z" fill="#213A35" stroke="#2D403A" strokeWidth="2.4" strokeLinejoin="round" />
      <G fill="none" stroke="#6E8374" strokeLinecap="round" opacity="0.52">
        <Path d="M216 174 C222 146 237 124 258 114" strokeWidth="2" />
        <Path d="M247 178 C250 141 261 118 278 107" strokeWidth="1.8" />
        <Path d="M285 178 C286 140 291 115 300 105" strokeWidth="1.8" />
        <Path d="M325 181 C324 143 319 119 313 107" strokeWidth="1.8" />
        <Path d="M357 185 C352 149 342 126 329 111" strokeWidth="2" />
      </G>
      <Path d="M211 169 C226 127 252 111 287 108 C326 105 354 124 371 163" stroke="#8A9B87" strokeWidth="2.2" opacity="0.5" fill="none" strokeLinecap="round" />
      <Path d="M203 184 C253 171 313 174 365 191" stroke="#1F3732" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Vertical timber makes the form distinct from the previous gabled shed. */}
      {[231, 255, 279, 303, 327, 350].map((x) => <Line key={x} x1={x} y1="168" x2={x} y2="333" stroke="#7C3E3B" strokeWidth="1.3" opacity="0.36" />)}

      <Circle cx="258" cy="229" r="29" fill="#4A3B36" stroke="#303F3B" strokeWidth="3" />
      <Circle cx="258" cy="229" r="23" fill="url(#newShedGlass)" />
      <Path d="M235 229 H281 M258 206 V252" stroke="#5E493B" strokeWidth="2.4" />
      <Circle cx="249" cy="219" r="18" fill="#FFF4C8" opacity={dusk ? 0.22 : 0.08} />

      <Path d="M307 334 V229 Q307 207 329 207 Q351 207 351 229 V334 Z" fill="#213B35" stroke="#303F3B" strokeWidth="3" />
      <Path d="M314 328 V232 Q314 216 329 216 Q344 216 344 232 V328 Z" fill="#315047" />
      <Path d="M318 227 Q334 239 341 263" stroke="#CFA55E" strokeWidth="3" opacity={dusk ? 0.68 : 0.38} fill="none" />
      <Circle cx="339" cy="276" r="3.6" fill="#F0CA78" />
      <Path d="M297 337 H362 M303 344 H368" stroke="#B9875D" strokeWidth="5" strokeLinecap="round" />

      <Path d="M202 333 Q224 307 247 329 Q269 305 292 330 Q315 307 341 329 Q361 312 378 332 Q345 355 291 357 Q234 356 202 333 Z" fill="#477052" />
      <Path d="M211 332 Q231 317 250 334 Q271 318 293 334 Q315 318 338 334 Q356 322 370 333" stroke="#7D9C6E" strokeWidth="10" fill="none" strokeLinecap="round" />

      {habitatComplete && <G aria-label="Living roof and habitat wall">
        <Path d="M212 154 Q237 127 264 129 Q289 116 316 130 Q339 123 361 149" stroke="#668A61" strokeWidth="11" fill="none" strokeLinecap="round" />
        <G fill="#88A875"><Ellipse cx="234" cy="140" rx="10" ry="5" /><Ellipse cx="278" cy="126" rx="11" ry="5" /><Ellipse cx="334" cy="137" rx="12" ry="5" /></G>
        <Path d="M218 305 Q204 281 216 256 Q229 236 226 213 M216 279 Q232 275 237 261" stroke="#4C7654" strokeWidth="3" fill="none" strokeLinecap="round" />
        <G fill="#7EA06E"><Ellipse cx="217" cy="258" rx="9" ry="4" transform="rotate(-25 217 258)" /><Ellipse cx="218" cy="281" rx="9" ry="4" transform="rotate(25 218 281)" /></G>
        <Rect x="373" y="274" width="15" height="39" rx="3" fill="#9A714D" stroke="#4B4038" strokeWidth="1.5" />
        <Circle cx="378" cy="285" r="1.8" fill="#314A40" /><Circle cx="383" cy="294" r="2" fill="#314A40" /><Circle cx="378" cy="304" r="1.6" fill="#314A40" />
      </G>}
    </G>
  );
}
