# MindSHED AWS hosting and pseudonymisation notes

Updated: 12 August 2026  
Status: working evidence for an ethics/DPIA amendment; not approved wording  
Owner: MINDSHED WELLNESS LTD (company number 17314926)

## Purpose

These notes preserve the proposed explanation for changing the MindSHED pilot
from university-server hosting to Amazon Web Services. They describe the
implemented application controls, the AWS controls that still need to be
configured, and the decisions that must be confirmed before real participant
data is collected.

Do not describe the research records as fully anonymous or claim that
re-identification is impossible. The accurate description is:

> The research database is pseudonymised and contains no direct identifiers.
> MindSHED cannot identify a participant from the AWS research database alone.

Pseudonymised information remains personal data. Longitudinal wellbeing data
must continue to be protected as special-category personal data even when no
name or contact information is collected.

## Draft explanation for the ethics committee

> During technical implementation, we decided not to use the originally
> proposed university-hosted server. We propose hosting the MindSHED research
> service using Amazon Web Services in the AWS London region (`eu-west-2`).
>
> This changes the infrastructure provider but does not change the study
> purpose, participant experience, approved research analysis or the categories
> of research information collected. No participant data will be transferred
> to AWS until the hosting amendment, controller/processor arrangements and
> corresponding participant information have been approved.
>
> AWS will provide the underlying managed infrastructure. The controller and
> MindSHED will remain responsible for application configuration, access
> control, data minimisation, retention and governance. The production service
> will use encryption at rest, encrypted backups, TLS encryption in transit,
> private database networking, restricted administrative access,
> multi-factor authentication and audited administrative activity.
>
> The research service is designed around pseudonymisation and data
> minimisation. Participants do not create an account using a name, email
> address, student number or telephone number. On enrolment, the service creates
> a random participant identifier and separate cryptographically random access
> and deletion credentials. Only one-way cryptographic hashes of those
> credentials are retained by the server.
>
> The research API accepts only predefined structured research fields: relative
> study day, mood, energy, perceived pressure, selected support needs, approved
> wellbeing-questionnaire responses and consent history. Its validation schema
> rejects names, email addresses, student numbers, device identifiers, precise
> location, exact client timestamps, journal entries, free-text notes and raw
> Apple Health or Health Connect records.
>
> The information connecting the random participant identifier to the app
> remains encrypted on the participant's device. MindSHED will not maintain a
> name-to-participant-number lookup table on AWS. Any university recruitment or
> contact information will remain in a separate university-controlled system
> and will not be uploaded to AWS.
>
> Researchers accessing approved study exports will therefore see
> pseudonymous longitudinal records rather than participant identities.
> Withdrawal and deletion are authorised using a separate device-held deletion
> credential, allowing the associated AWS record to be withdrawn or deleted
> without asking the participant to identify themselves.
>
> An individual cannot be identified from the AWS research database alone.
> However, because longitudinal wellbeing records may theoretically contribute
> to identification when combined with other information, the dataset will be
> treated as pseudonymous special-category personal data rather than described
> as irreversibly anonymous.

The first paragraph must be amended if the hosting change alters retention,
access, data categories or analysis. Do not state that those matters are
unchanged unless the final approved design confirms it.

## Implemented application-level controls

The current repository implements the following controls independently of the
hosting provider:

- The participant record uses a randomly generated UUID rather than a name,
  email, student number or device identifier.
- The service generates separate 32-byte cryptographically random access and
  deletion secrets. This represents approximately 256 bits of randomness per
  secret.
- The plaintext secrets are returned to the app and retained in device secure
  storage. The server stores SHA-256 hashes, not the original secrets.
- Pilot invitation codes are stored as keyed HMAC digests rather than raw
  codes.
- Credential-bearing API operations use POST requests so credentials do not
  enter query strings or browser history.
- The API uses a strict allowlist and rejects unknown fields.
- Accepted check-in fields are mood, energy, pressure/stress and up to three
  selected support needs.
- The separately gated wellbeing pulse accepts only the approved structured
  questionnaire responses and calculated scores.
- Study timing is represented as a relative study day from 0 to 366 rather
  than an exact client timestamp.
- Names, emails, student IDs, telephone numbers, device IDs, location, journal
  text, check-in notes, support-plan content and raw phone-health records are
  excluded from the research contract.
- Phone-health sleep and step summaries remain on the device and are not
  eligible research events.
- Fastify request logging is disabled. Where application logging is enabled,
  authorisation headers, cookies, bodies, parameters and queries are redacted.
- Research enrolment and uploads fail closed until the legal-document approval
  switch and their separate feature switches are enabled.
- A participant can stop uploads, withdraw from research, export the linked
  record or authorise deletion using device-held credentials.
- The lifecycle job can delete abandoned, withdrawn and expired records once
  the controller-approved retention periods are configured.

These controls reduce identifiability but do not make the data legally
anonymous.

## Meaning of the access and deletion credentials

"High entropy" means that a secret is long and created by a cryptographically
secure random-number generator, making guessing impractical.

- **Access credential:** authenticates approved status, consent, upload and
  export operations for the pseudonymous participant record.
- **Deletion credential:** separately authorises permanent research withdrawal
  and deletion operations.

Participant-facing wording should avoid unnecessary jargon. Ethics/DPIA wording
may state:

> The service generates two separate cryptographically random 256-bit secret
> credentials: one for accessing the pseudonymous research record and one for
> authorising its deletion. The original credentials are held in the phone's
> secure storage; the server retains only one-way cryptographic hashes.

If the device is lost, erased or unavailable, MindSHED cannot recover these
credentials by searching for a participant's name because it has no
identity-to-record lookup. The participant information must explain the effect
this may have on a later record-specific deletion request.

## AWS controls required before production

The proposed technical implementation is now reviewable as code in
[`infra/aws/service.yaml`](../infra/aws/service.yaml) and
[`infra/aws/foundation.yaml`](../infra/aws/foundation.yaml). It specifies ECS
Fargate, an HTTPS Application Load Balancer, private Single-AZ RDS PostgreSQL,
Secrets Manager, a customer-managed KMS key, CloudWatch Logs, CloudTrail, ECR
and AWS Budgets in `eu-west-2`. This is design evidence only: none of these
controls is considered operationally complete until the organisation-owned
account is available and the deployed configuration is inspected and tested.

- [ ] Confirm the production region is AWS London (`eu-west-2`).
- [ ] Use managed Amazon RDS PostgreSQL with encryption enabled at creation.
- [ ] Encrypt RDS storage, automated backups and snapshots with AWS KMS.
- [ ] Put RDS in private subnets with no public database endpoint.
- [ ] Restrict database security groups to the API service only.
- [ ] Require HTTPS/TLS for phone-to-API traffic and certificate validation for
  API-to-RDS traffic.
- [ ] Keep the RDS-generated password and pilot-code HMAC key in AWS Secrets
  Manager; do not assemble a password-bearing database URL or keep production
  secrets in repository files.
- [ ] Use individual administrative identities, MFA and least-privilege IAM;
  prohibit shared administrator credentials.
- [ ] Restrict direct production database access and document any time-limited
  emergency-access process.
- [ ] Enable CloudTrail for administrative activity and protect the audit log.
- [ ] Verify the deployed load-balancer, container and infrastructure logging
  configuration never retains credentials, request bodies, research answers
  or participant UUIDs. The proposed pilot design has ALB access logs disabled
  and does not include WAF.
- [ ] Approve and enforce a short operational/security-log retention period.
- [ ] Configure encrypted backup retention and test restoration.
- [ ] Apply deletion periods to primary data, backups and derived exports.
- [ ] Keep development, staging and production accounts/data separated.
- [ ] Monitor security alerts without creating unnecessary participant
  telemetry.
- [ ] Document patching, vulnerability management, incident response, access
  revocation and breach notification responsibilities.
- [ ] Complete an independent penetration test before the research pilot.

AWS uses a shared-responsibility model. AWS protects the underlying cloud
infrastructure; the AWS account owner remains responsible for IAM, networking,
encryption settings, application security, data classification and retention.
Using AWS is therefore not automatically equivalent to university hosting.
Equivalence must be demonstrated through the final configured controls and
governance evidence.

## IP addresses and infrastructure metadata

Do not state that AWS receives no IP address. Network services necessarily
process an IP address to deliver a request, and load-balancer, WAF or other
access logs may retain it unless deliberately configured otherwise.

Proposed wording:

> IP addresses are processed transiently for network delivery and security but
> are not written to the MindSHED research database or used to identify
> participants. Infrastructure logging will be minimised, access-restricted
> and retained only for an approved security period.

Before using this wording, inspect the actual AWS architecture and confirm
whether CloudFront, API Gateway, an Application Load Balancer, AWS WAF, VPC Flow
Logs or another service records source IP addresses. The privacy notice, DPIA
and retention schedule must match the deployed configuration.

## Separation from recruitment information

The strength of the pseudonymisation depends on how participant invitations are
issued:

- A shared cohort code creates no intended code-to-person mapping in AWS.
- Individually assigned codes can become identifying if the university retains
  a code-to-person allocation list.
- Enrolment time, small cohorts and distinctive response patterns can increase
  singling-out risk even without a direct identifier.

If the university retains recruitment or contact information, it must remain
separate from AWS research records, under separate access controls. The ethics
amendment and DPIA must identify who holds that additional information and
whether the university could use it to re-identify a participant. Researchers
should receive only the minimum pseudonymous dataset required for analysis.

## Decisions and evidence still required

- [ ] Exact AWS account owner and billing/legal entity.
- [ ] University/controller approval of the exact compute, ingress, database,
  logging, backup and secrets services defined in `infra/aws`.
- [ ] Whether the University of Plymouth, MINDSHED WELLNESS LTD or both are
  controllers, and whether either acts as a processor.
- [ ] Data-processing/controller agreement between the university and
  MindSHED.
- [ ] Applicable AWS Data Processing Addendum and subprocessor/transfer review.
- [ ] Controller-approved correspondence address, privacy contact and ICO
  registration details.
- [ ] Named production administrators, researchers and support roles.
- [ ] Research-record, consent, withdrawal, security-log, backup and export
  retention periods.
- [ ] Treatment of records already collected when a participant withdraws.
- [ ] Whether pilot codes are shared by cohort or individually allocated.
- [ ] Whether any recruitment list can be combined with enrolment timing or
  another field to infer the random participant number.
- [ ] Approved lost-device and deletion-request procedure.
- [ ] Ethics committee name, reference number and written approval of the
  hosting amendment.
- [ ] Updated DPIA, data-management plan, privacy notice and participant
  information/consent versions.
- [ ] Backup-restore, deletion, access-control and incident-response evidence.

## Go/no-go statement

Changing the approved host from a university server to AWS should be handled as
an ethics and data-protection amendment. AWS may be prepared and tested with
synthetic data, but research enrolment and real participant uploads must remain
disabled until the amendment, controller/processor arrangements, final
participant documents and deployed security controls are approved and aligned.

## Reference material

- ICO, pseudonymisation guidance:
  <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/>
- ICO, effective anonymisation and the motivated-intruder test:
  <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/how-do-we-ensure-anonymisation-is-effective/>
- AWS, shared-responsibility model:
  <https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/shared-responsibility.html>
- AWS, Amazon RDS encryption:
  <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html>
