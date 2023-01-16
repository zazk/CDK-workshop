import * as cdk from "@aws-cdk/core";

import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigw from "@aws-cdk/aws-apigateway";
import path = require("path");

export class CdkTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "Task", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const saveTaskFunction = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, "lambdas")),
      handler: "handler.createTask",
      environment: {
        TASKS_TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(saveTaskFunction);

    const api = new apigw.RestApi(this, "task-api", {
      description: 'task-api',
    });

    api.root
      .resourceForPath("task")
      .addMethod("POST", new apigw.LambdaIntegration(saveTaskFunction));

  }
}
