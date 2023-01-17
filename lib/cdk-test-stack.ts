import { LambdaConstruct } from "./constructs/lambda-construct";
import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigw from "@aws-cdk/aws-apigateway";

export class CdkTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "Task", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const optionsHandlerFunction = new LambdaConstruct(
      this,
      'OptionsHandlerLambda',
      'get-task.optionsHandler',
      table
    );

    const createTaskFunction = new LambdaConstruct(
      this,
      "CreateTaskLambda",
      "create-task.createHandler",
      table
    );
    table.grantWriteData(createTaskFunction.lambda);

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

    const getTaskFunction = new LambdaConstruct(
      this,
      'getTaskLambda',
      'get-task.getTaskHandler',
      table
    );

    table.grantReadWriteData(getTaskFunction.lambda);

    const deleteTaskFunction = new LambdaConstruct(
      this,
      'deleteTaskLambda',
      'delete-task.deleteTaskHandler',
      table
    );

    table.grantReadWriteData(deleteTaskFunction.lambda);

    const api = new apigw.RestApi(this, 'task-api', {
      description: 'task-api',
    });

    const todoResource = api.root.addResource('todo');

    todoResource.addMethod(
      'GET',
      new apigw.LambdaIntegration(listTaskFunction.lambda)
    );

    todoResource.addMethod(
      'POST',
      new apigw.LambdaIntegration(createTaskFunction.lambda)
    );
    todoResource.addMethod(
      'OPTIONS',
      new apigw.LambdaIntegration(optionsHandlerFunction.lambda)
    );

    const todoItemResource = todoResource.addResource('{id}');

    todoItemResource.addMethod(
      'GET',
      new apigw.LambdaIntegration(getTaskFunction.lambda)
    );

    todoItemResource.addMethod(
      'PUT',
      new apigw.LambdaIntegration(updateTaskFunction.lambda)
    );

    todoItemResource.addMethod(
      'DELETE',
      new apigw.LambdaIntegration(deleteTaskFunction.lambda)
    );

    todoItemResource.addMethod(
      'OPTIONS',
      new apigw.LambdaIntegration(optionsHandlerFunction.lambda)
    );
  }
}