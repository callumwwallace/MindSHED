#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-west-2}"
PROJECT_NAME="${PROJECT_NAME:-mindshed}"
ENVIRONMENT_NAME="${ENVIRONMENT_NAME:-pilot}"
SERVICE_STACK="${SERVICE_STACK:-${PROJECT_NAME}-${ENVIRONMENT_NAME}-service}"
PILOT_STUDY_CODE="${PILOT_STUDY_CODE:-mindshed-pilot-2026}"
PILOT_CODE_VALID_FROM="${PILOT_CODE_VALID_FROM:?Set PILOT_CODE_VALID_FROM as YYYY-MM-DD}"
PILOT_CODE_EXPIRES_ON="${PILOT_CODE_EXPIRES_ON:?Set PILOT_CODE_EXPIRES_ON as YYYY-MM-DD}"
PILOT_CODE_CAPACITY="${PILOT_CODE_CAPACITY:-100}"

for command in aws jq openssl; do
  command -v "$command" >/dev/null || { echo "$command is required" >&2; exit 1; }
done

if [[ ! "$PILOT_CODE_VALID_FROM" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] \
  || [[ ! "$PILOT_CODE_EXPIRES_ON" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] \
  || [[ ! "$PILOT_CODE_CAPACITY" =~ ^[1-9][0-9]*$ ]]; then
  echo "Pilot dates must use YYYY-MM-DD and capacity must be a positive integer" >&2
  exit 1
fi

stack_output() {
  aws cloudformation describe-stacks \
    --region "$AWS_REGION" \
    --stack-name "$SERVICE_STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue | [0]" \
    --output text
}

KMS_KEY_ARN="$(stack_output DataKmsKeyArn)"
INVITE_CODE="${PILOT_ACCESS_CODE:-$(openssl rand -hex 16 | tr '[:lower:]' '[:upper:]')}"
SECRET_NAME="/${PROJECT_NAME}/${ENVIRONMENT_NAME}/temporary-invite-$(date -u +%Y%m%d%H%M%S)"

SECRET_ARN="$(printf '%s' "$INVITE_CODE" | aws secretsmanager create-secret \
  --region "$AWS_REGION" \
  --name "$SECRET_NAME" \
  --description "Short-lived MindSHED pilot invite used only for one seed task" \
  --kms-key-id "$KMS_KEY_ARN" \
  --secret-string file:///dev/stdin \
  --query ARN \
  --output text)"

cleanup() {
  aws secretsmanager delete-secret \
    --region "$AWS_REGION" \
    --secret-id "$SECRET_ARN" \
    --force-delete-without-recovery >/dev/null 2>&1 || true
}
trap cleanup EXIT

OVERRIDES_JSON="$(jq -nc \
  --arg command_path "apps/api/dist/seed-pilot-code.cjs" \
  --arg secret_arn "$SECRET_ARN" \
  --arg study_code "$PILOT_STUDY_CODE" \
  --arg valid_from "$PILOT_CODE_VALID_FROM" \
  --arg expires_on "$PILOT_CODE_EXPIRES_ON" \
  --arg capacity "$PILOT_CODE_CAPACITY" \
  '{containerOverrides:[{name:"api",command:["node",$command_path],environment:[
    {name:"PILOT_ACCESS_CODE_SECRET_ARN",value:$secret_arn},
    {name:"PILOT_STUDY_CODE",value:$study_code},
    {name:"PILOT_CODE_VALID_FROM",value:$valid_from},
    {name:"PILOT_CODE_EXPIRES_ON",value:$expires_on},
    {name:"PILOT_CODE_CAPACITY",value:$capacity}
  ]}]}')"

export AWS_REGION PROJECT_NAME ENVIRONMENT_NAME SERVICE_STACK OVERRIDES_JSON
"$(dirname "$0")/run-task.sh" seed

echo
echo "Pilot invite code (record it in the approved recruitment material now):"
echo "$INVITE_CODE"
echo
echo "The temporary readable AWS secret has been scheduled for immediate deletion."
echo "Only the keyed invite-code hash remains in PostgreSQL."
