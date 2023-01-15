import * as cdk from "@aws-cdk/core";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigw from "@aws-cdk/aws-apigateway";
import path = require("path");

export class CdkTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const table = new dynamodb.Table(this, "Task", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const saveTaskFunction = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.resolve(__dirname, "lambda")),
      handler: "handler.createTask",
      environment: {
        TASKS_TABLE_NAME: table.tableName,
      },
    });

    // permissions to lambda to dynamo table
    table.grantReadWriteData(saveTaskFunction);

    // create the API Gateway with one method and path
    const api = new apigw.RestApi(this, "task-api");

    api.root
      .resourceForPath("task")
      .addMethod("POST", new apigw.LambdaIntegration(saveTaskFunction));

    // example resource
    // const queue = new sqs.Queue(this, 'CdkTestQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
