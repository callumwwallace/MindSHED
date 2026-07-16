# MindSHED pilot production-readiness plan

Status: implementation underway; not approved for participant data  
Prepared: 16 July 2026  
Scope: iOS and Android university pilot, with web secondary

## Implementation checkpoint — 16 July 2026

The first privacy/security tranche is now implemented in the repository:

- strict version-1 enrolment, consent and research-event contracts reject
  unknown fields and exclude journal text, check-in notes and direct
  identifiers;
- PostgreSQL migrations create pseudonymous participants, versioned consent
  history and idempotent structured events with cascading deletion and database
  constraints;
- the API provides enrolment, consent, status, batch ingestion, export,
  research withdrawal and deletion procedures using hashed high-entropy
  credentials;
- governed batch credentials are stored only as hashes and enforce active
  dates, aggregate cohort capacity and atomic redemption without an individual
  recruitment mapping;
- independent fail-closed switches can pause enrolment or all research uploads,
  while a non-personal configuration procedure reports document/schema and
  minimum-app versions;
- request logging is disabled, sensitive log paths are redacted, CORS fails
  closed without configuration, and request-size/rate limits are active;
- the iOS/Android native configuration enables SQLCipher for the local Zustand
  data and upload queue, with the database key and pilot credentials held in
  SecureStore;
- the native app has real server-backed invite, consent, withdrawal and
  combined local/server deletion flows;
- the app has a participant-facing pilot status screen for consent, anonymous
  connection, encrypted queue/retry state, service switches and the
  participant-held-key recovery limitation;
- structured check-ins use an encrypted offline queue, relative study days,
  idempotent event IDs, exponential retry and random upload jitter;
- contract denylist tests, a disposable-PostgreSQL full lifecycle integration
  test, a real HTTP-boundary credential/CORS/payload-limit test, workspace
  typechecks, mobile lint and an iOS SQLCipher development build pass. The
  simulator database header was verified as encrypted rather than plaintext
  SQLite;
- a Docker Compose local PostgreSQL service, migration/hashed-code seed workflow
  and an engineering-draft pilot data dictionary now make the current boundary
  reproducible and reviewable;
- GitHub verification now covers types, lint, strict contracts, Expo Doctor,
  dependency severity, disposable-PostgreSQL migrations, full database/HTTP
  lifecycle tests and configurable data-lifecycle tests, with Dependabot grouped
  for controlled Expo and production dependency updates;
- the retention job is dry-run by default, reports aggregate counts only, takes
  controller-approved periods from configuration, supports study scoping,
  prevents concurrent runs and tests cascading execution without inventing
  unapproved retention values;
- fake account recovery, connected-health simulation, the internal state gallery
  and the embedded local pilot code have been removed from participant builds;
- optional connected-health context is now a real read-only HealthKit/Health
  Connect integration limited to 21 days of local daily step/sleep summaries;
  the API contract rejects raw and derived phone-health data;
- Android API 36 tooling is installed locally and both a four-architecture debug
  APK and a production-mode arm64 app bundle compile successfully with SQLCipher,
  Rive, release JavaScript bundling and lint-vital checks.
- the daily nudge now uses native on-device notification permission and
  scheduling without a push token, while fake sound, health, account and inbox
  experiences are excluded or replaced with honest unavailable states;
- production enrolment and consent now fail closed until the approved legal
  document flags are deliberately enabled, and all participant wording treats
  longitudinal server data as pseudonymous rather than anonymous;
- Home no longer obscures the garden with a permanent plan panel, Bramble's
  moving dialogue is screen-constrained, Reduce Motion is applied across core
  companion/check-in motion, and the breathing timer is interruption-safe;

Still required before any participant data is collected:

- freeze and approve the SWEMWBS research extract/data dictionary, Warwick
  digital presentation and participant-facing feedback before enabling upload;
- provision UK staging/production infrastructure, apply migrations, configure
  secrets, TLS, backups, retention and privacy-safe monitoring;
- expand integration coverage through the deployed proxy/hosting boundary,
  then complete physical Android device verification, restore/deletion drills
  and independent security testing;
- embed the final complete legal documents and reconcile their remaining
  controller, hosting, retention and contact decisions;
- complete the external governance, ethics, DPIA, safeguarding and app-store
  gates listed below.

This checkpoint does not change the go/no-go checklist: none of those gates
should be marked complete until the required evidence and external approvals
exist.

## 1. Target outcome

Ship a stable, accessible wellbeing app for an approved university pilot where:

- participants can use the core app without MindSHED collecting their name,
  university email, phone number or another direct identifier;
- only an explicitly approved, minimised study dataset leaves the device;
- no journal text, check-in note, support-plan content or crisis interaction is
  uploaded;
- MindSHED cannot connect a research record to a known recruited student;
- participants can decline research upload and still use the local app;
- consent, withdrawal, deletion and retention work as documented;
- the app meets agreed security, safeguarding, ethics and store-release gates.

This is a pilot-readiness plan, not legal advice. The final architecture, data
wording and research procedures must be approved by the controller's lawyers,
the University of Plymouth ethics/governance route and the appointed data
protection/security owners.

## 2. The key terminology decision

“Anonymous and not traceable” must be defined precisely before code is built.

If the server holds a stable random participant identifier so it can group one
person's measurements over time, the data is normally best treated as
**pseudonymous personal data**, even if nobody knows the participant's name. A
unique identifier can single a person out, and timestamps or rare response
patterns may make records linkable.

The recommended pilot promise is therefore:

> The research service does not receive direct identifiers and MindSHED does
> not hold a lookup table connecting study records to recruited students.
> Person-level research records are treated as pseudonymous special-category
> data until they are transformed into an approved anonymised or aggregated
> research extract.

Do not describe the server's raw longitudinal records as legally anonymous
until an anonymisation assessment demonstrates that identification risk is
sufficiently remote. Once data is irreversibly anonymised, a participant's
record generally cannot be found later for access, withdrawal or deletion.
That cut-off must be explicit in the participant information.

## 3. Recommended pilot architecture

### 3.1 Identity separation

For the pilot, do not create a MindSHED account containing a name or email.

Recommended recruitment model:

1. The University recruits participants and holds any recruitment/contact list
   in its own approved systems.
2. Participants receive a shared or batch pilot access code that is not mapped
   to an individual person.
3. MindSHED validates the code's study, validity period and capacity only.
4. The app generates a cryptographically random participant key and deletion
   secret on the device.
5. The server stores only a hash of the deletion secret and a random study
   record identifier. It never receives the student's identity.
6. The University must not record which MindSHED study identifier belongs to
   which recruited participant.

If individually assigned invitations are operationally mandatory, commission
a separate privacy design. A normal invite-code lookup table would make the
research data linkable. A blinded credential/token-issuer design can reduce
that linkage, but adds substantial cryptographic and operational complexity.

### 3.2 Data planes

Keep these systems logically and operationally separate:

- **Recruitment plane:** University-owned participant contact and eligibility
  records. No MindSHED research identifier.
- **Pilot configuration plane:** study code, app version requirements, consent
  document versions and feature flags. No participant identity.
- **Research ingestion plane:** pseudonymous structured study events only.
- **Research extract plane:** approved de-identified, generalised or aggregated
  datasets available to named researchers.
- **Operations plane:** infrastructure health and security logs with request
  bodies, study identifiers, IP addresses and secrets removed or tightly
  minimised.

Use separate databases/roles for operational configuration and research data.
Do not place a hidden identity mapping in analytics, support, crash reporting,
CDN logs, backups or data-export tooling.

### 3.3 Network metadata

An API request necessarily exposes an IP address transiently to network
infrastructure. “We do not collect IP addresses” is only accurate if the app,
API gateway, CDN/WAF, load balancer, hosting provider and observability stack do
not retain it beyond strictly necessary ephemeral processing.

Required controls:

- disable or redact source-IP logging at every controllable layer;
- document any provider-level transient handling and retention;
- do not enable third-party mobile analytics or session replay;
- remove advertising IDs, IDFV/Android identifiers, device names and push
  tokens from research payloads;
- use coarse relative study periods instead of exact event timestamps;
- batch uploads with random timing jitter to reduce correlation with
  recruitment or app-support events;
- prohibit request/response bodies in production logs.

### 3.4 Participant-held control secret

The device should generate and securely store:

- a random study record identifier;
- a separate high-entropy deletion/withdrawal secret;
- an upload-signing credential or scoped anonymous access token.

The server stores only hashed/derived forms needed to authenticate requests.
The secret must be held in iOS Keychain/Android Keystore and included in an
explicit recovery design. If there is no identity account and the participant
loses the secret, MindSHED cannot locate their server data. The consent flow
must disclose this limitation or provide a privacy-preserving recovery method.

## 4. Pilot data specification

Create a version-controlled data dictionary before implementing ingestion.
Every server field needs a research purpose, lawful basis/condition, retention
period, sensitivity, allowed values and named recipient.

### 4.1 Proposed allowlist

Only include a field if the protocol/statistical analysis plan needs it.

| Category | Candidate fields | Privacy treatment |
| --- | --- | --- |
| Record control | study ID, schema version, consent version | Non-identifying configuration values |
| Longitudinal grouping | random study record ID | Pseudonymous; never derived from identity |
| Time | relative study day/week | No exact local or UTC timestamps in research extract |
| Check-in | mood, energy, stress, selected needs | Structured values only; no notes |
| Pulse | approved question IDs and numeric answers | Explicitly consented special-category data |
| Engagement | bucketed counts of completed check-ins, breathing and grounding sessions | No navigation trail or exact event time |
| Technical quality | coarse platform, app version, schema version | No device model when small-cell risk is material |
| Consent | approved document version, choices, recorded/withdrawn time | Store with pseudonymous record and audit controls |

### 4.2 Explicit server denylist

Do not transmit or retain:

- name, email, phone, date of birth or student number;
- full postcode, precise location or IP address;
- Apple/Google advertising, vendor or device identifiers;
- device name, contacts, social-login identity or dynamic-link identity;
- notification push token in the research database;
- journal content, check-in notes or other free text;
- support-plan names, contact details or warning signs;
- crisis-resource interactions or inference that a participant is at risk;
- raw HealthKit/Health Connect/Oura data for the initial pilot;
- audio, photos or files;
- exact timestamps unless a reviewed scientific requirement justifies them.

Enforce the denylist in mobile types, API schemas, server validation, database
permissions, automated tests and log-redaction tests.

### 4.3 Research release controls

Before researchers receive data:

- remove or rotate ingestion identifiers;
- generalise or suppress rare values and small cells using an ethics-approved
  threshold;
- assess singling-out, linkability and inference risk;
- run a documented motivated-intruder/anonymisation assessment;
- record the exact query, schema and transformation version;
- require named researcher access, MFA, time-limited permissions and export
  logging;
- prohibit attempts to re-identify participants in the data agreement.

## 5. Required reconciliation with the legal documents

The supplied documents are substantial lawyer-prepared drafts and rendered
cleanly, but they are not release-ready yet because they contain highlighted
placeholders and describe a broader personal-data model than the proposed
anonymous pilot architecture.

### 5.1 Privacy policy changes to send back for legal review

Complete all placeholders, including:

- controller/company name, company number and ICO registration;
- address, email, telephone and complaints contact;
- hosting/service providers and international-transfer position;
- marketing channels and opt-out method;
- health-consent withdrawal method;
- last-updated date and retention schedule.

Ask the lawyers to tailor or remove statements about collecting:

- full name, date of birth, gender, university email and telephone;
- login credentials and social sign-in identity;
- IP address, location, device identifiers and linked analytics;
- public sources such as Companies House/LinkedIn;
- marketing data;
- third-party health data if it is excluded from the pilot.

Reconcile the policy with the final roles of MindSHED and the University:

- controller, joint controllers, independent controllers or
  controller/processor;
- which entity holds recruitment data;
- which entity operates research ingestion;
- data-sharing/processing agreements;
- UK/EU hosting and subprocessor list;
- specific retention periods by data class;
- what remains possible after irreversible anonymisation.

### 5.2 In-app consent changes to send back for legal/ethics review

The consent draft currently contains organisation/method placeholders and
three distinct choices. The production screen must preserve that granularity:

1. required Terms agreement and Privacy Policy acknowledgement;
2. separate optional marketing consent, default off;
3. separate explicit research-sharing consent, default off;
4. separate explicit health/special-category processing consent, default off.

Do not combine research, health, marketing and Terms into one checkbox. Record
the exact wording/version shown, choice, timestamp and later withdrawal event.

For the pilot, decide whether structured check-ins are health data processed
locally for the service even when research upload is declined. The screen must
make the consequences of each choice clear:

- decline research: local wellbeing app remains usable, no study data upload;
- withdraw research: stop new uploads and request deletion of pseudonymous raw
  records where still identifiable by the participant-held secret;
- withdraw health processing: define which local features must stop or delete;
- already anonymised aggregate data cannot be retrieved or removed.

### 5.3 Governance deliverables

- final protocol and statistical analysis plan;
- University ethics approval through the appropriate route;
- Data Protection Impact Assessment;
- research data management plan;
- Record of Processing Activities;
- anonymisation/pseudonymisation risk assessment;
- data-sharing or data-processing agreements;
- incident and breach-response plan;
- retention/deletion schedule;
- intended-purpose and medical-device qualification assessment;
- approved safeguarding language and escalation boundaries.

## 6. Backend implementation plan

### 6.1 Infrastructure baseline

- UK-region managed PostgreSQL with encryption at rest and point-in-time
  recovery;
- TLS 1.2+ for all traffic;
- separate development, staging and production projects/accounts;
- managed secret store; no production secrets in source or local `.env` files;
- infrastructure as code and peer-reviewed changes;
- private database networking and restricted administrative access;
- MFA and least-privilege roles for developers and researchers;
- encrypted backups with restore drills and documented retention;
- dependency, container and infrastructure scanning in CI;
- WAF/rate limits, request size limits and abuse monitoring without participant
  profiling;
- UK/EU subprocessors documented before use.

### 6.2 Minimal API surface

Implement versioned, schema-validated endpoints along these lines:

- `POST /v1/pilot/enrol` — redeem a non-personal pilot credential and establish
  a pseudonymous record;
- `POST /v1/consents` — record document versions and granular choices;
- `POST /v1/events/batch` — idempotent upload of allowlisted structured events;
- `POST /v1/research/withdraw` — stop research processing and queue deletion;
- `DELETE /v1/participant-data` — delete raw pseudonymous server data using the
  participant-held secret;
- `GET /v1/participant-data/export` — machine-readable copy authenticated by
  the participant-held secret, if the agreed rights model requires it;
- `GET /v1/config` — non-personal study configuration and document versions.

Requirements for every write endpoint:

- narrow runtime schema validation and unknown-field rejection;
- idempotency/replay protection;
- payload and rate limits;
- no request-body logging;
- transactional consent checks before research writes;
- server-generated receipt without returning other participant data;
- versioned migrations and backwards-compatible mobile handling.

### 6.3 Data lifecycle jobs

- expire unredeemed pilot codes;
- delete abandoned enrolments with no consent;
- process withdrawal/deletion queues and produce non-identifying receipts;
- enforce raw-data and backup retention policies;
- generate approved research extracts through repeatable code;
- rotate credentials and keys;
- monitor missing uploads/data-quality issues only at cohort level;
- verify deletion across primary data, replicas, caches and backup expiry.

## 7. Mobile implementation plan

### 7.1 Replace prototype persistence

- move sensitive structured data and journal entries out of AsyncStorage;
- use an encrypted local database or application-level field encryption;
- keep encryption keys in Keychain/Keystore;
- build tested schema migrations and rollback/recovery behaviour;
- separate local-only wellbeing content from the upload queue;
- encrypt the offline upload queue and remove acknowledged records;
- prevent sensitive content from appearing in logs, screenshots/app switcher,
  backups or debug diagnostics where practical.

### 7.2 Anonymous enrolment and consent

- remove the fake static invite path from production builds;
- add valid/invalid/expired/capacity/retry/offline states;
- show final lawyer/ethics-approved documents and granular consent choices;
- store versioned local consent receipts and synchronise the pseudonymous
  consent record;
- make research upload conditional on research and health consent;
- implement withdrawal and deletion using the participant-held secret;
- clearly explain lost-device/recovery limits.

### 7.3 Reliable research synchronisation

- allowlisted typed events only;
- offline-first encrypted queue;
- exponential backoff with jitter;
- idempotent retry and duplicate prevention;
- background/foreground sync compatible with iOS and Android limits;
- visible, calm sync status only where useful;
- no loss of local app functionality during server outage;
- remote schema/version compatibility and required-update handling;
- automated date/timezone/DST tests using relative study periods.

### 7.4 Complete expected mobile functionality

- real local notifications with permission and recovery states;
- real soundscape audio with interruptions, background policy and offline
  availability;
- complete physical-device and licensed-presentation QA for SWEMWBS
  save/resume/history and official scoring;
- production Rive asset/state machine for Bramble;
- final legal/support/about content;
- keep HealthKit/Health Connect optional and local-only unless a future protocol,
  legal basis, DPIA, ethics amendment and API schema explicitly approve a
  different use; complete real-device permission/revocation and store-declaration
  QA before enabling it in a participant build;
- keep reminders local to avoid remote push identifiers unless remote push is
  essential and separately assessed.

## 8. Safeguarding and product-boundary work

- clinical/safeguarding review of every check-in response and care suggestion;
- approved low-mood/high-stress signposting and crisis-resource content;
- no server upload of crisis-resource usage or free text;
- explicit statement that Bramble is not monitoring the participant and the app
  is not an emergency or clinical service;
- documented intended purpose, claims, target users, contraindications and
  limitations;
- MHRA digital mental-health technology qualification/classification review;
- content ownership, versioning and emergency update process;
- university-specific support contacts and out-of-hours behaviour;
- adverse-event/participant complaint handling for the pilot.

## 9. Security and privacy verification

Use OWASP MASVS as the mobile verification baseline across secure storage,
cryptography, authentication, network, platform use, code quality, resilience
and privacy.

Required tests:

- threat model covering outsider, insider, researcher and provider threats;
- verify no direct identifiers in payloads, database, logs, backups or crash
  reports;
- automated tests that fail builds when denylisted fields reach the API;
- TLS/network interception testing;
- local database extraction and lost-device testing;
- credential replay, brute-force, enumeration and rate-limit testing;
- API authorisation and cross-record access testing;
- withdrawal/deletion end-to-end test including backup expiry;
- anonymisation/linkability and small-cell assessment;
- dependency and software-composition analysis;
- static analysis and secret scanning;
- independent penetration test before participant data is collected;
- restore and disaster-recovery exercise;
- incident tabletop exercise.

Triage the currently reported npm dependency advisories individually; do not
apply a breaking forced upgrade without compatibility and regression testing.

## 10. Functional and quality verification

- unit tests for state, scoring, date boundaries, consent and upload rules;
- API contract and database migration tests;
- integration tests for enrolment, consent, offline sync, retry and withdrawal;
- Maestro/Detox end-to-end flows on iOS and Android;
- physical-device matrix including small phones and supported OS minimums;
- VoiceOver, TalkBack, large text, contrast and Reduce Motion review;
- keyboard, interruption, background/foreground and Android system-back tests;
- performance/memory profiling for garden and animation scenes;
- screenshot regression tests for key screens;
- production-build testing with debug menus and preview codes removed;
- 24–48 hour soak test against staging;
- controlled failure drills for offline API, database failover and required
  update.

## 11. App-store and release operations

- production bundle identifiers, signing ownership and recovery access;
- App Store Connect and Play Console organisation accounts;
- publicly accessible, non-editable privacy-policy URL;
- accurate Apple App Privacy details for all first- and third-party SDK data;
- Google Play Data Safety form and Health Apps declaration;
- privacy manifests/SDK declarations and third-party SDK inventory;
- screenshots, metadata, age rating, support URL and wellbeing disclaimers;
- TestFlight and Play closed testing before pilot release;
- staged rollout and tested rollback/kill-switch plan;
- privacy-safe crash monitoring and uptime alerts;
- named on-call owner during the pilot;
- participant support, withdrawal, complaint and incident runbooks;
- pilot close-out, data freeze, anonymisation and deletion procedure.

## 12. Phased delivery roadmap

Durations are planning ranges for an experienced small team and exclude delays
for legal, ethics, procurement or external penetration testing.

| Phase | Indicative duration | Exit gate |
| --- | --- | --- |
| 0. Decisions and approvals | 1–3+ weeks | Protocol dataset, identity model, controller roles, intended purpose and legal/ethics route agreed |
| 1. Data/security design | 1–2 weeks | DPIA draft, data dictionary, threat model, retention and architecture approved |
| 2. Platform foundations | 1–2 weeks | Environments, CI, IaC, secrets, database and monitoring baseline operational |
| 3. Backend and anonymous enrolment | 3–5 weeks | Staging API passes contract, security, deletion and restore tests |
| 4. Mobile secure storage and sync | 3–5 weeks, parallel with phase 3 | iOS/Android enrolment, consent, encrypted local data and offline sync pass E2E |
| 5. Product completion | 2–4 weeks | Notifications, audio, pulse, legal/support content and Bramble production behaviour complete |
| 6. Hardening and independent review | 2–3 weeks | Accessibility, device matrix, anonymisation review and penetration-test findings closed |
| 7. Closed beta and pilot rehearsal | 2 weeks | Staging-to-production rehearsal, support/incident drills and ethics conditions satisfied |
| 8. Pilot release | staged | Store approvals, final go/no-go sign-off and monitored rollout |

Engineering phases 3 and 4 can overlap once phase 1 contracts are frozen. The
likely critical path is governance/ethics and the identity/anonymisation model,
not UI implementation.

## 13. Ownership needed

Assign named people before implementation begins:

- product owner and release decision-maker;
- principal investigator/research data owner;
- controller/data protection owner or DPO contact;
- safeguarding/clinical content reviewer;
- backend/security engineering owner;
- iOS/Android engineering owner;
- infrastructure/incident owner;
- University ethics/governance contact;
- legal contact for final wording and agreements;
- independent penetration-test provider;
- participant support contact during the pilot.

## 14. Pilot go/no-go checklist

Do not collect participant data until all items are evidenced.

- [ ] Final protocol and data dictionary approved.
- [ ] “Anonymous” versus “pseudonymous” wording approved and evidenced.
- [ ] No recruitment-to-study-ID mapping exists.
- [ ] DPIA, ethics approval and research data management plan complete.
- [ ] Final privacy policy, Terms and granular consent have no placeholders.
- [ ] Controller/processor roles and all contracts are signed.
- [ ] UK/EU hosting and subprocessor list approved.
- [ ] Mobile local storage and upload queue are encrypted.
- [ ] Server payloads and logs contain no denylisted identifiers/free text.
- [ ] Consent, decline, withdrawal, export and deletion pass end-to-end.
- [ ] Retention and backup deletion are automated and tested.
- [ ] Safeguarding and intended-purpose reviews are signed off.
- [ ] iOS and Android accessibility/device matrices pass.
- [ ] Independent penetration test has no unresolved high/critical findings.
- [ ] App-store privacy and health declarations match actual behaviour.
- [ ] Incident, breach, participant-support and rollback drills pass.
- [ ] Production build contains no preview codes, debug galleries or test data.
- [ ] Final cross-functional go/no-go decision is recorded.

## 15. First implementation backlog

Complete these in order when execution begins:

1. Freeze the pilot research questions and minimum dataset.
2. Decide whether longitudinal participant-level analysis is required.
3. Approve the no-account/batch-code model or commission a blinded credential
   design.
4. Produce the data dictionary, retention schedule and data-flow diagram.
5. Send the document reconciliation list to lawyers and University governance.
6. Write the DPIA, threat model and anonymisation risk assessment.
7. Define versioned mobile/API schemas and the server denylist.
8. Provision development/staging infrastructure through code.
9. Implement anonymous enrolment, consent receipts and deletion secrets.
10. Replace mobile AsyncStorage for sensitive content with encrypted storage.
11. Implement the encrypted offline upload queue and idempotent batch API.
12. Build researcher export transformations and access controls.
13. Complete remaining mobile integrations and content.
14. Add automated tests, CI security gates and release builds.
15. Run independent security/accessibility testing and a closed pilot rehearsal.
