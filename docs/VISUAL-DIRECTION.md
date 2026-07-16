# MindShed visual direction

## The target

MindShed should feel like a quiet, beautifully art-directed 2D animated series
made for adults: warm, tactile and characterful, but never babyish. The garden,
shed and Bramble should belong to the same illustrated world as the product UI.

The app palette is the source of truth: deep blue-green, warm parchment, muted
moss, clay and restrained honey light. Shapes can be soft, but composition,
lighting and movement should feel deliberate and cinematic.

## What this is not

- Not photorealistic, 3D-rendered, painterly-realistic or AI concept art
- Not chibi, sticker-like, nursery illustration or generic wellness clip-art
- Not an environment assembled from React Native rectangles and paths
- Not a raster background with invisible touch zones placed over it
- Not a constantly bouncing virtual pet that demands attention

Raster image generation is not the production route for these core scenes. It
cannot provide the reusable layers, consistent character model, interaction
anchors or animation rig the app needs.

## Production route

1. Lock a hand-authored Bramble model sheet: front, side and three-quarter views,
   standing and curled poses, expressions, palette and line treatment.
2. Build Bramble as a deformable vector rig in Rive using the contract in
   `docs/BRAMBLE-RIG.md`.
3. Illustrate the garden and shed as layered vector scenes in the same hand, with
   separate foreground, midground, background, light, weather and prop layers.
4. Import those layers into Rive and add slow environmental loops, camera-safe
   compositions and named interaction anchors.
5. Review the real `.riv` exports inside the iOS and Android layouts before the
   SVG development fallbacks are removed.

## Bramble

Bramble is a small woodland hedgehog with a confident, recognisable silhouette
rather than a round plush-toy body. Keep the eyes small and expressive, the
snout readable, the feet grounded, and the layered cocoa quill coat distinct
from the warm russet face and cream belly. Bramble has no visible tail. Use
restrained facial acting, held poses, gaze and weight shifts instead of
exaggerated squash-and-bounce.

The canonical view is a low four-legged side profile with one visible eye. The
face grows naturally out of the quill mass; Bramble must never be constructed
as an upright belly circle, a biped, or a mouse wearing a separate spiky shell.

The personality is attentive and quietly companionable. Bramble may notice,
listen, wander, settle, help plant, carry a pencil and sleep; Bramble must never
look hungry, abandoned, disappointed or needy.

## Garden and shed

Both locations are places the user enters, not decorative headers behind UI.

- The garden owns the Home canvas. The daily plan is a compact floating control
  and expands only when requested.
- The shed owns the Journal canvas. Writing is a compact floating control and
  expands into a sheet only when requested.
- Important props use authored anchors: shed door, bench, pond, flower bed,
  journal desk, window and Bramble resting point.
- Movement is sparse: leaf response, water shimmer, cloud drift, lamplight,
  weather and occasional wildlife. Long still moments are intentional.
- Text and controls live in native UI layers for accessibility; art and character
  interaction live in Rive.

## Acceptance bar

- The garden, shed and Bramble visibly share one illustrator and one palette.
- Bramble reads clearly at 56 px and remains appealing at hero scale.
- No generated photoreal assets or old mascot vectors are used.
- Scene interaction starts within 100 ms and preserves native screen-reader paths.
- Reduced Motion holds key poses and removes parallax, wandering and large scale
  changes.
- Representative iOS and Android devices sustain the target frame rate.
