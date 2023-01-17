const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TASKS_TABLE_NAME;

exports.getList = async (status) => {
  const params = {
    TableName: TABLE_NAME,
    Select: "ALL_ATTRIBUTES",

    ...(status !== undefined
      ? {
          FilterExpression: "#status = :completed",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":completed": status,
          },
        }
      : {}),
  };

  const result = await dynamo.scan(params).promise();
  return result.Items;
};

exports.saveItem = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  console.log(params);
  try {
    await dynamo.put(params).promise();
  } catch (e) {
    console.log("Error Save Item", e);
  }
  return item;
};

const filterExpressions = (stringParts, ...args) =>
  stringParts
    .reduce((acc, current, i) => {
      let _t = acc + current;
      if (args[i]) _t += args[i];
      return _t;
    }, "")
    .trim()
    .replace(/\s+/g, " ");

exports.updateItem = async ({ id, status, content }) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: filterExpressions`
      SET
        ${typeof status !== undefined && " #statusField = :status,"}
        ${typeof content !== undefined && " #contentField = :content"}
    `,
    ExpressionAttributeNames: {
      "#statusField": "status",
      "#contentField": "content",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":content": content,
    },
    ReturnValues: "ALL_NEW",
  };

  const val = await dynamo.update(params).promise();
  console.log(val);
};
