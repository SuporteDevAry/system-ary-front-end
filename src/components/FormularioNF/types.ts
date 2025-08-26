export interface IFormNF {
    numeroRps: string;
    dataEmissao: string;
    codigoServico: string;
    aliquota: string;
    cpfCnpj: string;
    razaoSocial: string;
    endereco: string;
    numeroEndereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    email: string;
    discriminacao: string;
    valorServicos: string;
    nomeAjuste1: string
    valorAjuste1: string;
    nomeAjuste2: string
    valorAjuste2: string;
    valorIR: string;
    valorLiquido: string;
    valorDeducao: string;
}

export interface IFormNFProps {
    titleText: string;
    data: IFormNF;
    onHandleCreate: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckCNPJ: (e: React.ChangeEvent<HTMLInputElement>) => void;

}
