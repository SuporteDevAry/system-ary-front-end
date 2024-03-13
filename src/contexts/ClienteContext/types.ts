export interface IClientesProvider {
    children: JSX.Element;
}

export interface IClientes {
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

export interface ICreateClientesData {
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

export interface IUpdateClientesData {
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



export interface IListCliente extends IClientes {
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

// export interface IUpdateUserData extends IUser {}
