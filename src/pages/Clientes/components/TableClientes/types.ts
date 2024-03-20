import { IListCliente } from "../../../../contexts/ClienteContext/types";

export interface ITableClientesProps {
  data: IListCliente[];
  onHandleUpdateCliente: (clientes: IListCliente) => void;
  onHandleDeleteCliente: (user: string) => void;
  isLoading: boolean;
}
