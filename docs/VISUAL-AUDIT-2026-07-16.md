# MindSHED production visual audit — 16 July 2026

## Scope and baseline

The audit covers the attached 360 × 280 hedgehog reference, every screen that
renders Bramble, the shared garden and shed scenes, the four Places vignettes,
and the requested 390 × 844, 390 × 512 and wide-viewport layouts. Baseline
renders were taken from the Expo web build before art or layout changes.

The reference is being used for anatomical direction only: a low quadruped
silhouette, a face that grows out of the quill mass, a pointed muzzle, short
planted legs and a dense dorsal coat. Its exact shapes are not copied.

## Release-blocking defect inventory

| Area | Defect and visual consequence | Root source |
| --- | --- | --- |
| Canonical Bramble model | The head is a tall near-circle attached in front of the coat. Together with the circular ear and small upright forepaw, the hero reads as a mouse or plush mascot instead of a woodland hedgehog. The exposed fur is split into a belly oval and a separate head mass instead of one low animal body. | `apps/mobile/src/components/ms/bramble.tsx`: `QuillCoat`, the underside path and head group use contradictory silhouettes. |
| Greet pose | The lifted forepaw sits beside the mouth and reads as a human hand/wave. At small sizes it can look like a limb emerging from the face. | `StandingHedgehog` renders a replacement paw path after the head with no visible shoulder/leg continuity. |
| Celebrate pose | Two long raised forelimbs are overlaid after the body and have no believable leg joints or ground/weight response. The gesture is bipedal and changes the character language. | `StandingHedgehog` celebrate-only paths at the head/body boundary. |
| Walk and ground contact | Feet are tiny rounded tabs and the coat hides most leg attachment. Phase changes swap x positions rather than showing planted feet, so the animal appears to slide. Toe marks are drawn for legs that may not be present. | `GroundedLeg`, `rearX`/`midX`/`frontX`, the static shadow and unconditional toe-detail path. |
| Curl and sleep | The curled pose is a second construction with a face capsule placed over the quill ball. The face remains too exposed for sleep and can read as an unrelated nest object at small sizes. | `CurledHedgehog` duplicates the model rather than tucking the same head/body masses. |
| State consistency | Idle, listen, notice, plant and breathe mostly add props or minor head transforms to the same malformed body; greet, celebrate and curl change the silhouette abruptly. Character scale also varies from 52 to 220 without small-size detail control. | `bramble.tsx`, `animated-bramble.tsx`, and screen-local size/position values. |
| Quiet-garden dialogue | The bubble is positioned above the character wrapper using fixed offsets while its side is computed from the full window. In the baseline it points into empty lawn and is visually disconnected from Bramble. | `apps/mobile/src/components/ms/wandering-bramble.tsx`: window-derived waypoints, fixed `top: -64`, and half-character tail offsets. |
| Wide viewport | The app scene is capped at 520 px on web, but Bramble waypoints use the 844 px browser width. Bramble is clipped by the right edge in the 844 × 390 baseline. | `_layout.tsx` max-width container combined with `useWindowDimensions()` in `wandering-bramble.tsx`. |
| Bench card | The crop includes the shed, pond and bench simultaneously, so it is not an authored bench destination. Bramble is placed independently over the crop and has no reliable seat/ground anchor. | `garden.tsx` `FOCUS_VIEWBOX.bench` and absolute overlay in `place-vignette.tsx`. |
| Shed card | The exterior shed-door crop is paired with a sleeping nest, even though the copy says “inside the shed”. The result implies Bramble sleeps outside the door. | `PlaceVignette` always renders `Garden`; the shed variant overlays `SleepingBrambleNest` on the exterior. |
| Gate card | The gate crop is recognisable, but Bramble is independently bottom-aligned and changes apparent scale relative to the gate. | `FOCUS_VIEWBOX.gate` plus fixed `right`/`bottom` overlay. |
| Senses-path card | The crop shows the pond rather than the path destination described by the card. | `FOCUS_VIEWBOX.path = '205 320 185 168'` is centred on the pond; the fixed overlay compounds the mismatch. |
| Breathing setup | Bramble is positioned in a flex spacer rather than at a scene anchor. At 390 × 512 the garden crop moves but the UI overlay does not, leaving Bramble floating above the lawn and detached from the bench. | `apps/mobile/src/app/breathe.tsx` setup overlay and full-scene `Garden` background use unrelated coordinate systems. |
| Breathing active | The orb and Bramble use separate absolute/flex systems; the close control loses visual prominence in the compact render. The character only happens to align with the bench at some heights. | `breathe.tsx` active-state layout and `top: '40%'` Bramble placement. |
| Journal sleep | The nest is correctly associated with the interior but its fixed top position and heavy foreground lip obscure most of the curled character. It needs a shelf/contact anchor and a more recognisable tucked face. | `journal.tsx` `top: height * 0.48` and `sleeping-bramble-nest.tsx` foreground layering. |
| Garden construction | The shed roof is now filled rather than hollow, but the overall scene still mixes a nearly frontal shed with a strongly tapering path. The bench has no connecting spur, the pond remains close to a geometric oval, and the empty kitchen-bed shape reads as a loose container in the middle of the lawn. | Shared paths in `garden.tsx`; destination objects are composed independently rather than around a common ground-plane route network. |
| Garden layering and style | The gate branch crosses the scene as a uniform-width stripe, foliage and reward zones lack consistent contact shadows, and outline weights vary from hairline garden details to very heavy character contours. | `garden.tsx`, `shed-exterior.tsx`, and the character palette/outline constants. |
| Compact composition | The onboarding copy happens to fit at 390 × 512, but it has no explicit compact art size. Places relies on scrolling correctly; breathing uses fixed vertical spacing and is the first collision/floating failure. | Screen-local fixed sizes and margins in `onboarding.tsx`, `places.tsx`, and `breathe.tsx`. |

## Repair strategy

1. Rebuild Bramble around one low side-profile skeleton and shared head, coat,
   belly and four-leg geometry. Poses will deform or reposition those masses;
   greet will use a small weight shift/head lift rather than a wave.
2. Add size-aware detail and a stable viewBox so 56–76 px instances keep their
   muzzle, eye, legs and quill silhouette without detached micro-details.
3. Measure the actual scene container for wandering waypoints and dialogue
   anchoring. Keep the entire character and bubble inside that container.
4. Replace generic garden crops with authored vignettes whose scenery and
   Bramble anchor belong to the same coordinate system, including an interior
   shed card and a true senses-path crop.
5. Rework the garden route network, pond bank, bench contact and foreground
   ordering around a single ground plane; preserve the solid shed roof.
6. Give onboarding, breathing and journal explicit compact layouts and scene
   anchors, then re-render the full matrix before running code checks.

## Known production-art boundary

The code-native SVG remains the required fallback and can be made consistent,
readable and structurally sound. It is not a substitute for the final authored
Rive turnaround, mesh deformation, planted-foot locomotion and production
secondary animation specified in `docs/BRAMBLE-RIG.md`.

## Resolution and verification notes

The code-level release blockers above were addressed in the shared sources:

- Bramble now uses one low side-profile quadruped model for standing, greet,
  walk, listen, notice, plant, celebrate and breathe, plus a recognisably tucked
  version of the same coat/face masses for curl and sleep. Greet is a head and
  weight shift; celebrate retains grounded legs.
- The shared standing head was revised again after close-up review: the former
  closed cheek oval created a swollen, separate “neck” mass. The quill coat now
  overlaps the head root, the brow flows into a lower wedge-shaped muzzle, and
  the cheek tucks beneath the quill line. The same geometry remains legible at
  both the 220 px hero scale and the 72 px state-matrix scale.
- Whole-body idle bobbing was removed from the fallback. Breathing, sleeping and
  walking retain only restrained state-specific motion.
- Wandering waypoints and dialogue placement now measure the actual scene
  container. The 844 × 390 and 520 × 844 renders keep Bramble inside the garden,
  and the speech tail terminates at the coat rather than empty lawn.
- The four Places artworks are now authored destination scenes: an isolated
  connected bench, a shed interior with the sleeping nest on a shelf, a gate
  with an approaching path, and a stepping-stone senses path with no pond.
- The full garden has a bench spur, a tapered gate branch, a less geometric pond
  bank and more legible planted kitchen bed. The existing filled barrel roof was
  preserved and verified in the full home and quiet-garden renders.
- Breathing setup uses a bounded bench scene for its small companion and keeps it
  clear of duration controls at 390 × 512. Active Bramble is anchored to the
  full-scene bench and the exit control remains above animated layers.
- The journal nest is anchored to the interior shelf for normal and compact
  heights. The compact check-in shortens its scene without hiding Bramble or the
  primary action.

Rendered verification covered 390 × 844, 390 × 512, 844 × 390 and 520 × 844;
all ten companion states at 72 px; the 220 px onboarding hero; and the complete
screen/context matrix listed in the request. Before/after files are stored with
the task's visual artifacts rather than committed to the production bundle.
