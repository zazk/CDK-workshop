import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class LambdaConstruct extends cdk.Construct {
  public lambda: lambda.Function;

  constructor(scope: cdk.Construct, id: string, handler: string, table: dynamodb.Table) {
    super(scope, id);

    this.lambda = new lambda.Function(this, "lambdaFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(`lib/lambdas`),
      handler: handler,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TASKS_TABLE_NAME: table.tableName,
      },
    });
  }
}