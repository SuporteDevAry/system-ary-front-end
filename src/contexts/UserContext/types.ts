export interface IUserProvider {
  children: JSX.Element;
}

interface IUser {
  id: string;
  name: string;
  email: string;
  permissions_id: string;
  created_at: string;
  updated_at: string;
}

export interface ICreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface IListUser extends IUser {
  password?: string;
}

// export interface IUpdateUserData extends IUser {}
