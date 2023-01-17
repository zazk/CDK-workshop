import { LambdaConstruct } from './constructs/lambda-construct';
import * as cdk from "@aws-cdk/core";

import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as cw from "@aws-cdk/aws-cloudwatch"
import path = require("path");

export class CdkTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "Task", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const saveTaskFunction = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, "lambdas")),
      handler: "handler.createTask",
      timeout: cdk.Duration.seconds(30),
      environment: {
        TASKS_TABLE_NAME: table.tableName,
      },
    });

    if (saveTaskFunction.timeout){
      new cw.Alarm(this, "AlarmTimeOutSaveTask",{
        metric:saveTaskFunction.metricDuration().with({
          statistic: 'Maximum',
       }),
        alarmName: 'Lambda SaveTask Timeout',
        threshold: saveTaskFunction.timeout.toMilliseconds(),
        evaluationPeriods: 1
      })
    }
    table.grantReadWriteData(saveTaskFunction);

    const createTaskFunction = new LambdaConstruct(this, "CreateTaskLambda", "create-task.createHandler", table)
    table.grantReadWriteData(createTaskFunction.lambda);


    const api = new apigw.RestApi(this, "task-api", {
      description: 'task-api',
    });

    api.root.resourceForPath("task")
      .addMethod("POST", new apigw.LambdaIntegration(saveTaskFunction));
    api.root.resourceForPath("todo")
      .addMethod("POST", new apigw.LambdaIntegration(createTaskFunction.lambda))

  }
}
