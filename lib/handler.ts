import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (
  event,
  context
): Promise<APIGatewayProxyResult> => {
  const statusCode = 200;
  const multiValueHeaders = {};
  const responseBody = JSON.stringify(event);
  let responseHeaders = {
    'Content-Type': 'application/json',
  };

  console.log(event);
  return {
    statusCode: statusCode,
    body: responseBody,
    headers: responseHeaders,
    multiValueHeaders,
  };
};
