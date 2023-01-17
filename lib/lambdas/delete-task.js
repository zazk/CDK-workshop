const { deleteTask } = require("./task-db");
/**
 * POST /item
 */
exports.deleteTaskHandler = async (event) => {
  const id = event.pathParameters?.id;

  const headers = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
  };

  if (!id) {
    return {
      headers,
      statusCode: 400,
      body: "invalid ID",
    };
  }

  try {
    const task = await deleteTask(id);

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(task),
    };
  } catch (e) {
    console.error(e);
    // TODO
    return {
      statusCode: 500,
    };
  }
};
