const { getTask } = require("./task-db");

exports.optionsHandler = async (event) => {
  const headers = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*", // Allow from anywhere,
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  return {
    headers,
    statusCode: 200,
  };
};

/**
 * POST /item
 */
exports.getTaskHandler = async (event) => {
  const id = event.pathParameters?.id;

  const headers = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };

  if (!id) {
    return {
      headers,
      statusCode: 400,
      body: "invalid ID",
    };
  }

  try {
    const task = await getTask(id);

    if (task)
      return {
        headers,
        statusCode: 200,
        body: JSON.stringify(task),
      };

    return {
      headers,
      statusCode: 404,
      body: JSON.stringify({
        message: "not found",
      }),
    };
  } catch (e) {
    console.error(e);
    // TODO
    return {
      statusCode: 500,
    };
  }
};
