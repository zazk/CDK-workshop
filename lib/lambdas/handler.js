const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TASKS_TABLE_NAME;

exports.createTask = async (event) => {
  console.log("request:", JSON.stringify(event));
  const task = event.queryStringParameters.task;

  const item = {
    id: task,
    name: task,
    date: Date.now(),
  };

  const savedItem = await saveItem(item);

  // return response back to upstream caller
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(savedItem),
  };
};

async function saveItem(item) {
  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };
  console.log(params);
  return dynamo
    .put(params)
    .promise()
    .then(() => {
      return item;
    });
}
