import dotenv from 'dotenv';
dotenv.config()

import auth0 from 'auth0';

export function createManagementClient() {
  return new auth0.ManagementClient({
    domain: 'dev-o0dlw7sn.us.auth0.com',
    clientId: 'gFN0a3JsIUUu9OW6X5Qpsd0uzG6b4kio',
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    scope: 'read:users',
    audience: 'https://dev-o0dlw7sn.us.auth0.com/api/v2/',
    tokenProvider: {
      enableCache: true,
      cacheTTLInSeconds: 10
    }
  });
}

export function createAuthenticationClient() {
  return new auth0.AuthenticationClient({
    domain: 'dev-o0dlw7sn.us.auth0.com'
  });
}

export async function verifyUser(authenticationClient, token, auth0_user_id) {
  try {
    const userToVerify = await authenticationClient.users.getInfo(token)
    return (userToVerify.sub === auth0_user_id)
  } catch (err) {
    return false
  }
}
