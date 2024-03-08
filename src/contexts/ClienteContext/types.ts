export interface IClienteProvider {
    children: JSX.Element;
}

interface ICliente {
    id: string;
    cli_codigo: string;
    nome: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    natureza: string;
    cnpj: string;
    ins_est: string;
    ins_mun: string;
    email: string;
    telefone: string;
    celular: string;
    situacao: string;
    created_at: string;
    updated_at: string;
}

export interface ICreateClienteData {
    cli_codigo: string;
    nome: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    natureza: string;
    cnpj: string;
    ins_est: string;
    ins_mun: string;
    email: string;
    telefone: string;
    celular: string;
    situacao: string;
}

export interface IListCliente extends ICliente {
    id: string;
    cli_codigo: string;
    nome: string;
    cidade: string;
    uf: string;
    cnpj: string;
}

// export interface IUpdateUserData extends IUser {}
