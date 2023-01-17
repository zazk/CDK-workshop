const { updateItem } = require("task-db");
/**
 * POST /item
 */
exports.updateHandler = async (event) => {
  let status;

  const headers = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
  };
  if (event.queryStringParameters?.status) {
    status = event.queryStringParameters?.status === "true";
  }
  if (!event.body) {
    return {
      statusCode: 400,
      body: "content must be a non empty string",
    };
  }

  const id = event.pathParameters?.id;

  if (!id) {
    return {
      headers,
      statusCode: 400,
      body: "invalid ID",
    };
  }
  let item;

  try {
    item = { ...JSON.parse(event.body), id };

    if (!("content" in item) || !("status" in item)) {
      return {
        headers,
        statusCode: 400,
        body: "content or status must be provided",
      };
    }
  } catch (e) {
    console.error(e);
    return {
      headers,
      statusCode: 400,
      body: "body is invalid",
    };
  }

  const savedItem = await updateItem(item);

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(savedItem),
  };
};
