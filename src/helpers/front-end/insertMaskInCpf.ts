export const insertMaskInCpf = (cnpj: string) => {
    return cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}