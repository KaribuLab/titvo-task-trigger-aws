import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

export const basePath = '/tvo/security-scan/localstack/infra';

export interface AppStackProps extends cdk.StackProps {
  taskTableName: string;
  apiKeyTableName: string;
  taskCliFilesTableName: string;
  configTableName: string;
  encryptionKeyName: string;
}
export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const apiId = cdk.Fn.importValue('MyRestApiId');
    const rootResourceId = cdk.Fn.importValue('MyRestApiRootResourceId');

    const restApi = RestApi.fromRestApiAttributes(this, 'ImportedRestApi', {
      restApiId: apiId,
      rootResourceId: rootResourceId,
    });

    // Lambda Function
    const lambdaFunction = new Function(this, 'ApiTaskTriggerFunction', {
      functionName: 'api-task-trigger-local',
      runtime: Runtime.NODEJS_22_X,
      handler: 'src/entrypoint.handler',
      code: Code.fromAsset(path.join(__dirname, '../../dist/lambda.zip')),
      timeout: cdk.Duration.seconds(300),
      memorySize: 512,
      description: 'Lambda function for API Task Trigger',
      environment: {
        AWS_STAGE: 'localstack',
        LOG_LEVEL: 'debug',
        API_KEY_TABLE_NAME: props.apiKeyTableName,
        TASK_CLI_FILES_TABLE_NAME: props.taskCliFilesTableName,
        TASK_TABLE_NAME: props.taskTableName,
        CONFIG_TABLE_NAME: props.configTableName,
        PARAMETERS_TABLE_NAME: props.configTableName,
        ENCRYPTION_KEY_NAME: props.encryptionKeyName,
        AWS_ENDPOINT: process.env.AWS_ENDPOINT as string,
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    const integration = new LambdaIntegration(lambdaFunction)
    restApi.root.addResource('run-scan').addMethod('POST', integration)

    // Parámetros SSM para la Lambda
    new StringParameter(this, 'SSMParameterLambdaArn', {
      parameterName: `${basePath}/lambda/api-task-trigger/function_arn`,
      stringValue: lambdaFunction.functionArn,
      description: 'ARN de la función Lambda de API Task Trigger'
    });

    new StringParameter(this, 'SSMParameterLambdaName', {
      parameterName: `${basePath}/lambda/api-task-trigger/function_name`,
      stringValue: lambdaFunction.functionName,
      description: 'Nombre de la función Lambda de API Task Trigger'
    });

    new cdk.CfnOutput(this, 'CloudWatchLogGroupName', {
      value: lambdaFunction.logGroup.logGroupName,
      description: 'Nombre del grupo de logs de CloudWatch'
    });
  }
}
