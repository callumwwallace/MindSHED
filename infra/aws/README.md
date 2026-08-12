# MindSHED AWS pilot deployment

This directory defines the proposed AWS London (`eu-west-2`) environment for
the MindSHED pilot. It is designed to match the AWS ethics amendment notes in
`docs/AWS-ETHICS-HOSTING-AMENDMENT-NOTES.md`.

Creating these stacks incurs AWS charges. Preparing and reviewing the files
does not create any AWS resources.

## Architecture

- Amazon ECR stores immutable, scanned ARM64 API images.
- An internet-facing Application Load Balancer terminates HTTPS using an AWS
  Certificate Manager certificate and redirects HTTP to HTTPS.
- A small ECS Fargate task runs the existing Fastify API. Its security group
  accepts port 3000 only from the load balancer.
- The task has a public IP for outbound AWS service access, avoiding a costly
  NAT Gateway. It has no public inbound route through its security group.
- Amazon RDS PostgreSQL is placed in two private data subnets, has no public
  endpoint and accepts port 5432 only from the API task security group.
- A customer-managed KMS key encrypts RDS storage, backups, snapshots, the RDS
  password secret, the pilot-code HMAC key and application logs.
- RDS generates and rotates the database password in Secrets Manager. ECS
  injects its username and password as separate environment variables.
- CloudWatch retains deliberately redacted application logs for 14 days by
  default. ALB access logging is disabled so source IP addresses are not
  retained there.
- A regional CloudTrail trail records administrative management events in a
  private encrypted S3 bucket and expires them after 90 days by default.
- A disabled-by-default EventBridge rule can run the approved lifecycle job
  daily.
- AWS Budgets emails at 50%, 80% and forecast 100% of the monthly budget.

This is a low-cost single-region pilot design, not a highly available
production architecture. RDS is Single-AZ and the API defaults to one task.
Backups protect recovery, but an Availability Zone outage may interrupt the
pilot. That trade-off must be accepted in the DPIA/data-management plan.

## Security properties

- No secret value or AWS account identifier is committed to the repository.
- Research enrolment, uploads, SWEMWBS uploads and lifecycle deletion all
  default to `false`.
- CloudFormation refuses to enable collection unless the legal-document flag
  is also true.
- Lifecycle deletion cannot be enabled unless all three retention periods are
  supplied.
- The API service starts at zero tasks during initial deployment. Database
  migrations must succeed before the service is scaled up.
- The deployment refuses regions other than London and refuses a dirty Git
  tree unless explicitly allowed for synthetic staging.
- The RDS database, KMS key, secrets, audit bucket and log group are retained
  or snapshotted if a stack is removed.
- Load-balancer and RDS deletion protection are deliberately enabled. Disable
  them through a reviewed change before attempting to remove a stack.

## Account preparation

Do these in the organisation-owned AWS account before running the scripts:

1. Protect the AWS root user with MFA and do not create root access keys.
2. Create named administrator access through IAM Identity Center with MFA.
3. Select the paid account plan so approved services remain available when
   credits end. Credits are still applied automatically to eligible usage.
4. Set alternate billing, operations and security contacts.
5. Create a public Route 53 hosted zone for the approved domain and delegate
   its name servers at the domain registrar.
6. Install AWS CLI v2, Docker Desktop and `jq` locally, then authenticate with
   `aws configure sso`.
7. Confirm the account and region with `aws sts get-caller-identity` and
   `aws configure get region`.

Do not create long-lived IAM user access keys merely to run this deployment.

## First synthetic deployment

Set environment-specific values:

```sh
export AWS_REGION=eu-west-2
export PROJECT_NAME=mindshed
export ENVIRONMENT_NAME=pilot
export API_DOMAIN_NAME=api.example.org
export HOSTED_ZONE_ID=Z123456789EXAMPLE
export ALERT_EMAIL=operations@example.org
```

Leave every collection switch at its default `false`, then run:

```sh
infra/aws/scripts/deploy.sh
```

The script validates both templates, creates the ECR repository, builds and
pushes an immutable ARM64 image, creates the service infrastructure with zero
API tasks, runs database migrations, scales the API to one task and verifies
`https://<domain>/ready`.

The first RDS and certificate deployment can take several minutes. Certificate
creation will wait indefinitely if the specified Route 53 hosted zone is not
authoritative for the API domain.

## One-time pilot invite code

Do this only after the study dates, capacity and recruitment route are
approved:

```sh
export PILOT_CODE_VALID_FROM=2026-09-01
export PILOT_CODE_EXPIRES_ON=2026-12-31
export PILOT_CODE_CAPACITY=100
export PILOT_STUDY_CODE=mindshed-pilot-2026
infra/aws/scripts/seed-pilot-code.sh
```

The script generates a readable code locally, places it in a KMS-encrypted
temporary Secrets Manager secret, lets one ECS task retrieve it, stores only
its keyed HMAC digest in PostgreSQL and then requests immediate deletion of the
temporary secret. The code is printed locally once for the approved recruitment
material. It is not placed in task overrides, CloudFormation parameters or
CloudWatch logs.

If the displayed code is lost, generate and seed a new code. Do not attempt to
recover it from the database.

## Enabling research collection

Only after the university has approved the AWS amendment, exact participant
documents, DPIA, roles, retention and data flow, redeploy with the approved
values, for example:

```sh
export LEGAL_DOCUMENTS_APPROVED=true
export ENABLE_PILOT_ENROLMENT=true
export ENABLE_PILOT_UPLOADS=true
export ENABLE_SWEMWBS_UPLOADS=false
infra/aws/scripts/deploy.sh
```

The SWEMWBS switch remains independently off until instrument licensing,
presentation, feedback and research uploads are all approved.

Enable lifecycle deletion only after all periods are approved:

```sh
export ENABLE_LIFECYCLE_DELETION=true
export ABANDONED_ENROLMENT_DAYS=30
export WITHDRAWN_DATA_DAYS=30
export PARTICIPANT_RETENTION_DAYS=365
infra/aws/scripts/deploy.sh
```

Before enabling execution, run the lifecycle task with deletion disabled and
review its aggregate dry-run result:

```sh
infra/aws/scripts/run-task.sh lifecycle
```

## Mobile connection

After the synthetic API passes testing, configure the mobile preview/production
environment with:

```text
EXPO_PUBLIC_API_URL=https://the-approved-api-domain
```

Do not embed AWS credentials or secret ARNs in any `EXPO_PUBLIC_*` variable.

## Operational checks before real data

- Confirm RDS reports `Publicly accessible: No` and storage encryption enabled.
- Confirm only the API security group can reach database port 5432.
- Confirm the ECS task cannot be reached directly from the internet.
- Confirm the `/ready` route works only through HTTPS and HTTP redirects.
- Confirm application logs contain no request bodies, identifiers, credentials
  or wellbeing answers.
- Inspect CloudTrail, ECS, RDS, Secrets Manager, KMS and budget configuration.
- Restore the database to a separate test instance and document the result.
- Test participant export, withdrawal and deletion with synthetic records.
- Confirm deleted records expire from backups under the approved schedule.
- Review ECR scan results and resolve high/critical runtime findings.
- Complete independent penetration testing and university sign-off.

## Rollback and incident controls

- Set `ENABLE_PILOT_ENROLMENT=false` and `ENABLE_PILOT_UPLOADS=false`, then
  redeploy to stop new data operations without removing local app features.
- Set `API_DESIRED_COUNT=0` and redeploy to stop the API completely.
- Do not delete KMS keys, Secrets Manager secrets, RDS or retained audit/log
  storage during an incident.
- Rotate the RDS managed password and pilot HMAC key only through an approved
  incident procedure; changing the HMAC key invalidates existing invite codes.
- Preserve CloudTrail evidence and follow the approved breach-notification
  process.

## Files

- `foundation.yaml`: retained ECR repository.
- `service.yaml`: network, ECS, RDS, KMS, secrets, HTTPS, audit and budget.
- `scripts/deploy.sh`: guarded build, migration and deployment workflow.
- `scripts/run-task.sh`: one-off migration/lifecycle/task runner.
- `scripts/seed-pilot-code.sh`: short-lived-secret pilot-code seeding workflow.
