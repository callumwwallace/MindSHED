# MindSHED pilot flow and test report

Date: 21 July 2026
Scope: current working tree, native iOS/Android pilot and pseudonymous API
Decision: **engineering candidate, not yet authorised for participants or store submission**

## 1. Result at a glance

The repository now contains a functional native pilot path: controlled
enrolment, granular consent, encrypted local use, structured offline research
sync, export, withdrawal and deletion. The API is deployable as a non-root
container and fails closed when its production security configuration is
incomplete. The app likewise refuses a production configuration with missing
legal, contact, EAS or HTTPS values.

The remaining blockers are not hidden code TODOs: approved legal/research
materials, production infrastructure and operations, independent security and
accessibility evidence, physical-device health/notification tests, store
accounts/signing/declarations, and final visual-owner approval of the store
artwork.

Status terms used below:

- **Automated pass** — an executable policy, contract or integration test ran.
- **Bundle pass** — production-guarded code bundled, but no physical UI claim is made.
- **Device QA** — implemented but must be exercised on signed physical builds.
- **Approval gate** — deliberately disabled until named external approval exists.
- **Excluded** — intentionally outside this pilot and presented honestly in the app.

## 2. Evidence run in this audit

| Check | Result |
| --- | --- |
| Expo Doctor | 21/21 checks passed |
| Workspace TypeScript | API, mobile and shared package passed |
| Mobile lint | Passed with no warnings |
| Mobile policy tests | 23/23 passed |
| API unit and strict-contract tests | 15/15 passed |
| Fresh PostgreSQL migration | All migrations, including `0004`, applied |
| PostgreSQL pilot lifecycle | Enrol, consent, upload, same-day edit, export, idempotent withdrawal and deletion passed |
| Real HTTP boundary | Health/readiness, security headers, no credential in URLs, CORS denial and 128 KiB limit passed |
| Retention lifecycle | Dry run, scoped execute, cascade and cross-study isolation passed |
| Production mobile config | Missing values fail; complete synthetic values pass |
| Production platform bundle | iOS, Android and 37 static routes exported |
| Native Android manifest introspection | Backup/full-backup/cleartext off; legacy storage and overlay permissions removed |
| API bundle | Node 22 CJS production bundle passed |
| API container | 56.7 MB, non-root `node` user, `/health` 200 and `/ready` 503 with unavailable database |
| Production dependency audit | 0 critical, 0 high, 13 moderate; see dependency triage |

These checks do not replace TestFlight/Play testing, an independent penetration
test, a restore drill or store review.

The support content was rechecked on 21 July 2026 against the official
[NHS urgent-support guidance](https://www.nhs.uk/every-mind-matters/urgent-support/),
[Samaritans contact page](https://www.samaritans.org/how-we-can-help/contact-samaritan/),
[Shout service page](https://giveusashout.org/get-help/how-shout-works/) and
[University of Plymouth Student Wellbeing page](https://www.plymouth.ac.uk/services/student-wellbeing).
The implemented 999, 111 mental health option, 116 123, SHOUT-to-85258,
university phone/email and five-working-day warning still match those sources.

## 3. Complete participant-flow assessment

### Entry, enrolment and consent

| Flow | Route | State and evidence | Result |
| --- | --- | --- | --- |
| First launch gate | root layout | Non-entry routes redirect until onboarding is complete; privacy, legal, support and deletion remain reachable | Automated pass |
| Browser boundary | every web route | Renders only a native-app notice; does not mount API, pilot sync, health sync or private persisted state | Bundle pass |
| Pilot introduction | `/onboarding` | Explains invite-only/no-account model and requires privacy acknowledgement | Bundle pass |
| Code redemption | `/onboarding` → API | Valid code creates random participant credentials; invalid, expired, inactive and full codes return one generic response | Automated pass |
| Paused enrolment | `/onboarding` | Mobile and API legal/enrolment switches both fail closed | Automated pass |
| Resume after interruption | `/onboarding` | Existing SecureStore identity resumes at consent/introduction instead of redeeming again | Code-reviewed; device QA |
| App terms | `/pilot-consent` | Required independently of optional research | Automated contract pass |
| Research decline | `/pilot-consent` | Local app continues; queue is cleared immediately; offline server update is retained in SecureStore | Automated policy pass; device QA |
| Research opt-in | `/pilot-consent` | Server-first, exact document versions, explicit research plus health-data processing consent | Automated database pass |
| Marketing | `/pilot-consent` | Hidden/default-off unless independently enabled on both policy and service | Automated contract pass; approval gate |
| Bramble introduction | onboarding steps 1–3 | Native SVG companion, optional local reminder, finish into garden | Bundle pass; device QA |

### Daily garden and check-in

| Flow | Route | State and evidence | Result |
| --- | --- | --- | --- |
| Home/garden | `/` | Daily state, Bramble, garden growth, check-in dock and plan entry points | Bundle pass; device QA |
| Full garden | `/garden` | Full-screen habitat view | Bundle pass; device QA |
| Growth explanation | `/garden-progress` | Every threshold has current/next/unlocked states | Automated pass |
| Check-in | `/check-in` | Mood 1–5, energy/pressure 0–10, optional local note and up to three needs | Automated policy/contract pass |
| Same-day edit | `/check-in` | Replaces local check-in and coalesces/replaces the one research event for that day and kind | Automated mobile/database pass |
| “Nothing yet” | `/check-in` | Exclusive local choice and omitted from research need values | Automated pass |
| Low mood/high pressure | `/check-in` | Surfaces real-person support without uploading risk/support interaction | Contract pass; safeguarding approval gate |
| Daily plan | Home and `/activities` | Complete/undo, add/remove, deduplicate and local-day reset | Code-reviewed; device QA |
| App switcher | all native screens | Cream privacy shield covers content while inactive/backgrounded | Bundle pass; physical snapshot QA |

### Places and self-support

| Flow | Route | State and evidence | Result |
| --- | --- | --- | --- |
| Places hub | `/(tabs)/places` | Routes to breathing, journal, grounding, activities and support | Bundle pass |
| Breathing | `/breathe` | Setup, active deadline, pause/resume, interruption handling and Reduce Motion | Code-reviewed; device/background QA |
| Journal | `/journal` | Create, edit and delete private text; 8,000-character cap | Bundle pass; encrypted-store device QA |
| Grounding | `/grounding` | Untimed 5–4–3–2–1 sequence, exit and support route | Bundle pass; device QA |
| Activities | `/activities` | Filter, add, already-added and remove states | Bundle pass; device QA |
| Support | `/support` | 999, Samaritans, Shout and NHS routes with unavailable-device error handling | Bundle pass; physical call/SMS QA and safeguarding approval gate |
| Soundscapes | `/sounds` | Truthful “not included” state; no fake playback | Excluded |

### Insights, pulse and phone health

| Flow | Route | State and evidence | Result |
| --- | --- | --- | --- |
| Insights overview | `/(tabs)/insights` | Today, seven-day picture, pulse schedule and cautious observations | Bundle pass |
| Observation detail | `/insight-detail` | Minimum-data and non-causal rules; no private text analysis | Automated pass |
| Check-in history | `/history` | Local history with missing days handled | Bundle pass |
| SWEMWBS pulse | `/pulse` | Seven complete 1–5 answers, draft/resume, official score mapping and fortnightly schedule | Automated pass; presentation/feedback approval gate |
| Pulse upload | queue/API | Requires both mobile/API switches, consent and approved schema | Automated contract/database pass; approval gate by default |
| Apple Health | `/health-data` | Read-only 21-day step/sleep summaries; query failures isolated so one data type can still work | Bundle pass; physical iPhone QA |
| Health Connect | `/health-data` | Checks granted record types, supports partial access and disconnects on total revocation | Bundle pass; physical Android QA |
| Health privacy | local/API | Summaries stay in encrypted local state; schemas reject raw and derived phone-health data | Automated contract pass |
| Disconnect/delete | `/health-data`, `/delete-data` | Clears cached summaries and connection state | Code-reviewed; device QA |

Apple Health intentionally does not expose reliable read-authorisation status to
apps. Revocation must therefore be verified through empty/error query behaviour
on real devices; the app does not claim it can distinguish “no records” from
every form of denied read access.

### Profile, preferences, privacy and legal

| Flow | Route | State and evidence | Result |
| --- | --- | --- | --- |
| Settings hub | `/(tabs)/you` | Routes to profile, plan, reminders, health, accessibility, privacy and information | Bundle pass |
| Local profile | `/profile` | Display name remains only in encrypted local store | Contract denylist pass; device QA |
| Support plan | `/care-plan` | Warning signs, helpful actions and contact stay local | Contract denylist pass; device QA |
| Daily nudge | `/daily-nudge` | Permission, denial/settings recovery, strict 24-hour time and schedule replacement | Automated policy pass; physical delivery/DST QA |
| Notification tap | native shell | Handles cold/running responses and accepts only `/` or `/check-in`; current nudge opens check-in | Automated allowlist pass; device QA |
| Quiet inbox | `/notifications` | Explains no remote inbox or push-token collection | Excluded |
| Accessibility | `/accessibility` | Reduce Motion and haptic preference controls | Bundle pass; assistive-technology QA |
| Privacy summary | `/privacy` | Local/server boundary, export, health, consent, withdrawal and deletion | Bundle pass; legal approval gate |
| About | `/about` | Runtime version plus privacy, terms, pilot and contact routes | Bundle pass |
| Legal documents | `/legal` | Approved/unapproved state, version labels, configured controller/support/research details and external policy link | Production config pass; legal approval gate |

### Export, service status, withdrawal and deletion

| Flow | Route | State and evidence | Result |
| --- | --- | --- | --- |
| Participant export | `/export-data` | Local JSON plus online pseudonymous server copy; clear plaintext warning; temporary cache deletion in `finally` | API pass; physical share-sheet QA |
| Pilot status | `/pilot-status` | Consent, switches, queue, minimum version, missing/retained-away record and manual retry | Automated policy/API pass; device QA |
| Offline opt-out | `/pilot-consent` | Research stops and queue clears before network confirmation | Automated policy pass |
| Formal withdrawal | `/withdraw-research` | Typed confirmation, immediate local stop, priority SecureStore instruction and idempotent server retry | Automated policy/database pass; device offline QA |
| Combined deletion | `/delete-data` | Typed confirmation, durable local clear, reminder cancellation, credential removal and offline server tombstone | Automated policy/database pass; device offline QA |
| Already absent | sync agent | Unauthorized/not-found after retention is terminal for withdrawal/deletion; credentials are cleared | Automated policy pass |
| Governance priority | sync agent | Deletion supersedes withdrawal, which supersedes opt-out; no ordinary upload runs first | Automated pass |

## 4. API and operations flow assessment

| Boundary | Implemented behaviour | Evidence |
| --- | --- | --- |
| `/health` | Process liveness, no database dependency | HTTP pass |
| `/ready` | Verifies database connectivity and the required `0004` migration; returns 503 otherwise | HTTP pass |
| `pilot.config` | Non-personal versions, legal state, switches and minimum app version | Unit/database pass |
| `pilot.enrol` | HMAC batch code, validity/capacity transaction, random 256-bit credentials and generic failure | Database pass |
| `pilot.recordConsent` | Exact versions, consent invariant, marketing gate, bounded history and participant lock | Contract/database pass |
| `pilot.ingest` | Strict allowlist, 50-event batch, app version, consent/switch checks, idempotency, same-day update and bounded history | Contract/database pass |
| `pilot.exportData` | Credential-bearing POST, bounded consent/events and no received timestamp | Database/HTTP pass |
| `pilot.withdrawResearch` | Deletion-secret auth, upload stop, consent marker, participant lock and idempotent retry | Database pass |
| `pilot.deleteData` | Deletion-secret auth and cascading delete with non-identifying receipt | Database pass |
| Lifecycle job | Dry-run default, approved study scope, advisory lock, configurable retention and aggregate output | Database pass |
| HTTP edge | 128 KiB limit, rate limit, fail-closed CORS, no request logging, redaction and Helmet headers | Unit/HTTP pass; deployed-proxy QA remains |
| Production startup | Requires a valid PostgreSQL URL, encoded 32-byte non-placeholder HMAC key, database TLS, semantic minimum version and legal-compatible switches | Unit pass |
| Container | Multi-stage, pinned Node image, bundled runtime, non-root user and readiness healthcheck | Local final build/boot passed; registry scan/deployed environment remain |

## 5. Required physical-device scripts

Run each on the exact signed release candidate and record device, OS, build,
tester, timestamp, result and evidence link.

1. **Fresh install and decline:** install clean, read policy, redeem a staging
   code, accept app terms, decline research, complete onboarding, use all local
   areas offline, relaunch and confirm persistence.
2. **Research and same-day edit:** opt in, submit a check-in, edit it twice,
   reconnect, export, and verify the server contains one latest check-in for the
   relative day with no note/name/device/timestamp.
3. **Lost response:** interrupt immediately after consent/upload/withdrawal
   sends; relaunch and confirm retry is idempotent and the UI reaches a stable
   state.
4. **Offline withdrawal:** queue events, go offline, withdraw, confirm queue is
   empty and local use continues, force-quit/relaunch offline, reconnect and
   confirm server withdrawal before any event upload.
5. **Offline deletion:** populate every local data type, enable a reminder, go
   offline, delete, relaunch, inspect local storage, reconnect and confirm the
   server record is absent.
6. **Export:** test success, cancel and failing share targets; confirm no
   readable cache export remains and warn that the chosen destination is outside
   MindSHED's control.
7. **Notifications:** deny, later enable in Settings, change time, cross a DST
   boundary/time zone, receive foreground/background/terminated, tap and confirm
   only check-in opens.
8. **HealthKit:** no data, steps only, sleep only, both, partial access,
   revocation, duplicate/overlap, timezone change, disconnect and delete.
9. **Health Connect:** provider missing/update needed, steps only, sleep only,
   both, total revoke, settings return, disconnect and delete.
10. **Accessibility:** VoiceOver and TalkBack reading order/actions, 200% text,
    Reduce Motion, increased contrast, switch/keyboard navigation and 44-point
    targets on every route.
11. **Lifecycle/platform:** app switcher snapshots, background/foreground,
    low-memory termination, device lock, OS backup/transfer, reinstall and
    upgrade from the previous pilot build.
12. **Support and layout:** physical call/SMS handoff, no-handler errors,
    smallest supported phone, large phone and representative Android form
    factor in portrait.

## 6. Release blockers

The release remains **no-go** until the following evidence exists:

- signed legal/privacy/controller/contact/retention wording matching the code;
- ethics, DPIA, protocol/data dictionary, safeguarding, intended-purpose and
  SWEMWBS presentation/feedback decisions;
- approved production region, secrets, TLS, roles, backups, restore/deletion
  drill, privacy-safe monitoring, incident ownership and support rota;
- independent penetration test and physical accessibility/device matrix with
  all high/critical findings closed;
- organisation-owned Apple/Google/EAS accounts, signing and recovery access;
- final visual approval of the Bramble-derived icon/splash, screenshots, metadata, age rating,
  privacy policy/support URLs and reviewer instructions;
- Apple privacy/health declarations and Google Data Safety/Health Apps forms
  reconciled with the signed policy;
- TestFlight and Play closed-test acceptance followed by a recorded go/no-go.

## 7. Traceability

- Release checklist: `docs/APP-STORE-RELEASE-CHECKLIST.md`
- Deployment controls: `docs/DEPLOYMENT-RUNBOOK.md`
- Research fields: `docs/PILOT-DATA-DICTIONARY.md`
- Broader governance plan: `docs/PRODUCTION-READINESS-PLAN.md`
- Dependency findings: `docs/DEPENDENCY-SECURITY-TRIAGE.md`
- Threats and residual risks: `docs/THREAT-MODEL.md`
- Operational release sequence: `docs/RELEASE-RUNBOOK.md`
