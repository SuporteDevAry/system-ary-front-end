export interface IContatosProvider {
    children: JSX.Element;
}

export interface IContatos {
    id: string;
    cli_codigo: string;
    sequencia: string;
    grupo: string;
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
    celular: string;
    recebe_email: string;
    created_at: string;
    updated_at: string;
}

export interface ICreateContatosData {
    cli_codigo: string;
    sequencia: string;
    grupo: string;
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
    celular: string;
    recebe_email: string;
}

export interface IUpdateContatosData {
    cli_codigo: string;
    sequencia: string;
    grupo: string;
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
    celular: string;
    recebe_email: string;
}



export interface IListContatos extends IContatos {
    id: string;
    cli_codigo: string;
    sequencia: string;
    grupo: string;
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
    celular: string;
    recebe_email: string;
    created_at: string;
    updated_at: string;
}

