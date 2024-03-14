import { IListUser } from "../../../../contexts/UserContext/types";

export interface ITableUsersProps {
    users: IListUser[];
    onHandleUpdateUser: (user: IListUser) => void;
    onHandleDeleteUser: (user: string) => void;
    isLoading: boolean;
  }