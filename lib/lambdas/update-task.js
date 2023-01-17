const { updateItem } = require("./task-db");
/**
 * PUT /todo/{id}
 */
exports.updateTaskHandler = async (event) => {
  const headers = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  if (!event.body) {
    return {
      headers,
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

  try {
    const savedItem = await updateItem(item);

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(savedItem),
    };
  } catch (e) {
    console.error(e);
    return {
      headers,
      statusCode: "500",
      body: JSON.stringify({
        message: "internal server error",
        reason: e.toString(),
      }),
    };
  }
};
