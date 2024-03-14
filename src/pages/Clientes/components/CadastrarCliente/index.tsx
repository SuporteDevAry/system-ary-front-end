import { useState } from "react";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/utils";


import { FormularioCliente } from "../../../../components/FormularioCliente";


export function CadastrarCliente() {
  const clienteContext = ClienteContext();

  const [formData, setFormData] = useState({
    cli_codigo: "",
    nome: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    natureza: "",
    cnpj: "",
    ins_est: "", 
    ins_mun: "",	 
    email: "", 
    telefone: "",
    celular: "",
    situacao: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({...prevData, [name]: value}));
  };

  const handleClose = () => {
    setFormData({
      cli_codigo: "",
      nome: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      natureza: "",
      cnpj: "",
      ins_est: "", 
      ins_mun: "",	 
      email: "", 
      telefone: "",
      celular: "",
      situacao: "",
    });
  };

  const handleCreate = async () => {
    if (!isEmailValid(formData.email)) {
      toast.error(
        "Formato de e-mail inválido, verifique se seu e-mail está correto."
      );
      return;
    }
    if (
      !formData.cli_codigo ||
      !formData.nome ||
      !formData.endereco ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.uf ||
      !formData.cep ||
      !formData.natureza ||
      !formData.cnpj ||
      !formData.email ||
      !formData.telefone ||
      !formData.celular 
    ) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const newCliente = await clienteContext.createCliente({
        cli_codigo:  formData.cli_codigo,
        nome:        formData.nome,
        endereco:    formData.endereco,
        numero:      formData.numero,
        complemento: formData.complemento,
        bairro:      formData.bairro,
        cidade:      formData.cidade,
        uf:          formData.uf,
        cep:         formData.cep,
        natureza:    formData.natureza,
        cnpj:        formData.cnpj,
        ins_est:     formData.ins_est, 
        ins_mun:	   formData.ins_mun,	 
        email:       formData.email, 
        telefone:    formData.telefone,
        celular:     formData.celular,
        situacao:    formData.situacao
      });

      toast.success(`Cliente ${formData.cli_codigo}, foi criado com sucesso!`);
      handleClose();

      return newCliente;
    } catch (error) {
      toast.error(`Erro ao tentar criar o Cliente, ${error}`);
    }
  };

  const checkCEP = (e: React.ChangeEvent<HTMLInputElement>) => {

      const cep = e.target.value.replace(/\D/g, '');

      fetch(`https://viacep.com.br/ws/${cep}/json/`).then(res => res.json()).then(data => {

      const dadosEndereco = {
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf
      };

      setFormData({ ...formData, ...dadosEndereco });

      })
  }

  return (
    <>
      
        <FormularioCliente 
         titleText={"Cadastrar Cliente"} 
         data={formData}
         onHandleCreate={handleCreate } 
         onChange={handleChange}
         onCheckCEP={checkCEP}
         />
    </>
  );
}

