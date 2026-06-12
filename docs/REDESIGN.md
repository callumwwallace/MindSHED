# MindSHED Redesign Brief — v1 "September Pilot"

Owners: Callum Wallace & Morag Powell · In partnership with the university
Status: agreed June 2026 · Target: pilot at September term start

## 1. Vision

A wellbeing companion for university students that builds one tiny daily
habit — a 30-second check-in — and turns consistency into something you can
*see*: a hedgehog and its shed-garden world that flourish as you look after
yourself. Warm and playful in character, professional in execution. The old
app's breadth is replaced by one sharp loop done brilliantly.

## 2. Users

- **Pilot**: dental students (high-pressure course, invite codes).
- **Later**: all students at the university, struggling or not.
- Must read as grown-up and appeal across genders — friendly, never childish.

## 3. Core loop (research-backed)

1. **Check in** (~30s): mood / energy / stress. The anchor habit.
2. **Today's plan**: 1–3 small suggested actions (behavioural activation —
   the strongest-evidenced intervention for low mood): a breathing session,
   one self-care activity, an optional reflection prompt.
3. **Pet reward**: the hedgehog reacts, its world grows. Care, never guilt.

Open-ended toolbox apps have the worst engagement evidence; everything in
MindSHED hangs off this loop instead.

## 4. Hero feature: Insights, told through the pet

**Home is a place, not a page.** The home screen IS Bramble's home: a
full-bleed shed-garden scene with the pet living in it. UI floats lightly
on top — date pill up top, a collapsible check-in/plan sheet at the bottom.
You don't open a dashboard; you visit your garden.

The scene is the insight engine — three layers, one place:

| Layer | Meaning | Surface |
| --- | --- | --- |
| **Garden** | Long-term progress | Sustained care grows the garden and unlocks living objects (bird feeder, pond, lanterns). Gently overgrown after time away — never dead |
| **Weather & light** | This week | Scene weather follows the check-in trend (rough weeks = cosy rain, Bramble under a tiny umbrella — never punishing). Time of day matches real time: dim lamplit shed for late-night opens |
| **Bramble + speech** | Today & discoveries | Pet's energy mirrors today; speech bubbles deliver recaps and pattern discoveries |

Every check-in has a visible consequence in the scene within seconds
(a flower blooms, a butterfly arrives) — the 30-second habit is rewarded
visually every single day.

**The garden is the trophy case.** No badge wall: care unlocks scene
objects, and every object is alive (birds actually visit the feeder).

**Pet integration principle: companion, not observer.** Bramble
participates, reacts, or does his own thing nearby — he never spectates
data entry, and his presence is rationed so each appearance means
something. Per screen:
- *Check-in*: Bramble at the top **mirrors the mood you pick, live** —
  the mood-mirror made tactile. Copy: "he doesn't judge".
- *Today's plan*: Bramble carts the day's tasks in a **wheelbarrow**;
  each completed task is something he **plants in the garden** (ties the
  plan to visible scene growth).
- *Insights*: the tab IS **"Bramble's notebook"** — spiral-bound pages,
  hand-annotated chart ("best day!"), and he presents discovered patterns
  in his own voice, holding a pencil.
- *Breathing*: sit with Bramble on **the bench** at dusk; the scene dims,
  leaves sway at breath rhythm, he breathes with you (eyes closed —
  co-participation, the screen that sets the standard).
- *Journal*: written **inside the shed** at a little desk; Bramble is
  **curled up asleep in the corner** — present and comforting, visibly
  *not reading* (protects the "only you" promise).
- *SWEMWBS*: the robin delivers it fortnightly as a **letter to the shed**
  — the questionnaire becomes mail, not a form.
- *You/settings*: deliberately near pet-free. Utility screens stay boring.

**The Tools tab is "Places".** Tools are locations in the garden, not a
button grid: **The bench** (breathe) · **Inside the shed** (journal) ·
**Through the gate** (activities) · **The old radio** (sounds). A
"Bramble's here" tag shows where he currently is — tapping a place is
*going somewhere*, and the "Need support now?" card stays pinned beneath.

**Insights engine v1 is rule-based**: trends, streaks-of-care, correlations
("your mood is higher on days after 7+ hours sleep"), WEMWBS trajectory.
**v2 moves to AI** (LLM-written personal narratives) once real data flows and
the university signs off the privacy design.

Data sources (v1): daily check-ins · Apple Health (sleep, steps — processed
on device, only derived aggregates leave the phone) · SWEMWBS scores ·
in-app behaviour (sessions completed; content of journals is never analysed).

## 5. The pet

- **One hero pet**: a **hedgehog** living in a garden shed — literally
  on-brand, British, gender-neutral. Curl-up/uncurl is a natural
  anxiety/calm metaphor for animation states. Working name: **Bramble**
  (rename with Morag's blessing).
- **Built in Rive** (state machine: idle, greet, happy, sleepy, curl,
  celebrate, listen) by Callum + Claude in the free Rive editor.
  ⚠ Longest-lead asset — starts week 1.
- **The scene is a Rive artboard too** (or layered with the pet in one
  canvas): state-machine inputs for growth stage, weather, time of day,
  season, and unlocked objects. One canvas on Home keeps performance sane.
- **Gamification is pet-led with no punishment**: the pet grows with care
  and is happy to see you regardless. Kind streaks that bend, never break.
  No XP walls, no lose-it-all mechanics, no 100-badge wall (pet growth
  replaces it).
- Rive requires an **Expo dev build** (EAS) — not Expo Go.

## 6. v1 scope — September

**In:** invite-code signup · onboarding · daily check-in · today's plan ·
hedgehog + world + speech (Rive) · Insights tab (rule-based) · SWEMWBS
fortnightly ("wellbeing pulse", short 7-item scale) · light journal
(encrypted, optional prompts — no search/tags/media) · guided breathing with
ambient audio · curated self-care activity library (~30, feeds the plan) ·
one daily pet-voiced nudge at a user-chosen time (everything else opt-in) ·
help & resources page · You tab (profile, settings, data export/delete).

**Out (v2+):** AI insight narratives · study tools (planner/timer/tips) ·
Oura · quizzes beyond SWEMWBS · goals module · badges system · friends/social
· additional pets · dark mode (light-first at launch) · uni email
verification (invite codes cover the pilot).

## 7. Design language — original MindSHED DNA, refined

The original app has a strong, distinctive identity: a warm "hand-drawn
sticker" look. The redesign keeps it and tightens the execution ("the
original, with our twist") rather than replacing it.

**Keep (the DNA):**
- Cream background `#FFF9DA`
- White cards with **2px ink outlines**, 16–18px radius
- Mint `#B6FFB1` as the primary action colour, pill buttons with outlines
- Pastel semantic ramp for moods/tasks: red `#FF8A7D` → orange `#FFB173` →
  yellow `#FFDC75` → light green `#D6F7B8` → mint `#B6FFB1`
- Square outlined checkboxes, outlined header pills
- Happy Monkey as the display/heading font — the app's voice

**Balance rule (gender-neutral appeal):** the world is *outdoorsy, not
twee*. Scene props lean nature/craft — mountains on the horizon, dry-stone
wall, log pile, spade, rope swing, robin, fishing rod by the pond — instead
of bunting, hearts and lavender. Pinks/purples appear only as rare accents
(a single flower), never as structural colours. Functional colour (the
mood ramp) is exempt.

**Bramble moves.** The pet wanders the garden on Home — ambles to the
pond, sniffs flowers, naps by the shed — driven by Rive state-machine
"activity" states plus position tweening. Idle is never static.

**The twist (maturing it):**
- Ink `#2B2B26` replaces pure black everywhere — softer, warmer outlines
- **Happy Monkey for headings only; Nunito for body text** — keeps the
  charm, makes real content readable and grown-up
- One consistent component set (card, chip, task row, pill button) —
  kills the old app's screen-to-screen inconsistency
- Strict spacing scale and fewer elements per screen — kills the clutter
- Motion everywhere it matters (pet via Rive, micro-feedback on taps,
  check-in transitions) — kills the dead feeling
- Reference: original Figma (`MindSHED-Designs` file) + old Flutter
  `app_theme.dart` / `shared_ui_components.dart` are the canonical source
  of the original language.

**Navigation — 4 tabs**: **Home** (the garden: pet + check-in + today's
plan) · **Insights** (Bramble's notebook) · **Places** (bench, shed, gate,
radio) · **You**.

## 8. Measurement & safeguarding

- **SWEMWBS every 2 weeks**, framed as "your wellbeing pulse"; pet
  celebrates completion. The university's outcome line.
- **Safeguarding (v1)**: static help & resources page (uni counselling,
  Samaritans, NHS 111, crisis text lines), always reachable.
  **Recommended for v1.1** (flag to Morag/university): gentle data-triggered
  signposting when check-ins trend very low — an app that collects mood data
  but never reacts to it is the first thing a formal review will question.

## 9. Privacy posture

Clean start, no legacy data. Journals encrypted. Raw HealthKit data stays
on device. No journal content analysis. UK/EU hosting. Data export and
delete in You tab from day one. GDPR review with the university before
pilot.

## 10. Screen flow (v1)

```
Welcome (invite code) ──▶ Meet Bramble (permissions: nudge time, Health opt-in)
        │
        ▼
Home — STARTER garden (sparse on purpose: "we'll grow it together")
        │ tap a mood on the sheet
        ▼
Check-in (Bramble mirrors mood · energy/stress · optional note)
        │ "Done — see what blooms"
        ▼
Bloom moment (scene reacts in seconds: "you planted a marigold") ──▶ Home

Tabs: Home ⇄ Insights (Bramble's notebook) ⇄ Places ⇄ You

Places ──▶ The bench ──▶ Breathing (dusk, Bramble breathes with you)
       ──▶ Inside the shed ──▶ Journal (Bramble asleep in corner)
       ──▶ Through the gate ──▶ Activities ("+" adds to today's plan)
       ──▶ The old radio ──▶ Sounds
       ──▶ Need support now? ──▶ Resources (also from You tab)

Robin arrives (fortnightly) ──▶ Letter ──▶ Pulse questions ×7 (stamp answers)
        ──▶ result files into the notebook · You shows next delivery
```

Key flow rules:
- The **starter garden** is deliberately sparse — growth is the promise.
- Every check-in returns you to the garden for a **visible bloom within
  seconds**; that loop (home → check-in → bloom → home) is the product.
- Activities chosen "through the gate" land in **today's plan** (Bramble
  carts them home) — the library and the plan are one system.
- Onboarding asks for at most two things, framed in Bramble's voice:
  nudge time and optional Apple Health.

## 11. Build plan (~12 weeks to September)

| Weeks | Focus |
| --- | --- |
| 1–2 | Design system (tokens/type/components) · hedgehog + garden scene concepts, Rive rig v1 · auth + invite codes |
| 3–4 | Check-in flow · Home screen (pet + today) · sync |
| 5–6 | Insights engine + tab · HealthKit ingestion |
| 7–8 | Journal (light) · breathing · activity library + daily plan |
| 9 | SWEMWBS flow · notifications · resources page · You tab |
| 10 | EAS dev build with Rive · TestFlight/internal track |
| 11–12 | Polish · pilot materials · dental-student beta · fixes |
