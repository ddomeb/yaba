export interface SessionInfo {
  user: {
    pk: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  access_token: {
    token: string;
    expiry: number
  };
  refresh_token: {
    token: string;
    expiry: number
  };
}

function isExpired(token: 'access_token' | 'refresh_token', session: SessionInfo): boolean {
  return session[token].expiry * 1000 < Date.now();
}

export const accessTokenIsExpired = (session: SessionInfo) => isExpired('access_token', session);
export const refreshTokenTokenIsExpired = (session: SessionInfo) => isExpired('refresh_token', session);
