terraform {
  source = "git::https://github.com/KaribuLab/terraform-aws-function.git?ref=v0.7.0"
}

locals {
  serverless    = read_terragrunt_config(find_in_parent_folders("serverless.hcl"))
  function_name = "${local.serverless.locals.service_name}-lambda-${local.serverless.locals.stage}"
  common_tags   = local.serverless.locals.common_tags
  base_path     = "${local.serverless.locals.parameter_path}/${local.serverless.locals.stage}"
}

include {
  path = find_in_parent_folders()
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
      "/tvo/security-scan/test/infra/security-scan-batch-arn"         = "arn:aws:batch:us-east-1:000000000000:job-definition/tvo-security-scan-batch-test-job-definition"
      "/tvo/security-scan/test/infra/security-scan-job-queue-arn"     = "arn:aws:batch:us-east-1:000000000000:job-queue/tvo-security-scan-job-queue-test"
      "/tvo/security-scan/test/infra/dynamo-task-table-arn"           = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-task-table-test"
      "/tvo/security-scan/test/infra/dynamo-configuration-table-arn"  = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-configuration-table-test"
      "/tvo/security-scan/test/infra/encryption-key-name"             = "tvo-security-scan-encryption-key-test"
      "/tvo/security-scan/test/infra/dynamo-configuration-table-name" = "tvo-security-scan-configuration-table-test"
      "/tvo/security-scan/prod/infra/security-scan-batch-arn"         = "arn:aws:batch:us-east-1:000000000000:job-definition/tvo-security-scan-batch-prod-job-definition"
      "/tvo/security-scan/prod/infra/security-scan-job-queue-arn"     = "arn:aws:batch:us-east-1:000000000000:job-queue/tvo-security-scan-job-queue-prod"
      "/tvo/security-scan/prod/infra/dynamo-task-table-arn"           = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-task-table-prod"
      "/tvo/security-scan/prod/infra/dynamo-configuration-table-arn"  = "arn:aws:dynamodb:us-east-1:000000000000:table/tvo-security-scan-configuration-table-prod"
      "/tvo/security-scan/prod/infra/secret-manager-arn"              = "arn:aws:secretsmanager:us-east-1:000000000000:secret:/tvo/security-scan/prod"
      "/tvo/security-scan/prod/infra/encryption-key-name"             = "tvo-security-scan-encryption-key-prod"
      "/tvo/security-scan/prod/infra/dynamo-configuration-table-name" = "tvo-security-scan-configuration-table-prod"
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
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/security-scan-batch-arn"]}",
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/security-scan-job-queue-arn"]}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:PutItem"
        ],
        "Resource" : [
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-task-table-arn"]}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:GetItem",
        ],
        "Resource" : [
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-configuration-table-arn"]}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:Query"
        ],
        "Resource" : [
          dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-api-key-table-arn"],
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-api-key-table-arn"]}/index/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:Query"
        ],
        "Resource" : [
          dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-cli-files-table-arn"],
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-cli-files-table-arn"]}/index/*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "secretsmanager:GetSecretValue"
        ],
        "Resource" : [
          "${dependency.parameters.outputs.parameters["${local.base_path}/infra/secret-manager-arn"]}"
        ]
      }
    ]
  })
  environment_variables = {
    API_KEY_TABLE_NAME        = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-api-key-table-name"]
    TASK_CLI_FILES_TABLE_NAME = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-cli-files-table-name"]
    TASK_TABLE_NAME           = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-task-table-name"]
    CONFIG_TABLE_NAME         = dependency.parameters.outputs.parameters["${local.base_path}/infra/dynamo-configuration-table-name"]
    ENCRYPTION_KEY_NAME       = dependency.parameters.outputs.parameters["${local.base_path}/infra/encryption-key-name"]
    AWS_STAGE                 = local.serverless.locals.stage
    LOG_LEVEL                 = "debug"
  }
  runtime       = "nodejs20.x"
  handler       = "src/entrypoint.handler"
  bucket        = local.serverless.locals.service_bucket
  file_location = "${get_parent_terragrunt_dir()}/build"
  zip_location  = "${get_parent_terragrunt_dir()}/dist"
  zip_name      = "${local.function_name}.zip"
  common_tags   = local.common_tags
}
