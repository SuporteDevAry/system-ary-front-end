
export interface IFormData {
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

export interface IFormularioClienteProps {
    titleText: string;
    data: IFormData;
    onHandleCreate: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckCEP: (e: React.ChangeEvent<HTMLInputElement>) => void;
}