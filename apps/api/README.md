# MindSHED pilot API

The API stores pseudonymous pilot records only. Raw invite codes, participant
names, contact details, device identifiers, journal text and check-in notes do
not belong in this service.

## Local setup

1. Start PostgreSQL with `npm run db:up` from the repository root.
2. Copy `.env.example` to `.env.local` and use this local database URL:
   `postgres://mindshed:mindshed-local-only@127.0.0.1:55432/mindshed`.
3. Export the variables from `.env.local` in your shell or secret manager.
4. Run `npm run db:migrate --workspace @mindshed/api`.
5. Run `npm run db:seed:pilot --workspace @mindshed/api` once for each batch
   code. Only its keyed HMAC digest is stored. `PILOT_CODE_HASH_KEY` must be a
   separate high-entropy secret supplied by the environment's secret manager.
6. Set `PILOT_ENROLMENT_ENABLED=true` and `PILOT_UPLOADS_ENABLED=true` only in
   an approved local/staging environment, then run `npm run api`.

`PILOT_SWEMWBS_UPLOADS_ENABLED` is a separate fail-closed control. Keep it
`false` until the licensed digital presentation, participant-facing feedback,
consent wording and research data dictionary are approved. General pilot
uploads do not override this measure-specific gate.

The production service must use a managed secret store and UK/EU infrastructure
approved by the controller. Do not commit `.env` files or real pilot codes.

## Data lifecycle job

`npm run db:lifecycle --workspace @mindshed/api` is a dry-run by default. It
expires old access-code batches and reports aggregate candidate counts without
printing participant IDs or secrets. Deletion rules remain disabled until their
controller-approved whole-day periods are configured:

- `PILOT_ABANDONED_ENROLMENT_DAYS` removes old records that never recorded any
  consent;
- `PILOT_WITHDRAWN_DATA_DAYS` removes withdrawn pseudonymous records after the
  approved operational period;
- `PILOT_PARTICIPANT_RETENTION_DAYS` removes consented, non-withdrawn records
  after the approved last-seen retention period;
- `PILOT_LIFECYCLE_STUDY_CODE` can restrict a run to one study.

Review the dry-run result first. Set `PILOT_LIFECYCLE_EXECUTE=true` only in the
scheduled production job after the periods and study scope have been approved.
Participant deletion cascades to consent and event rows. An advisory database
lock prevents two lifecycle runs from executing concurrently.
