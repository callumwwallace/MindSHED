#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-west-2}"
PROJECT_NAME="${PROJECT_NAME:-mindshed}"
ENVIRONMENT_NAME="${ENVIRONMENT_NAME:-pilot}"
FOUNDATION_STACK="${FOUNDATION_STACK:-${PROJECT_NAME}-${ENVIRONMENT_NAME}-foundation}"
SERVICE_STACK="${SERVICE_STACK:-${PROJECT_NAME}-${ENVIRONMENT_NAME}-service}"
API_DOMAIN_NAME="${API_DOMAIN_NAME:?Set API_DOMAIN_NAME, for example api.mindshedwellness.co.uk}"
HOSTED_ZONE_ID="${HOSTED_ZONE_ID:?Set the Route 53 public HOSTED_ZONE_ID}"
ALERT_EMAIL="${ALERT_EMAIL:?Set a monitored ALERT_EMAIL}"
API_DESIRED_COUNT="${API_DESIRED_COUNT:-1}"
LEGAL_DOCUMENTS_APPROVED="${LEGAL_DOCUMENTS_APPROVED:-false}"
ENABLE_PILOT_ENROLMENT="${ENABLE_PILOT_ENROLMENT:-false}"
ENABLE_PILOT_UPLOADS="${ENABLE_PILOT_UPLOADS:-false}"
ENABLE_SWEMWBS_UPLOADS="${ENABLE_SWEMWBS_UPLOADS:-false}"
MINIMUM_APP_VERSION="${MINIMUM_APP_VERSION:-1.0.0}"
STUDY_CODE="${STUDY_CODE:-mindshed-pilot-2026}"
ENABLE_LIFECYCLE_DELETION="${ENABLE_LIFECYCLE_DELETION:-false}"
ABANDONED_ENROLMENT_DAYS="${ABANDONED_ENROLMENT_DAYS:-}"
WITHDRAWN_DATA_DAYS="${WITHDRAWN_DATA_DAYS:-}"
PARTICIPANT_RETENTION_DAYS="${PARTICIPANT_RETENTION_DAYS:-}"
MONTHLY_BUDGET_USD="${MONTHLY_BUDGET_USD:-50}"

REPOSITORY_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
FOUNDATION_TEMPLATE="$REPOSITORY_ROOT/infra/aws/foundation.yaml"
SERVICE_TEMPLATE="$REPOSITORY_ROOT/infra/aws/service.yaml"

for command in aws docker git jq curl; do
  command -v "$command" >/dev/null || { echo "$command is required" >&2; exit 1; }
done

if [[ "$AWS_REGION" != "eu-west-2" ]]; then
  echo "Refusing to deploy outside AWS London (eu-west-2)" >&2
  exit 1
fi

if [[ -n "$(git -C "$REPOSITORY_ROOT" status --porcelain)" && "${ALLOW_DIRTY:-false}" != "true" ]]; then
  echo "The repository has uncommitted changes. Commit the reviewed release or set ALLOW_DIRTY=true for synthetic staging only." >&2
  exit 1
fi

CALLER_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
echo "Deploying to AWS account $CALLER_ACCOUNT in $AWS_REGION"

aws cloudformation validate-template --region "$AWS_REGION" --template-body "file://$FOUNDATION_TEMPLATE" >/dev/null
aws cloudformation validate-template --region "$AWS_REGION" --template-body "file://$SERVICE_TEMPLATE" >/dev/null

aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$FOUNDATION_STACK" \
  --template-file "$FOUNDATION_TEMPLATE" \
  --parameter-overrides ProjectName="$PROJECT_NAME" EnvironmentName="$ENVIRONMENT_NAME" \
  --tags Project="$PROJECT_NAME" Environment="$ENVIRONMENT_NAME" ManagedBy=CloudFormation

REPOSITORY_URI="$(aws cloudformation describe-stacks \
  --region "$AWS_REGION" \
  --stack-name "$FOUNDATION_STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='RepositoryUri'].OutputValue | [0]" \
  --output text)"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$REPOSITORY_ROOT" rev-parse --short=12 HEAD)}"
IMAGE_URI="$REPOSITORY_URI:$IMAGE_TAG"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${REPOSITORY_URI%%/*}"

docker buildx build \
  --platform linux/arm64 \
  --file "$REPOSITORY_ROOT/apps/api/Dockerfile" \
  --tag "$IMAGE_URI" \
  --provenance=true \
  --sbom=true \
  --push \
  "$REPOSITORY_ROOT"

deploy_service() {
  local desired_count="$1"
  aws cloudformation deploy \
    --region "$AWS_REGION" \
    --stack-name "$SERVICE_STACK" \
    --template-file "$SERVICE_TEMPLATE" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
      ProjectName="$PROJECT_NAME" \
      EnvironmentName="$ENVIRONMENT_NAME" \
      ContainerImageUri="$IMAGE_URI" \
      ApiDomainName="$API_DOMAIN_NAME" \
      HostedZoneId="$HOSTED_ZONE_ID" \
      AlertEmail="$ALERT_EMAIL" \
      ApiDesiredCount="$desired_count" \
      LegalDocumentsApproved="$LEGAL_DOCUMENTS_APPROVED" \
      EnablePilotEnrolment="$ENABLE_PILOT_ENROLMENT" \
      EnablePilotUploads="$ENABLE_PILOT_UPLOADS" \
      EnableSwemwbsUploads="$ENABLE_SWEMWBS_UPLOADS" \
      MinimumAppVersion="$MINIMUM_APP_VERSION" \
      StudyCode="$STUDY_CODE" \
      EnableLifecycleDeletion="$ENABLE_LIFECYCLE_DELETION" \
      AbandonedEnrolmentDays="$ABANDONED_ENROLMENT_DAYS" \
      WithdrawnDataDays="$WITHDRAWN_DATA_DAYS" \
      ParticipantRetentionDays="$PARTICIPANT_RETENTION_DAYS" \
      MonthlyBudgetUsd="$MONTHLY_BUDGET_USD" \
    --tags Project="$PROJECT_NAME" Environment="$ENVIRONMENT_NAME" ManagedBy=CloudFormation
}

deploy_service 0

export AWS_REGION PROJECT_NAME ENVIRONMENT_NAME SERVICE_STACK
"$REPOSITORY_ROOT/infra/aws/scripts/run-task.sh" migrate

deploy_service "$API_DESIRED_COUNT"

API_URL="https://$API_DOMAIN_NAME"
if [[ "$API_DESIRED_COUNT" -gt 0 ]]; then
  for _ in {1..30}; do
    if curl --fail --silent --show-error "$API_URL/ready" >/dev/null; then
      echo "MindSHED API is ready at $API_URL"
      exit 0
    fi
    sleep 10
  done
  echo "Deployment completed but the readiness endpoint did not become healthy in five minutes" >&2
  exit 1
fi

echo "Infrastructure and migrations are ready; API desired count remains zero."
