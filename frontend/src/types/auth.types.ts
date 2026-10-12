export interface IUser {
  _id: string;
  username: string;
  email: string;
}

export interface IAuthResponse {
  status: string;
  message: string;
  accessToken: string;
}
