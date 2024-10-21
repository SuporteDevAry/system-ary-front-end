export interface IFormData {
  nickname: string;
  name: string;
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  kind: string;
  cnpj_cpf: string;
  ins_est: string;
  ins_mun: string;
  telephone: string;
  cellphone: string;
  situation: string;
  cnpj_pagto: string;
}

export interface IFormularioClienteProps {
  titleText: string;
  data: IFormData;
  onHandleCreate: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckCEP: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
