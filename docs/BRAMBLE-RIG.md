# Bramble — production Rive specification

This is the production contract for the interactive 2D companion. The React
Native SVG remains a fallback and design-development reference; it is not the
final animation asset.

## Quality bar

Bramble should feel like a restrained character from a premium animated TV
short: clear silhouette, believable weight, expressive gaze, held poses,
anticipation, overlapping motion and quiet secondary acting. Constant whole-body
bobbing is not sufficient.

Rive is the runtime, not the art direction. Final quality requires a character
illustrator and an animator (or equivalent dedicated production time).

## Production gates

1. **Character model lock** — front, side and three-quarter turnaround; standing
   and curled proportions; palette; line weight; paws, ears, muzzle and the
   distinctive curled tail silhouette.
2. **Expression lock** — five mood poses plus blink, squint, listening, concern,
   relief, small smile and celebration.
3. **Motion test** — idle → notice → walk → user pet → curl → uncurl. Review this
   in the app at actual phone size before producing the complete library.
4. **Context test** — plant an object, breathe on the bench and sleep inside the
   shed using the same rig.
5. **Performance/accessibility** — profile on iOS and Android; provide a
   reduced-motion state with held poses and fades.

## Artboard and rig

Artboard: `Bramble`, 420 × 320, transparent.

Layer groups:

| Group | Contents |
| --- | --- |
| `tail-back`, `tail-tip` | Large deformable tail with 3–4 secondary-motion controls and an independently posing tip |
| `body` | Main torso mesh, squash control and breathing control |
| `head` | Head/cheek mesh with independent rotation |
| `muzzle`, `nose` | Sniff and direction acting |
| `ear-l`, `ear-r` | Leaf-shaped ears with follow-through and alert poses |
| `eye-l`, `eye-r`, `pupil-l`, `pupil-r` | Blink, gaze targets and expression blends |
| `brow-l`, `brow-r`, `mouth` | Mood and speechless acting poses |
| `leg-fl`, `leg-fr`, `leg-bl`, `leg-br` | Four-bone walk/plant/carry controls |
| `shadow` | Contact, lift and squash feedback |
| `prop-anchor-mouth`, `prop-anchor-paws` | Umbrella, pencil, leaf and wheelbarrow attachment points |

Use a small bone hierarchy with mesh weights. The body, head, paws and tail
masses must not be animated only through top-level transforms.

## Animation library

### Ambient

- `idle-look`, `idle-sniff`, `idle-ear`, `idle-settle` — weighted random variants
- `listen` — quiet held pose with gaze target
- `wander-walk` — reusable locomotion cycle with planted feet
- `curl`, `curled-hold`, `uncurl`
- `sleep`, `wake`
- `breathe` — calm 4s-in / 4s-out body and tail deformation

### One-shots

- `greet`, `notice-ui`, `notice-object`
- `pet-receive` — follows a drag/stroke input, then settles
- `plant`, `carry-wheelbarrow`, `water-flower`
- `celebrate-small`, `celebrate-bloom`
- `umbrella-open`, `rain-shake`
- `pick-up-pencil`, `present-notebook`

Every one-shot includes anticipation, action, settle and an interrupt-safe exit.

## State machine — `BrambleSM`

| Input | Type | Meaning |
| --- | --- | --- |
| `mood` | Number 1–5 | Face/body energy blend |
| `energy` | Number 0–1 | Locomotion and idle intensity |
| `context` | Number 0–6 | Home, check-in, insights, breathe, journal, places, onboarding |
| `gazeX`, `gazeY` | Number | Screen/object attention target |
| `petX`, `petY` | Number | User stroke position |
| `reduceMotion` | Bool | Held-pose/fade-only accessibility path |
| `asleep`, `breathing`, `listening`, `wandering`, `raining` | Bool | Ambient modes |
| `planting`, `notice`, `celebrate`, `greet`, `tapped`, `petted`, `curl` | Trigger | Contextual one-shots |

Ambient modes are mutually exclusive. One-shots return to the current ambient
state and must be safely interruptible.

## Garden artboard — `Garden`

Artboard: 390 × 844 with named safe areas for compact Home and full quiet mode.
Nested Bramble waypoints: shed door, path, flower bed, bench, pond and foreground.

Inputs:

- `growth` 0–32
- `weather` clear/cloud/rain
- `timeOfDay` morning/day/dusk/night
- `season` spring/summer/autumn/winter
- booleans for feeder, lantern, wheelbarrow and future unlocks
- `destination` waypoint number
- `reduceMotion`

Environment loops include cloud drift, leaf movement, water shimmer, window
light, rain and occasional wildlife. Use weighted timing and long held periods;
the entire screen must never feel continuously busy.

## Runtime wiring

Export `apps/mobile/assets/rive/bramble.riv` only after the motion test passes.
The app’s `CompanionState` values remain the screen-level contract. The Rive
adapter maps them to state-machine inputs and provides the SVG fallback on web
or unsupported development builds.

## Acceptance checklist

- Recognisable as the same woodland hedgehog at 56 px
- Feet feel planted during the walk cycle
- Eyes lead head/body attention
- Curl and uncurl preserve volume
- Five idle minutes do not visibly loop in a mechanical pattern
- Touch feedback begins within 100 ms
- No guilt, hunger, impatience or neglect animation
- Reduced Motion removes wandering, bounce and large scaling
- 60 fps target on representative iOS and Android pilot devices
