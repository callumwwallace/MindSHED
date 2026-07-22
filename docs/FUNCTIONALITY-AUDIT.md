# MindSHED UI and functionality audit

Snapshot: 21 July 2026

## Executive view

The core participant journey is now implemented as a coherent, local-first
wellbeing product rather than a collection of design previews. Fresh installs
move through pilot enrolment, an honest pre-consent privacy notice, granular
consent and a Bramble introduction before reaching the daily garden. Check-ins,
journaling, a personal care plan, breathing, grounding, insights, privacy
controls and an optional on-device reminder all work.

The app must still not be released to participants. The legal source documents
contain unresolved placeholders and describe data uses that do not match this
pilot build. Production infrastructure, governance approval, safeguarding
sign-off, physical-device accessibility QA and independent security evidence
are also outstanding.

## Implemented participant journey

| Area | Current behaviour | Assessment |
| --- | --- | --- |
| Entry | Server-backed non-personal pilot code, resumable enrolment, pre-consent notice, granular app/research choices and Bramble introduction | Implemented; production enrolment fails closed until approved document flags are enabled |
| Home | Full-screen garden, named habitat progress, compact check-in dock, expandable quiet plan, roaming/pettable Bramble and timed dialogue | Implemented with the repository-native SVG animation; no external animation runtime is required for the pilot |
| Daily loop | Four-step check-in, low-mood support signposting, rule-based care suggestion, editable daily plan and next-day reset | Implemented locally; structured allowlisted research event queues only after research consent |
| Places | Breathing, journal, grounding, activities, non-punitive habits, a restorative sorting game and urgent support | Implemented; simulated sound player removed and direct old links show an honest unavailable state |
| Insights | One guided wellbeing picture: today's check-in, due fortnightly SWEMWBS check, mood/energy/pressure together, cautious observations, phone-health context and history | Implemented locally; no hidden composite score; SWEMWBS feedback and research upload remain independently approval-gated |
| You | Profile, support plan, reminder, optional phone-health context, accessibility, privacy, pilot status, legal and deletion/export controls | Implemented; fake account and inbox affordances remain excluded |
| Research sync | Encrypted offline queue, random jitter, retry, permanent-error blocking, minimum-version enforcement, withdrawal and deletion | Implemented against the pseudonymous pilot API; no direct identifiers or free text are allowlisted |

## Data and privacy boundary

- Native wellbeing data and the research queue are stored in a SQLCipher-backed
  SQLite database whose key is held in SecureStore. Secure deletion is enabled.
- Pilot credentials are generated or received on-device and held in platform
  secure storage. The server stores credential hashes.
- Journal text, check-in notes, support-plan text and trusted-contact details do
  not enter research event contracts.
- Longitudinal server records are described as pseudonymous, not anonymous.
  The app explains that network infrastructure necessarily handles connection
  metadata even though the application does not add it to research records.
- Research upload is optional. Turning it off clears queued research events;
  withdrawal and deletion stop locally while offline and retain only the
  minimum encrypted server instruction needed to confirm the action later.
- Local deletion clears consent state, profile, settings, wellbeing content,
  cached phone-health summaries, notification schedules, encrypted queue and
  pilot credentials.
- Optional Apple Health/Health Connect access is read-only and limited to daily
  steps and sleep duration for the most recent 21 days. Those summaries are
  encrypted locally, can be disconnected/deleted independently and are not in
  the pilot API allowlist.

## Functionality deliberately excluded

| Feature | Pilot decision |
| --- | --- |
| MindSHED account/sign-in | Excluded: the pilot uses a participant-held random credential so MindSHED does not collect a name or email |
| Connected health research upload | Excluded: optional read-only daily step/sleep summaries are local context only and cannot enter the current pilot API |
| Remote push/in-app inbox | Excluded: the optional daily nudge is scheduled locally and needs no push token |
| Soundscapes | Removed until licensed audio, downloads, interruption behaviour and accessibility are real |
| Wellbeing pulse research upload | The licensed seven-item local flow is implemented; server upload and personal score feedback remain disabled until their separate approvals are evidenced |
| Marketing consent | Hidden and default-off unless the approved production policy explicitly requires the separate choice |
| Subscription/paywall | Excluded from the university pilot |

## Correctness and UX fixes in this implementation pass

- Rebuilt Bramble as a cleaner two-eyed three-quarter-view character with
  standing and curled states, a smaller nose and reduced-motion behaviour.
- Kept Bramble's dialogue attached to the moving companion and constrained it
  to the visible screen. Dialogue now reveals progressively, rests, fades away
  and limits unsolicited Home speech to two calm moments per session.
- Replaced the permanent full-width Home plan overlay with a compact dock and a
  shorter expandable sheet, leaving the garden and shed visible.
- Rebuilt the shed around one legible front gable, continuous roof slopes,
  aligned fascia, wall boards, door and window rather than overlapping roof
  polygons.
- Replaced arbitrary tiny growth sprites with seven named habitat milestones,
  visually distinct garden zones, specific unlock copy and a participant-facing
  garden journal that explains the current and next change.
- Reworked Places into illustrated bench, shed, gate and senses-path scenarios
  with Bramble acting differently in each; removed the permanent location claim.
- Made the journal, breathing area and pond discoverable through the illustrated
  Home scene without permanent floating action labels obscuring the garden.
- Made mood/capacity sliders draggable with a 44-point target and screen-reader
  adjustable values.
- Made breathing use a real deadline rather than interval counts, preserve the
  remaining time across pause/resume and keep the device awake only while active.
- Added OS and in-app Reduce Motion support to companion and check-in animation.
- Implemented real local notification permission, Android channel creation,
  daily scheduling, cancellation and device-settings recovery.
- Corrected research relative-day calculation across daylight-saving changes,
  queue overflow visibility, permanent/transient retry handling and server
  minimum-app-version enforcement.
- Removed fake audio, account and inbox behaviour; old deep links now resolve
  to truthful unavailable/quiet states.
- Rebuilt Insights around a single reading order and placed mood, energy and
  pressure together. Daily reports and the licensed fortnightly SWEMWBS flow
  are explicitly explained as different views, rather than competing scores.
- Added optional native HealthKit and Health Connect read-only access for steps
  and sleep, with local-only contextual comparisons, minimum-data thresholds,
  permission recovery, refresh, disconnect and deletion controls.
- Reworked legal/privacy copy so it matches the code and blocks production
  consent while the supplied legal documents remain unapproved.
- Added strict notification deep-link routing, partial/revoked Health Connect
  handling, app-switcher privacy cover, Android backup exclusion and a native-
  only browser boundary.
- Added production mobile/API configuration validation, database TLS,
  readiness checks, security headers, bounded participant histories and
  participant-serialized/idempotent lifecycle operations.

## Evidence completed

- Workspace TypeScript, mobile lint, 23 mobile policy/lifecycle tests and 15 API
  unit/contract tests pass.
- Disposable-PostgreSQL enrolment, consent, ingestion, withdrawal, deletion,
  HTTP-boundary and retention lifecycle tests have passed locally.
- iOS native development build succeeds with HealthKit linked and the key
  participant screens have been visually reviewed in an iPhone simulator.
- iOS, Android and static web production exports succeed with release
  configuration guards enabled; web renders only the native-app availability
  boundary and does not initialize private or pilot services.
- Android native debug APK compiles across arm64-v8a, armeabi-v7a, x86 and
  x86_64 with SQLCipher, Health Connect, notifications and KeepAwake linked.

## Remaining go/no-go gates

1. Lawyers/controller must complete and approve the privacy policy, consent,
   terms, retention, controller/contact and subprocessor details, then the
   approved version flags can be enabled.
2. Ethics, DPIA, research protocol/data dictionary, safeguarding wording,
   accessibility and independent security review need named sign-off.
3. Provision approved UK production infrastructure and complete staging proxy,
   backup-restore, outage, withdrawal and deletion drills.
4. Complete physical iOS and Android testing for VoiceOver/TalkBack, large text,
   keyboards, permissions, notifications, offline recovery and upgrade paths.
5. Obtain visual-owner approval for the new Bramble-derived app icon/splash and
   supply final store screenshots/metadata.
6. Complete physical-device permission, revocation, partial-access and real-data
   QA for HealthKit and Health Connect, and reconcile both store health-data
   declarations with the final policy and DPIA.
