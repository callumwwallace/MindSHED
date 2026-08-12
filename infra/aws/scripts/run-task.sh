#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-}"
AWS_REGION="${AWS_REGION:-eu-west-2}"
PROJECT_NAME="${PROJECT_NAME:-mindshed}"
ENVIRONMENT_NAME="${ENVIRONMENT_NAME:-pilot}"
SERVICE_STACK="${SERVICE_STACK:-${PROJECT_NAME}-${ENVIRONMENT_NAME}-service}"

case "$ACTION" in
  migrate)
    COMMAND_PATH="apps/api/dist/migrate.cjs"
    ;;
  seed)
    COMMAND_PATH="apps/api/dist/seed-pilot-code.cjs"
    ;;
  lifecycle)
    COMMAND_PATH="apps/api/dist/run-data-lifecycle.cjs"
    ;;
  *)
    echo "Usage: $0 <migrate|seed|lifecycle>" >&2
    exit 2
    ;;
esac

for command in aws jq; do
  command -v "$command" >/dev/null || { echo "$command is required" >&2; exit 1; }
done

stack_output() {
  aws cloudformation describe-stacks \
    --region "$AWS_REGION" \
    --stack-name "$SERVICE_STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue | [0]" \
    --output text
}

CLUSTER_ARN="$(stack_output ClusterArn)"
TASK_DEFINITION_ARN="$(stack_output TaskDefinitionArn)"
SECURITY_GROUP_ID="$(stack_output ApiSecurityGroupId)"
SUBNET_IDS="$(stack_output PublicSubnetIds)"
LOG_GROUP_NAME="$(stack_output ApiLogGroupName)"

if [[ -n "${OVERRIDES_JSON:-}" ]]; then
  OVERRIDES="$OVERRIDES_JSON"
else
  OVERRIDES="$(jq -nc --arg command_path "$COMMAND_PATH" '{containerOverrides:[{name:"api",command:["node",$command_path]}]}')"
fi

NETWORK_CONFIGURATION="awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}"

TASK_ARN="$(aws ecs run-task \
  --region "$AWS_REGION" \
  --cluster "$CLUSTER_ARN" \
  --task-definition "$TASK_DEFINITION_ARN" \
  --launch-type FARGATE \
  --platform-version LATEST \
  --count 1 \
  --network-configuration "$NETWORK_CONFIGURATION" \
  --overrides "$OVERRIDES" \
  --query 'tasks[0].taskArn' \
  --output text)"

if [[ -z "$TASK_ARN" || "$TASK_ARN" == "None" ]]; then
  echo "AWS did not start the task" >&2
  exit 1
fi

echo "Started $ACTION task: $TASK_ARN"
aws ecs wait tasks-stopped --region "$AWS_REGION" --cluster "$CLUSTER_ARN" --tasks "$TASK_ARN"

EXIT_CODE="$(aws ecs describe-tasks \
  --region "$AWS_REGION" \
  --cluster "$CLUSTER_ARN" \
  --tasks "$TASK_ARN" \
  --query "tasks[0].containers[?name=='api'].exitCode | [0]" \
  --output text)"

TASK_ID="${TASK_ARN##*/}"
LOG_STREAM="api/api/$TASK_ID"
aws logs get-log-events \
  --region "$AWS_REGION" \
  --log-group-name "$LOG_GROUP_NAME" \
  --log-stream-name "$LOG_STREAM" \
  --query 'events[].message' \
  --output text 2>/dev/null || true

if [[ "$EXIT_CODE" != "0" ]]; then
  echo "$ACTION task failed with exit code $EXIT_CODE" >&2
  exit 1
fi

echo "$ACTION task completed successfully"
