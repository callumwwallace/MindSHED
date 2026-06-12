# Bramble — Rive rig specification

The single source of truth for building Bramble in the Rive editor
(rive.app — free tier is enough). Built by Callum + Claude. When exported as
`bramble.riv` into `apps/mobile/assets/rive/`, the app switches from the
static SVG placeholder to the living pet with **no screen changes**.

## Getting started (first session, ~45 min)

1. Create a free account at rive.app and open the editor (web or desktop).
2. New file → artboard **"Bramble"**, 300 × 240, transparent background.
3. **Import `docs/design/bramble.svg`** (drag it in) — this is the exact
   character from the app, already in the sticker style. Rive converts it
   to editable vector shapes; group them as below.
4. Save the file in your Rive workspace as **MindSHED / Bramble**.

## Groups & bones

Organise the imported shapes into these groups (Rive: select shapes → G):

| Group | Contents | Why |
| --- | --- | --- |
| `body` | spike dome + brown body shape | whole-pet bob/bounce |
| `face` | face oval, cheeks, nose | mood expressions move as one |
| `eye-l`, `eye-r` | each eye | blinking, mood shapes |
| `mouth` | mouth path | mood expressions |
| `shadow` | ground ellipse | squash during bounces |

No skeleton needed at first — translate/scale/rotate keys on groups are
plenty for v1. (Bones come later if we want walk cycles.)

## Animations (timelines)

| Name | Length | What happens |
| --- | --- | --- |
| `idle` | 4s loop | gentle breathing bob (body y ±2), blink every ~3s (eyes scale-y to 0.1 and back over 6 frames) |
| `greet` | 1.2s one-shot | perk up + happy bounce, shadow squashes |
| `celebrate` | 1.5s one-shot | jump + spin hint, big smile — plays on bloom |
| `curl` | 1s hold | curls toward a ball (anxiety→calm metaphor; used subtly) |
| `sleep` | 4s loop | eyes closed arcs, slow deep bob, optional "z" |
| `breathe` | 8s loop | exaggerated 4s-in / 4s-out bob — syncs with the breathing circle |
| `mood-1`…`mood-5` | 0.5s each | facial poses: teary → sad → neutral → smile → beaming (these become blend targets) |

## State machine — `BrambleSM`

Inputs (exact names matter — the app sets these):

| Input | Type | Driven by |
| --- | --- | --- |
| `mood` | Number (1–5) | today's check-in (face blends between mood poses) |
| `asleep` | Bool | journal screen sets true |
| `breathing` | Bool | breathing screen sets true |
| `celebrate` | Trigger | fired on bloom moment |
| `tapped` | Trigger | Rive listener on `body` (pointer down) → greet reaction |

States: `idle` (default, with mood blend layered on the face) ⇄ `sleep`
(asleep == true) ⇄ `breathe` (breathing == true); `celebrate` and `greet`
are any-state one-shots that return to idle.

## Export & wiring

1. Editor → Export → **.riv (runtime)** → save as
   `apps/mobile/assets/rive/bramble.riv`.
2. The app's `RiveBox` component (`src/components/ms/bramble-rive.tsx`)
   already speaks Rive; switching `Bramble` to it is a ~10-line change:

```tsx
<Rive
  source={require('@/assets/rive/bramble.riv')}
  stateMachineName="BrambleSM"
  autoplay
/>
// riveRef.current?.setInputState('BrambleSM', 'mood', 4);
// riveRef.current?.fireState('BrambleSM', 'celebrate');
```

## Later: the Garden artboard

Same file, second artboard **"Garden"** (390 × 844). State machine
`GardenSM` with Number inputs `growth` (0–8 flowers/objects), `weather`
(0 sunny / 1 cloudy / 2 cosy-rain), `timeOfDay` (0 morning / 1 day /
2 dusk / 3 night). Bramble gets nested into the garden artboard so he can
wander between waypoints (pond, flower bed, shed door). This replaces the
static SVG `Garden` component — but ship the character first.
