terraform {
  source = "git::https://github.com/KaribuLab/terraform-aws-function.git?ref=v0.7.0"
}

locals {
  serverless    = read_terragrunt_config(find_in_parent_folders("serverless.hcl"))
  function_name = "${local.serverless.locals.service_name}-lambda-${local.serverless.locals.stage}"
  common_tags   = local.serverless.locals.common_tags
  base_path     = "${local.serverless.locals.parameter_path}/${local.serverless.locals.stage}"
  is_local      = local.serverless.locals.stage == "local"
}

include {
  path = find_in_parent_folders(get_env("TG_ROOT_FILE", "root.hcl"))
}

dependency log {
  config_path = "${get_parent_terragrunt_dir()}/aws/cloudwatch"
  mock_outputs = {
    log_arn = "log_arn"
  }
}

dependency parameters {
  config_path = "${get_parent_terragrunt_dir()}/aws/parameter"
  mock_outputs = {
    parameters = {
      "${local.base_path}/infra/batch/agent/job_definition_arn" = "arn:aws:batch:us-east-1:000000000000:job-definition/tvo-security-scan-batch-prod-job-definition"
      "${local.base_path}/infra/batch/agent/job_queue_arn"      = "arn:aws:batch:us-east-1:000000000000:job-queue/tvo-security-scan-job-queue-prod"
      "${local.base_path}/infra/dynamo/task-table-arn"          = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-task-table-prod"
      "${local.base_path}/infra/dynamo/task-table-name"         = "tvo-security-scan-task-table-prod"
      "${local.base_path}/infra/dynamo/parameter-table-arn"     = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-configuration-table-prod"
      "${local.base_path}/infra/dynamo/parameter-table-name"    = "tvo-security-scan-configuration-table-prod"
      "${local.base_path}/infra/dynamo/apikey-table-arn"        = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-api-key-table-prod"
      "${local.base_path}/infra/dynamo/apikey-table-name"       = "tvo-security-scan-api-key-table-prod"
      "${local.base_path}/infra/dynamo/cli-files-table-arn"     = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-cli-files-table-prod"
      "${local.base_path}/infra/dynamo/cli-files-table-name"    = "tvo-security-scan-cli-files-table-prod"
      "${local.base_path}/infra/secret/manager/arn"             = "arn:aws:secretsmanager:us-east-1:000000000000:secret:/tvo/security-scan/prod"
      "${local.base_path}/infra/kms/encryption-key-name"        = "tvo-security-scan-encryption-key-prod"
    }
  }
}

inputs = {
  function_name = local.function_name
  iam_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : "${dependency.log.outputs.log_arn}:*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "ssm:GetParametersByPath"
        ],
        "Resource" : [
          "arn:aws:ssm:*:*:parameter${local.base_path}/common",
          "arn:aws:ssm:*:*:parameter${local.base_path}/task-trigger"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "batch:SubmitJob"
        ],
        "Resource" : [
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/batch/agent/job_definition_arn"]}",
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/batch/agent/job_queue_arn"]}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:PutItem"
        ],
        "Resource" : [
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/task-table-arn"]}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:GetItem",
        ],
        "Resource" : [
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/parameter-table-arn"]}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:Query"
        ],
        "Resource" : [
          dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/apikey-table-arn"],
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/apikey-table-arn"]}/index/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:Query"
        ],
        "Resource" : [
          dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/cli-files-table-arn"],
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/cli-files-table-arn"]}/index/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "secretsmanager:GetSecretValue"
        ],
        "Resource" : [
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/secret/manager/arn"]}"
        ]
      }
    ]
  })
  # En el entorno local (MiniStack) el agente corre como contenedor Docker lanzado por el
  # batch-runner, por lo que la lambda le reenvia estos valores como variables de entorno.
  environment_variables = merge(local.is_local ? {
    AWS_ENDPOINT                                = get_env("AWS_ENDPOINT_URL", "http://ministack:4566")
    TITVO_BATCH_RUNNER_URL                      = get_env("TITVO_BATCH_RUNNER_URL", "http://rag-indexer:3002")
    TITVO_BITBUCKET_CODE_INSIGHTS_FUNCTION_NAME = dependency.parameters.outputs.parameters["${local.base_path}/infra/lambda/bitbucket-code-insights-name"]
    TITVO_GITHUB_ISSUE_FUNCTION_NAME            = dependency.parameters.outputs.parameters["${local.base_path}/infra/lambda/github-issue-name"]
    TITVO_REPORT_FUNCTION_NAME                  = dependency.parameters.outputs.parameters["${local.base_path}/infra/lambda/issue-report-name"]
    TITVO_RAG_INDEXER_BUCKET                    = dependency.parameters.outputs.parameters["${local.base_path}/infra/s3/rag-index/bucket_name"]
    } : {}, {
    API_KEY_TABLE_NAME        = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/apikey-table-name"]
    TASK_CLI_FILES_TABLE_NAME = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/cli-files-table-name"]
    TASK_TABLE_NAME           = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/task-table-name"]
    CONFIG_TABLE_NAME         = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo/parameter-table-name"]
    ENCRYPTION_KEY_NAME       = dependency.parameters.outputs.parameters["${local.base_path}/infra/kms/encryption-key-name"]
    AWS_STAGE                 = local.serverless.locals.stage
    NODE_OPTIONS              = "--enable-source-maps"
    LOG_LEVEL                 = "debug"
  })
  runtime       = "nodejs20.x"
  handler       = "src/entrypoint.handler"
  bucket        = local.serverless.locals.service_bucket
  file_location = "${get_parent_terragrunt_dir()}/build"
  zip_location  = "${get_parent_terragrunt_dir()}/dist"
  zip_name      = "${local.function_name}.zip"
  common_tags   = local.common_tags
}
