const { getList } = require("task-db");
/**
 * POST /item
 */
exports.listHandler = async (event) => {
  let status;

  const headers = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
  };
  if (event.queryStringParameters?.status) {
    status = event.queryStringParameters?.status === "true";
  }

  const list = await getList(status);

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(list),
  };
};
