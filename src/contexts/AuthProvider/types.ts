export interface IUser {
  email?: string;
  token?: string;
}

export interface IContext extends IUser {
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface IAuProvider {
  children: JSX.Element;
}
