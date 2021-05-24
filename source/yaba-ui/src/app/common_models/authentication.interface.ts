export interface UserData {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
  user: UserData;
}
