export interface IContatosProvider {
  children: JSX.Element;
}

export interface IContatos {
  id: string;
  code_client: string;
  name: string;
  email: string;
  sector: string;
  telephone: string;
  cellphone: string;
  created_at: string;
  updated_at: string;
}

export interface ICreateContatosData
  extends Omit<IContatos, "id" | "created_at" | "updated_at"> {
  code_client: string;
  name: string;
  email: string;
  sector: string;
  telephone: string;
  cellphone: string;
}

export interface IUpdateContatosData
  extends Omit<IContatos, "id" | "code_client" | "created_at" | "updated_at"> {}

export interface IListContatos extends IContatos {}

export interface IContatosContext {
  listContatos: () => Promise<any>;
  createContato: (contatoData: ICreateContatosData) => Promise<any>;
  updateContato: (
    contactId: string,
    updateContatoData: IUpdateContatosData
  ) => void;
  deleteContato: (contactId: string) => void;
  getContactsByClient: (clientId: string) => Promise<any>;
}
