import { LambdaConstruct } from "./constructs/lambda-construct";
import * as cdk from "@aws-cdk/core";

import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as cw from "@aws-cdk/aws-cloudwatch";
import path = require("path");

export class CdkTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "Task", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const createTaskFunction = new LambdaConstruct(
      this,
      "CreateTaskLambda",
      "create-task.createHandler",
      table
    );
    table.grantWriteData(createTaskFunction.lambda);

    if (createTaskFunction.lambda.timeout) {
      new cw.Alarm(this, "AlarmTimeOutSaveTask", {
        metric: createTaskFunction.lambda.metricDuration().with({
          statistic: "Maximum",
        }),
        alarmName: "Lambda SaveTask Timeout",
        threshold: createTaskFunction.lambda.timeout.toMilliseconds(),
        evaluationPeriods: 1,
      });
    }

    const listTaskFunction = new LambdaConstruct(
      this,
      "ListTaskLambda",
      "list-task.listHandler",
      table
    );
    table.grantReadData(listTaskFunction.lambda);

    const updateTaskFunction = new LambdaConstruct(
      this,
      "UpdateTaskLambda",
      "update-task.updateHandler",
      table
    );
    table.grantReadWriteData(updateTaskFunction.lambda);

    const api = new apigw.RestApi(this, "task-api", {
      description: "task-api",
    });

    const todoResource = api.root.addResource("todo");
    todoResource.addMethod(
      "POST",
      new apigw.LambdaIntegration(createTaskFunction.lambda)
    );
    todoResource.addMethod(
      "GET",
      new apigw.LambdaIntegration(listTaskFunction.lambda)
    );
    todoResource.addMethod(
      "PUT",
      new apigw.LambdaIntegration(updateTaskFunction.lambda)
    );
  }
}
