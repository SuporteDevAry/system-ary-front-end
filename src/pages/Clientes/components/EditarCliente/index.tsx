import { useState } from "react";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { toast } from "react-toastify";
import { isEmailValid } from "../../../../helpers/back-end/utils";
import { FormularioCliente } from "../../../../components/FormularioCliente";
import { useLocation, useNavigate } from "react-router-dom";
import { IListCliente } from "../../../../contexts/ClienteContext/types";

// Se colocar para receber o parametro o programa fica correto, mas o routes fica com erro
// EditarCliente(clientes: IListCliente)

export function EditarCliente() {
  const navigate = useNavigate();
  const location = useLocation();

  const clienteForUpdate: IListCliente = location.state?.clienteForUpdate;

  const clienteContext = ClienteContext();

  // como receber o clientes enviado pelo TableClientes index.tsx ???
  //const [clientes] = useState<IListCliente>(
  //  {} as IListCliente
  //);

  const [formData, setFormData] = useState({
    cli_codigo: clienteForUpdate.cli_codigo,
    nome: clienteForUpdate.nome,
    endereco: clienteForUpdate.endereco,
    numero: clienteForUpdate.numero,
    complemento: clienteForUpdate.complemento,
    bairro: clienteForUpdate.bairro,
    cidade: clienteForUpdate.cidade,
    uf: clienteForUpdate.uf,
    cep: clienteForUpdate.cep,
    natureza: clienteForUpdate.natureza,
    cnpj: clienteForUpdate.cnpj,
    ins_est: clienteForUpdate.ins_est,
    ins_mun: clienteForUpdate.ins_mun,
    email: clienteForUpdate.email,
    telefone: clienteForUpdate.telefone,
    celular: clienteForUpdate.celular,
    situacao: clienteForUpdate.situacao,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCreate = async () => {
    if (!isEmailValid(formData.email)) {
      toast.error(
        "Formato de e-mail inválido, verifique se seu e-mail está correto."
      );
      return;
    }
    // if (
    //   !formData.cli_codigo ||
    //   !formData.nome ||
    //   !formData.endereco ||
    //   !formData.numero ||
    //   !formData.bairro ||
    //   !formData.cidade ||
    //   !formData.uf ||
    //   !formData.cep ||
    //   !formData.natureza ||
    //   !formData.cnpj ||
    //   !formData.email ||
    //   !formData.telefone ||
    //   !formData.celular
    // ) {
    //   toast.error("Por favor, preencha todos os campos.");
    //   return;
    // }

    try {
      clienteContext.updateCliente(clienteForUpdate.cli_codigo, {
        nome: formData.nome,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        cep: formData.cep,
        natureza: formData.natureza,
        cnpj: formData.cnpj,
        ins_est: formData.ins_est,
        ins_mun: formData.ins_mun,
        email: formData.email,
        telefone: formData.telefone,
        celular: formData.celular,
        situacao: formData.situacao,
      });

      toast.success(
        `Cliente ${formData.cli_codigo}, foi alterado com sucesso!`
      );
      navigate("/clientes");
    } catch (error) {
      toast.error(`Erro ao tentar alterar o Cliente, ${error}`);
    }
  };

  const checkCEP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");

    fetch(`${process.env.REACT_APP_URL_VIA_CEP}/${cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        const dadosEndereco = {
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
        };

        setFormData({ ...formData, ...dadosEndereco });
      });
  };

  return (
    <>
      <FormularioCliente
        titleText={"Editar Cliente"}
        data={formData}
        onHandleCreate={handleCreate}
        onChange={handleChange}
        onCheckCEP={checkCEP}
      />
    </>
  );
}
