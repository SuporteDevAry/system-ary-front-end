import { IListUser } from "../../../../contexts/UserContext/types";

export interface ITableUsersProps {
  data: IListUser[];
  onHandleUpdateUser: (user: IListUser) => void;
  onHandleDeleteUser: (user: string) => void;
  isLoading: boolean;
}
