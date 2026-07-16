# MindSHED pilot screen and state matrix

Updated: 16 July 2026

Legend: **ready** is implemented and internally verified; **device QA** needs
physical iOS/Android evidence; **approval gate** deliberately remains disabled;
**excluded** is not part of this pilot.

## Entry and pilot

| Flow/state | Status |
| --- | --- |
| Pilot welcome, code redemption, invalid/expired/used/paused responses | Ready |
| Existing local pilot identity resumes without creating a second record | Ready |
| Pre-enrolment privacy notice and separate granular consent | Ready |
| Research declined while local app remains usable | Ready |
| Permanent research withdrawal and local/server deletion | Ready |
| Unapproved legal document version | Ready; fails closed in production |
| Account sign-in, email verification and recovery | Excluded by privacy-preserving pilot identity model |

## Daily loop and companion

| Flow/state | Status |
| --- | --- |
| Home before/after check-in; compact/expanded quiet plan; full garden | Ready |
| Named garden milestones, specific unlock state, next milestone and garden journal | Ready |
| Bramble idle, wander, react, celebrate, sleepy and reduced motion | Ready with SVG fallback; production Rive is an external art gate |
| Attached Bramble speech on left/right edges; reveal, hold, fade and ambient cooldown | Ready |
| Check-in mood, capacity, note/needs, low-mood support and care result | Ready |
| Daily plan empty, suggested, custom, done, undo and next-day reset | Ready |
| Support plan edit/persistence | Ready |
| Offline queue, reconnect, blocked retry and minimum-version failure | Ready; physical outage QA remains |

## Places

| Flow/state | Status |
| --- | --- |
| Places hub with bench, shed, gate and senses-path Bramble scenarios | Ready |
| Breathing setup, active, pause/resume, interruption-safe timer and completion | Ready; background physical-device QA remains |
| Journal create, history, edit, delete and sleeping Bramble shed scene | Ready |
| Activities filter, add, already-added and remove | Ready |
| Untimed 5–4–3–2–1 grounding and early exit | Ready |
| Support call/SMS/email and device-unavailable handling | Ready; physical-device QA remains |
| Soundscape library/player | Excluded; old links show an honest unavailable state |

## Insights

| Flow/state | Status |
| --- | --- |
| Guided wellbeing picture with today's report, due check, seven-day view and history | Ready |
| Mood, energy and pressure shown together with missing days left visibly blank | Ready |
| Cautious observations, minimum-data threshold, plain-language explanation and provenance | Ready |
| Licensed seven-item SWEMWBS flow, save/resume, scoring and local history | Ready; licensed-presentation and physical accessibility QA remain |
| SWEMWBS research upload and participant-facing score feedback | Approval gate; independently disabled by default |
| Optional read-only Apple Health/Health Connect steps and sleep connection | Ready; physical-device permission and real-data QA remain |
| Health unavailable, denied/partial access, refresh, stale, disconnect and local deletion | Implemented; physical-device matrix remains |
| Phone-health summaries in research upload | Excluded by the API allowlist |

## You, settings and privacy

| Flow/state | Status |
| --- | --- |
| Local profile and comfort preferences | Ready |
| Daily nudge off/on, permission denied, time change and system-settings handoff | Ready; physical notification-delivery QA remains |
| Reduce Motion, haptics and large touch targets | Ready; VoiceOver/TalkBack QA remains |
| Privacy boundary, pilot status, local export and clear warning | Ready |
| Research withdrawal and combined local/server deletion | Ready |
| Legal/about/support/contact screens | Ready in fail-closed draft mode; approval gate remains |
| Remote notifications inbox | Excluded; old links explain there is no remote inbox |
| Connected health | Optional local-only steps/sleep context; physical-device QA and store declarations remain |
| Marketing | Approval gate; hidden and default-off |

## Release evidence still required

- Physical small/tall iPhone and representative Android phone/tablet layouts.
- VoiceOver, TalkBack, Dynamic Type/font scaling, contrast and switch control.
- Notification delivery across time-zone/DST changes and permission recovery.
- HealthKit/Health Connect permission, partial-access, revocation, duplicate-data,
  time-zone/DST and settings-recovery behaviour using real phone data.
- Keyboard avoidance, Android system back and destructive confirmation flows.
- Install, encrypted-data migration, update, offline/online and interrupted sync.
- Store/TestFlight/Play closed-test signing, privacy declarations and review.

Subscription, paywall, purchases and restore-purchases remain outside the
university pilot.
