# MindSHED pilot data dictionary

Status: engineering draft for protocol, legal, ethics and DPIA approval  
Schema: 1  
Updated: 21 July 2026

This document describes the fields the current research ingestion service can
accept. It is an allowlist, not permission to begin collection. Researchers and
the controller must remove any field that is not required by the final protocol
and approve purposes, lawful bases, retention and recipients before release.

## Record and control data

| Field | Values | Purpose | Sensitivity and treatment |
| --- | --- | --- | --- |
| participant ID | Random UUID | Group one participant's records and exercise export/deletion rights | Pseudonymous identifier; never mapped to recruitment identity |
| participant token hash | SHA-256 digest | Authenticate uploads and participant export | Server stores digest only; raw token remains in device SecureStore |
| deletion-secret hash | SHA-256 digest | Authenticate withdrawal/deletion | Server stores digest only; separate from upload token |
| study code | Approved cohort identifier | Separate studies/configuration | Batch-level value; not an individual invite code |
| schema version | `1` | Decode and validate records | Non-personal configuration |
| created/last-seen/withdrawn day | UTC calendar date | Retention and lifecycle administration | Coarse date only; no time of day |

## Batch pilot credential

| Field | Values | Purpose | Sensitivity and treatment |
| --- | --- | --- | --- |
| code hash | Keyed HMAC-SHA-256 digest | Redeem a shared/batch credential | Raw code is never stored in PostgreSQL; key stays in the managed secret store |
| valid-from / expiry | Calendar dates | Prevent early or late enrolment | Batch-level configuration |
| capacity / redemption count | Positive integers | Enforce ethics-approved cohort capacity | Aggregate only; no participant mapping |
| active | Boolean | Suspend a compromised or withdrawn batch | Operational kill switch |

## Consent record

| Field | Values | Purpose | Sensitivity and treatment |
| --- | --- | --- | --- |
| privacy notice version | `privacy-2026-06-26-v2` | Evidence which notice was presented | Pseudonymous consent audit |
| consent document version | `pilot-consent-2026-07-01-v1` | Evidence which wording was presented | Pseudonymous consent audit |
| Terms accepted | `true` | Required app-use agreement | Stored separately from optional choices |
| research consent | Boolean | Permit or stop research processing | Default off; required for event ingestion |
| health-data consent | Boolean | Explicit condition for wellbeing data | Default off; required for event ingestion |
| marketing consent | Boolean | Optional communication preference | Default off; cannot be used without an approved separate contact mechanism |
| recorded/superseded time | Server timestamp | Consent audit and ordering | Access restricted; excluded from research event extracts unless approved |

## Research events

All events contain a random idempotency UUID, schema version and relative study
day from 0 to 366. At most one event of each kind is stored per participant and
relative day; a same-day edit replaces that logical event. The request carries
a semantic app version for minimum-version enforcement, but the service does
not store it. The service does not accept a client timestamp.

### Check-in

| Field | Values | Proposed purpose |
| --- | --- | --- |
| mood | Integer 1–5 | Approved longitudinal wellbeing indicator |
| energy | Integer 0–10 | Approved longitudinal capacity indicator |
| stress | Integer 0–10 | Approved longitudinal pressure indicator |
| selected needs | Up to three of calm, grounding, focus, rest, connection | Evaluate coarse support needs without free text |

### SWEMWBS wellbeing pulse — implemented locally, upload approval-gated

| Field | Values | Proposed purpose |
| --- | --- | --- |
| instrument | `SWEMWBS` | Identifies the licensed seven-item measure |
| instrument version | `swemwbs-7-en-gb-v1` | Prevents silent wording/scoring changes |
| responses | Seven integers, each 1–5 | Approved item-level research outcome data without item text |
| raw score | Integer 7–35 | Sum of the seven complete responses |
| metric score | Official transformed score 7.00–35.00 | Interval-scale outcome used by the approved analysis plan |

The licensed flow and official score transformation are implemented in the
app. Research upload is independently fail-closed in the mobile build and API
until the participant wording, Warwick digital presentation/feedback review,
safeguarding response and statistical analysis plan are approved.

## Hard denylist

The API schemas reject unknown fields. Do not add:

- name, email, phone, student ID, date of birth or recruitment identifier;
- raw invite code, IP address, precise location or exact event timestamp;
- advertising/vendor/device identifiers, push tokens or device name;
- journal entries, check-in notes, support-plan content or other free text;
- crisis-resource interaction, risk inference or safeguarding contact;
- raw HealthKit, Health Connect, wearable, audio, photo or file data.

This also excludes derived phone-health data: daily step totals, sleep duration,
sleep intervals, health permission state, device source, correlations and any
phone-health observation shown by the app. The optional phone-health feature is
an on-device personalisation feature, not a pilot research source. Its 21-day
daily summaries remain in the encrypted local store and are removed by
disconnect or local-data deletion.

## Decisions required before approval

- Confirm whether every check-in field is necessary for the statistical plan.
- Confirm whether the approved research extract requires item responses or
  only raw/metric totals, then minimise the upload schema accordingly.
- Set retention for codes, raw pseudonymous records, consent history, backups
  and approved anonymised extracts.
- Name the controller, processors, recipients and approved hosting region.
- Define the withdrawal cut-off after irreversible anonymisation.
- Define small-cell suppression and identifier rotation for researcher exports.
