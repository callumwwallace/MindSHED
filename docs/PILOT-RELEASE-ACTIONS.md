# MindSHED pilot release actions

Updated: 12 August 2026  
Owner: MINDSHED WELLNESS LTD (company number 17314926)  
Status: development and controlled QA may continue; research data collection
and production enrollment remain approval-gated.

This is the working checklist for moving the current application into a
university research pilot. A checked engineering item is not a substitute for
legal, ethics, security or store approval.

The proposed change from university-server hosting to AWS, including the draft
ethics wording, pseudonymisation explanation and infrastructure controls, is
recorded in
[`AWS-ETHICS-HOSTING-AMENDMENT-NOTES.md`](./AWS-ETHICS-HOSTING-AMENDMENT-NOTES.md).

## Recommended distribution route

- [ ] Create an organisation-owned Google Play Console account and keep app
  signing, recovery and administrator access under company control.
- [ ] Use Google Play **internal testing** for the development team and early
  device QA.
- [ ] Move the approved research build to a Google Play **closed test** managed
  by a dedicated Google Group or approved tester email list.
- [ ] Give participants an opt-in link and written installation/removal
  instructions; do not make the test publicly searchable.
- [ ] Use TestFlight internal testing and then an approved external group for
  iOS while the pilot remains pre-release.
- [ ] Use direct APK distribution only when Play distribution is genuinely
  unsuitable and the university approves a documented exception covering the
  secure download location, signing certificate, SHA-256 checksum, version
  control, updates, revocation, support and removal.
- [ ] Do not distribute research-enabled APKs by ordinary email, messaging apps
  or public links.

Firebase App Distribution can support short QA rounds, but its release expiry
and pre-release tester workflow make it a weaker default for a longitudinal
participant study.

## Completed or safe to complete in the repository

- [x] Keep research, health-data and marketing choices separate and default
  them off.
- [x] Keep production enrollment locked until the exact legal documents are
  explicitly approved.
- [x] Keep journal entries, free-text notes, support plans and phone-health
  summaries out of the research API.
- [x] Use a strict server allowlist for pseudonymous structured pilot records.
- [x] Provide local export, research withdrawal and deletion journeys.
- [x] Record privacy-notice and consent-document versions with consent events.
- [x] Declare Health, User ID and Other Data Types in the iOS privacy manifest,
  linked to the pseudonymous participant record, not used for tracking.
- [x] Add the verified legal entity and company number to production
  configuration and the in-app legal contact presentation.
- [x] Produce lawyer review copies in `docs/legal-working-drafts` while
  preserving the supplied originals.
- [ ] Generate signed iOS and Android candidates after all production values
  below are configured.
- [ ] Run the full automated verification suite and archive its output against
  the release commit.
- [ ] Complete physical-device testing for HealthKit, Health Connect,
  notification, offline queue, withdrawal, deletion and lost-key behavior.
- [ ] Complete accessibility and independent penetration testing.

## Information to obtain from the university

- [ ] Full study title and plain-language purpose.
- [ ] Principal investigator and monitored participant-contact details.
- [ ] University school/faculty and research sponsor, if different.
- [ ] Ethics committee name, approval letter, reference number and approval
  date.
- [ ] Approved protocol and participant information sheet.
- [ ] Study start/end dates and expected participant duration.
- [ ] Exact participant procedures and frequency of check-ins/SWEMWBS.
- [ ] Foreseeable risks, burdens and discomforts, plus mitigation wording.
- [ ] Expected direct benefits and statement where no direct benefit is
  promised.
- [ ] Compensation, expenses or incentives, if any.
- [ ] Confidentiality, researcher-access and publication arrangements.
- [ ] Complaints route independent of the application team.
- [ ] Withdrawal procedure and treatment of already collected data.
- [ ] Point after which records may be irreversibly anonymised and can no
  longer be removed.
- [ ] Confirmation whether SWEMWBS item responses, totals or both are required.
- [ ] Warwick licensing/presentation/feedback approval for the digital SWEMWBS
  implementation.
- [ ] Approved cohort size, inclusion/exclusion criteria and age range.

## Legal and data-protection decisions

- [ ] Confirm whether MINDSHED WELLNESS LTD and the University of Plymouth are
  independent controllers, joint controllers, or controller and processor.
- [ ] Verify the approved controller correspondence address.
- [ ] Obtain or confirm the applicable ICO registration number.
- [ ] Establish monitored support, privacy and research email addresses.
- [ ] Approve the clean Privacy Policy, Terms of Use, participant information
  and consent documents with no placeholders.
- [ ] Complete and approve the DPIA and research data-management plan.
- [ ] Sign any controller arrangement, data-sharing agreement and processor
  agreements.
- [ ] Identify every production provider and subprocessor, including API,
  database, hosting, backups, logging/monitoring, email and support systems.
- [ ] Record each provider processing country and international-transfer
  safeguard.
- [ ] Approve retention periods for participant records, research events,
  consent history, operational/security logs, backups, exports and anonymised
  research data.
- [ ] Decide whether infrastructure may transiently process IP addresses or
  device/network metadata and ensure policy/store declarations match.
- [ ] Confirm the non-clinical intended purpose and obtain a recorded MHRA or
  equivalent regulatory-position review.
- [ ] Approve safeguarding, crisis wording and escalation responsibilities.

## Production configuration and infrastructure

- [x] Define the proposed AWS London environment as reviewable
  CloudFormation in `infra/aws`, with collection and deletion switches off by
  default. Live resources and their observed configuration remain unverified.
- [x] Add guarded deployment, migration, temporary-secret invite seeding,
  lifecycle and rollback procedures in `infra/aws/scripts` and
  `infra/aws/README.md`.
- [x] Validate the CloudFormation and shell scripts, build the ARM64 production
  container and run the repository verification suite locally on 12 August
  2026. Repeat and archive this evidence from the reviewed release commit.
- [ ] Obtain written ethics/DPIA approval for the change from the originally
  described university server to the final AWS architecture.
- [ ] Complete every production control and unresolved decision in
  `AWS-ETHICS-HOSTING-AMENDMENT-NOTES.md`.
- [ ] Organisation-owned EAS account, project ID and iOS/Android signing access.
- [ ] Approved HTTPS API origin and production hosting region.
- [ ] Public, stable, non-geofenced privacy-policy URL in HTML.
- [ ] Public support URL and the three monitored email addresses.
- [ ] Configure `EXPO_PUBLIC_DATA_CONTROLLER_NAME=MINDSHED WELLNESS LTD`.
- [ ] Configure `EXPO_PUBLIC_DATA_CONTROLLER_COMPANY_NUMBER=17314926`.
- [ ] Configure the approved controller address and ICO registration.
- [ ] Set `EXPO_PUBLIC_LEGAL_DOCUMENTS_APPROVED=true` only after written sign-off
  of the exact versioned documents in the release commit.
- [ ] Keep the local pilot code absent from preview and production.
- [ ] Keep SWEMWBS uploads/feedback disabled until the study and instrument
  approvals explicitly cover them.
- [ ] Deploy a live review backend and create a non-personal reviewer cohort
  code with limited capacity and expiry.
- [ ] Test backup restoration, deletion propagation, backup expiry, incident
  response, minimum-version enforcement, enrolment pause and upload pause.

## Apple submission and pilot evidence

- [ ] Make App Store privacy answers match the approved manifest/data map:
  structured health/wellbeing data, pseudonymous User ID and consent/cohort
  metadata are collected; tracking is not used.
- [ ] Confirm that local journal, notes, support plans and phone-health summaries
  are not declared as server collection.
- [ ] Provide Apple with ethics approval if requested.
- [ ] Complete age rating, HealthKit disclosures, export compliance, screenshots,
  support/privacy URLs and review notes.
- [ ] Give the reviewer a working cohort code and precise enrollment steps.
- [ ] Explain that the build is a controlled health-research cohort and that the
  app itself is complete rather than an unfinished public beta.
- [ ] Pass TestFlight acceptance on the supported physical-device matrix.

## Google Play submission and pilot evidence

- [ ] Complete the Health Apps declaration as a wellbeing/human-subjects
  research application, using the approved ethics details.
- [ ] Complete Data Safety for every closed/open/production track and align it
  with the same approved data map and privacy policy.
- [ ] Upload an Android App Bundle to internal testing, then closed testing.
- [ ] Configure tester eligibility, country availability, app-access
  instructions and the participant opt-in link.
- [ ] Complete content rating, target audience, ads, account/deletion and privacy
  declarations; explain the no-account participant-key model.
- [ ] Run and review the Play pre-launch report across supported Android
  versions and Health Connect states.
- [ ] Retain evidence of tester acceptance, build version and study onboarding
  dates without creating an unnecessary identity-to-research-record mapping.

## Go/no-go rule

The pilot can begin collecting research data only when the final build, exact
versioned participant documents, ethics approval, controller arrangements,
production infrastructure, store declarations and physical-device tests all
describe the same data flow. Until then, use development/internal builds only
with synthetic data and keep research uploads disabled.
