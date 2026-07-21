# MindSHED pilot API deployment runbook

Updated: 21 July 2026
Status: executable application runbook; infrastructure/provider approval is external

## 1. Preconditions

- Approved UK/EU environment, processor list, network/log retention and data
  residency are recorded in the DPIA and participant notice.
- Development, staging and production accounts/projects are separate.
- Runtime database identity has only required DML access; migration identity is
  separate and temporary.
- TLS certificate, private database networking, encrypted storage/backups,
  point-in-time recovery, MFA, least privilege and secret rotation are enabled.
- Proxy/CDN/load-balancer access logs exclude request bodies, credentials,
  participant IDs and source IP retention beyond the approved minimum.
- An organisation-owned registry scans the image/SBOM and blocks unresolved
  high/critical findings.

## 2. Required secrets and configuration

| Value | Treatment |
| --- | --- |
| `DATABASE_URL` | Secret; PostgreSQL runtime connection, never logged |
| `DATABASE_SSL_MODE` | `verify-full` preferred; production rejects `disable` |
| `PILOT_CODE_HASH_KEY` | Independent base64url/hex encoding of at least 32 random bytes; rotate through an approved code migration process |
| `PILOT_ACCESS_CODE` | Seed-job secret only; never configure on the long-running API |
| `PILOT_STUDY_CODE` and code dates/capacity | Approved study configuration |
| `PILOT_LEGAL_DOCUMENTS_APPROVED` | False until exact document versions are signed |
| enrolment/upload/SWEMWBS switches | Independent kill switches; start false |
| `PILOT_MINIMUM_APP_VERSION` | Semantic version accepted by the API |
| participant event/consent limits | Approved bounded retention controls |
| `CORS_ORIGIN` | Comma-separated HTTPS origins only; omit if no approved browser client |
| `TRUST_PROXY` | True only behind a trusted proxy that overwrites forwarding headers |
| lifecycle retention values | Controller-approved periods; lifecycle execute remains false by default |

Use `apps/api/.env.example` as the canonical variable inventory. Store values in
the provider secret manager, not repository variables, image layers or shell
history.

## 3. Build and promote

1. Select a reviewed release commit whose `Verify` workflow passed.
2. Build `apps/api/Dockerfile` once and record its immutable registry digest and
   dependency/security scan evidence.
3. Promote that same digest from staging to production; do not rebuild between
   environments.
4. Keep production enrolment and all upload switches false.
5. Before migration `0004`, run these read-only checks. Every query must return
   zero rows; stop and obtain research/data-owner instructions rather than
   silently discarding an older record:

   ```sql
   select participant_id, relative_day, kind, count(*)
   from pilot_events group by participant_id, relative_day, kind having count(*) > 1;
   select event_id, kind from pilot_events where kind not in ('checkin', 'pulse');
   select id from pilot_consents where health_data_consent and not research_consent;
   ```

6. From an approved migration job with the migration identity, run:

   ```sh
   npm ci
   DATABASE_URL=... DATABASE_SSL_MODE=verify-full \
     npm run db:migrate --workspace @mindshed/api
   ```

7. Start the API image as a non-root workload with read-only root filesystem
   where the platform permits, resource limits and at least two instances after
   migration compatibility is confirmed.
8. Require `/health` for liveness and `/ready` for traffic readiness. `/ready`
   must remain 503 until the database and required current migration are
   reachable.
9. Verify response security headers, payload limit, CORS, rate limit and that
   secrets/request bodies are absent from application and provider logs.

The runtime image deliberately does not contain migration tooling or source;
migrations are a separate controlled release action.

## 4. Stage the pilot switches

1. Seed a staging batch code with synthetic values and test the complete flow.
2. In production, seed the approved batch code using the job identity. Confirm
   only its HMAC is stored.
3. Enable legal approval only after matching mobile/API versions and evidence
   are signed.
4. Enable enrolment first. Monitor only aggregate error/health signals.
5. Enable structured check-in uploads after consent/export/deletion checks.
6. Enable SWEMWBS separately only when its exact protocol, presentation,
   feedback and analysis approvals are complete.
7. Keep marketing off unless a separately approved contact mechanism exists.

## 5. Release verification

- Enrol with a synthetic batch code and inspect the database through a
  restricted audit query: no raw code or direct identifier should exist.
- Record decline and opt-in, upload one check-in, edit it and confirm exactly one
  logical event for that participant/day/kind.
- Export through the participant credential and confirm no server receipt time,
  free text, phone-health data or infrastructure metadata is present.
- Withdraw twice and confirm one withdrawal marker; then delete and confirm
  participant, consents and events cascade away.
- Pause uploads and enrolment independently and verify local app use continues.
- Raise the minimum app version and verify older clients block queue upload.
- Run the lifecycle job in dry-run mode and peer-review aggregate counts before
  any approved execute run.

## 6. Backup and deletion drill

1. Restore a production-format encrypted backup into an isolated account.
2. Verify application readiness and a synthetic participant lifecycle.
3. Delete that participant in primary production, then record how replicas,
   caches and backup expiry satisfy the signed schedule.
4. Confirm the restored copy cannot become an ungoverned research dataset and
   is destroyed after the exercise.
5. Record recovery-point and recovery-time results and owner sign-off.

## 7. Incident and rollback

1. Set enrolment, general uploads and SWEMWBS uploads false. This is the first
   containment action and preserves local wellbeing use.
2. Remove affected instances from traffic while preserving only approved,
   privacy-safe forensic evidence.
3. Rotate compromised infrastructure secrets. Participant credential response
   must follow the approved protocol because there is no identity lookup.
4. Roll back to the last compatible image digest; never roll back a destructive
   migration without a reviewed forward-recovery plan.
5. Use the minimum-version control for a mandatory mobile update and pause the
   affected store rollout if needed.
6. Notify controller, security, research and participant-support owners under
   the signed incident/breach plan.

## 8. Pilot close-out

- Close enrolment and uploads at the approved date.
- Export only the approved, access-controlled research dataset and perform the
  documented anonymisation/small-cell assessment.
- Run approved retention actions, verify backup expiry and revoke batch/runtime
  credentials.
- Archive code, image digests, migrations, schema/data-dictionary versions,
  approvals and aggregate lifecycle evidence under the research record policy.
