import * as db from "../database/tasks.db";
/**
 * POST /item
 */
exports.createHandler = async (event) => {
  console.log(event.body);

  let content;
  let status = false;
  const headers = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
  };

  if (!event.body) {
    return {
      statusCode: 400,
      body: "content must be a non empty string",
    };
  }

  try {
    const { content: _content, status: _status } = JSON.parse(event.body);
    if (typeof _content !== "string" || !_content) {
      return {
        headers,
        statusCode: 400,
        body: "content must be a non empty string",
      };
    }

    content = _content;

    if (typeof _status === "boolean") status = _status;
  } catch (e) {
    console.error(e);
    return {
      headers,
      statusCode: 400,
    };
  }

  const item = {
    id: uuidv4(),
    content,
    status,
  };

  console.log(item);

  const savedItem = await db.saveItem(item);

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(savedItem),
  };
};
