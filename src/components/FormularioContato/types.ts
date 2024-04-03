
export interface IFormData {
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

export interface IFormularioContatosProps {
    titleText: string;
    data: IFormData;
    onHandleCreate: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}