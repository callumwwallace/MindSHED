# MindSHED pilot release runbook

Status: engineering runbook; external approvals still required  
Updated: 16 July 2026

## 1. Before a release candidate

- Confirm the exact protocol, event dictionary, pulse instrument and document
  versions are approved and match `@mindshed/shared`.
- Confirm the privacy policy, terms, support contacts, retention periods,
  controller roles and hosting/subprocessors contain no placeholders.
- Record ethics, DPIA, safeguarding, penetration-test and accessibility sign-off.
- Confirm the production API, database, backups and monitoring are in the
  approved UK/EU environment and request bodies/source IPs are not retained.
- Configure EAS production `EXPO_PUBLIC_API_URL`; do not configure
  `EXPO_PUBLIC_LOCAL_PILOT_CODE` in preview or production.
- Keep `EXPO_PUBLIC_LEGAL_DOCUMENTS_APPROVED=false` until the exact embedded
  documents and versions have written legal/controller approval. Enable the
  marketing flag only when its separate approval evidence exists. Pulse has no
  production feature flag and must remain absent until it is implemented.

## 2. Required automated evidence

The GitHub `Verify` workflow must pass on the release commit. It runs:

- workspace TypeScript checks, mobile lint and strict research-contract tests;
- Expo Doctor against the pinned SDK-compatible tool;
- production dependency audit with high/critical findings as failures;
- migrations against disposable PostgreSQL;
- pseudonymous enrolment, consent, upload, retry, export, withdrawal and deletion;
- actual HTTP credential, CORS and payload-limit checks;
- dry-run/executed/scoped data-lifecycle tests.

Enable GitHub secret scanning and push protection in repository settings. Treat
Dependabot updates as normal reviewed pull requests; do not force breaking Expo
upgrades to clear a transitive advisory without native regression testing.

## 3. Staging rehearsal

1. Apply migrations using the deployment identity, then revoke unnecessary DDL
   access from the runtime identity.
2. Seed only a non-personal staging batch code using the managed HMAC key.
3. Leave enrolment and uploads paused, verify health/config, then enable each
   switch deliberately.
4. Complete enrolment, granular consent, offline queue/reconnect, duplicate
   upload, export, research withdrawal and deletion on iOS and Android devices.
5. Run the lifecycle job in dry-run mode with the approved study scope and
   retention values. Peer-review the aggregate result before any execute run.
6. Restore a backup into an isolated environment and verify both application
   recovery and the documented backup-expiry/deletion behaviour.
7. Run a 24–48 hour soak test and rehearse API outage, enrolment pause, upload
   pause and minimum-app-version controls.

## 4. Mobile candidate

- Build the `production` profile in `apps/mobile/eas.json` for both platforms.
- Verify the resolved config contains the production identifiers and API URL.
- Check that no local pilot code, debug gallery, fake account, connected-health
  simulation, localhost endpoint or test data is present.
- Test install/upgrade, encrypted local migration, screen lock/lost-device
  behaviour, VoiceOver/TalkBack, large text, Reduce Motion, interruption,
  background/foreground, offline recovery and destructive confirmations.
- Distribute through TestFlight and Play closed testing before any participant
  cohort. Production signing keys and recovery access must be organisation-owned.

## 5. Go/no-go and rollback

The named product, research, privacy, safeguarding, engineering and incident
owners record one go/no-go decision against the checklist in
`PRODUCTION-READINESS-PLAN.md`. A release is no-go if any participant-data gate
is missing evidence.

For rollback, pause enrolment and research uploads first, preserve local app
functionality, withdraw the affected store release/update, communicate through
the approved participant-support route, and follow the incident/breach plan.
Do not collect additional diagnostics that would break the pilot privacy model.
