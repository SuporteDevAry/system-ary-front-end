export interface IUser {
  email?: string;
  token?: string;
}

export interface IContext extends IUser {
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface IAuthProvider {
  children: JSX.Element;
}

export interface Token {
  permissions: string[];
}
export interface IUserDataFromToken {
  email: string;
  name: string;
  permissions: string[];
}
