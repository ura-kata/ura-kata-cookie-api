import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as https from 'https';

const URA_KATA_COOKIE_API_DOMAIN_NAME = process.env
  .URA_KATA_COOKIE_API_DOMAIN_NAME as string;

if (!URA_KATA_COOKIE_API_DOMAIN_NAME) {
  throw Error(
    "'URA_KATA_COOKIE_API_DOMAIN_NAME' is not found in the environment variable."
  );
}

const COGNITO_TOKEN_ENDPOINT_HOST = process.env
  .COGNITO_TOKEN_ENDPOINT_HOST as string;

if (!COGNITO_TOKEN_ENDPOINT_HOST) {
  throw Error(
    "'COGNITO_TOKEN_ENDPOINT_HOST' is not found in the environment variable."
  );
}

const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID as string;

if (!COGNITO_CLIENT_ID) {
  throw Error("'COGNITO_CLIENT_ID' is not found in the environment variable.");
}
interface RefreshTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

function postRefreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse | undefined> {
  return new Promise<RefreshTokenResponse | undefined>((resolve) => {
    if (!refreshToken) {
      resolve(undefined);
    }
    if (refreshToken.toLowerCase() === 'deleted') {
      resolve(undefined);
    }
    const options = {
      host: COGNITO_TOKEN_ENDPOINT_HOST,
      path: '/oauth2/token',
      port: 443,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    };

    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        // // DEBUG
        // console.log('postRefreshToken success');
        // console.log(chunk);

        try {
          const responseData = JSON.parse(chunk) as RefreshTokenResponse;
          resolve(responseData);
        } catch (err) {
          console.log("data parse error on 'postRefreshToken'");
          console.log(chunk);
        }

        resolve(undefined);
      });

      res.on('error', (err) => {
        console.log("post request error on 'postRefreshToken'");
        console.log(err);

        resolve(undefined);
      });
    });

    const postData = `grant_type=refresh_token&client_id=${COGNITO_CLIENT_ID}&refresh_token=${refreshToken}`;
    req.write(postData);
    req.end();
  });
}

export const handler: APIGatewayProxyHandler = async (
  event,
  context
): Promise<APIGatewayProxyResult> => {
  // // DEBUG
  // console.log(event);

  // 'event.resource' has no staging name.
  const resource = event.resource + '/';
  const host = event.headers['Host'];
  const protocol = event.headers['X-Forwarded-Proto'];
  let origin = protocol + '://' + host;

  if (!host?.endsWith(URA_KATA_COOKIE_API_DOMAIN_NAME)) {
    origin = protocol + '://' + URA_KATA_COOKIE_API_DOMAIN_NAME;
  }

  const multiValueHeaders: { [key: string]: string[] } = {};
  const responseHeaders: { [key: string]: string } = {};

  if (!resource.startsWith('/token/')) {
    return {
      statusCode: 404,
      body: 'Not found',
      headers: responseHeaders,
      multiValueHeaders,
    };
  }

  responseHeaders['Content-Type'] = 'application/json';

  const cookieEndHttpOnly = `Domain=${URA_KATA_COOKIE_API_DOMAIN_NAME}; Path=/; HttpOnly; Secure`;
  const cookieEnd = `Domain=${URA_KATA_COOKIE_API_DOMAIN_NAME}; Path=/; Secure`;

  try {
    switch (event.httpMethod) {
      case 'PATCH': {
        const requestCookies =
          event.headers['Cookie'] ?? event.headers['cookie'];
        if (!requestCookies) {
          throw new Error('cookie not found');
        }

        const refreshToken: string | undefined = (() => {
          const cookies = requestCookies.split(';');
          for (let i = 0; i < cookies.length; ++i) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('refresh_token')) {
              return cookie.substring(14);
            }
          }
          return undefined;
        })();

        if (!refreshToken) {
          throw new Error('refresh token not found');
        }

        const refreshTokenResponse = await postRefreshToken(refreshToken);
        if (!refreshTokenResponse) {
          throw new Error('token refresh error');
        }

        // // DEBUG
        // console.log('refreshTokenResponse');
        // console.log(refreshTokenResponse);

        const setCookies = [
          `access_token=${refreshTokenResponse.access_token}; ${cookieEndHttpOnly}`,
          `id_token=${refreshTokenResponse.id_token}; ${cookieEnd}`,
        ];

        multiValueHeaders['Set-Cookie'] = setCookies;

        break;
      }
      case 'POST': {
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const accessToken = requestBody['accessToken'];
        const refreshToken = requestBody['refreshToken'];
        const idToken = requestBody['idToken'];

        if (!accessToken || !refreshToken) {
          throw new Error(`token not found`);
        }
        const setCookies = [
          `access_token=${accessToken}; ${cookieEndHttpOnly}`,
          `refresh_token=${refreshToken}; ${cookieEndHttpOnly}`,
        ];
        if (idToken) {
          setCookies.push(`id_token=${idToken}; ${cookieEnd}`);
        }

        multiValueHeaders['Set-Cookie'] = setCookies;

        break;
      }
      case 'DELETE': {
        multiValueHeaders['Set-Cookie'] = [
          `access_token=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; ${cookieEndHttpOnly}`,
          `refresh_token=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; ${cookieEndHttpOnly}`,
          `id_token=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; ${cookieEnd}`,
        ];
        break;
      }
      default: {
        throw new Error(`Unsupported method "${event.httpMethod}"`);
      }
    }
  } catch (err) {
    console.log('throw exception.');
    console.log(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: err.message }),
      headers: responseHeaders,
      multiValueHeaders,
    };
  }

  responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
  responseHeaders['Access-Control-Allow-Origin'] = origin;
  responseHeaders['Access-Control-Allow-Credentials'] = 'true';
  responseHeaders['Access-Control-Allow-Methods'] = 'OPTIONS,POST,DELETE,PATCH';

  return {
    statusCode: 200,
    body: JSON.stringify({}),
    headers: responseHeaders,
    multiValueHeaders,
  };
};
