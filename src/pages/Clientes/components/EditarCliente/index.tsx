import { useState } from "react";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { toast } from "react-toastify";
import { FormularioCliente } from "../../../../components/FormularioCliente";
import { useLocation, useNavigate } from "react-router-dom";
import { IListCliente } from "../../../../contexts/ClienteContext/types";
import ValidatorDocto from "../../../../helpers/validatorDocto";

export function EditarCliente() {
  const navigate = useNavigate();
  const location = useLocation();

  const clienteForUpdate: IListCliente = location.state?.clienteForUpdate;

  const clienteContext = ClienteContext();

  const [formData, setFormData] = useState({
    nickname: clienteForUpdate.nickname,
    name: clienteForUpdate.name,
    address: clienteForUpdate.address,
    number: clienteForUpdate.number,
    complement: clienteForUpdate.complement,
    district: clienteForUpdate.district,
    city: clienteForUpdate.city,
    state: clienteForUpdate.state,
    zip_code: clienteForUpdate.zip_code,
    kind: clienteForUpdate.kind,
    cnpj_cpf: clienteForUpdate.cnpj_cpf,
    ins_est: clienteForUpdate.ins_est,
    ins_mun: clienteForUpdate.ins_mun,
    telephone: clienteForUpdate.telephone,
    cellphone: clienteForUpdate.cellphone,
    situation: clienteForUpdate.situation,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCreate = async () => {
    if (
      formData.kind == "F" &&
      !ValidatorDocto.isFormattedCPF(formData.cnpj_cpf)
    ) {
      toast.error("Digito verificador do CPF está incorreto.");
      return;
    }
    if (
      formData.kind == "J" &&
      !ValidatorDocto.isFormattedCNPJ(formData.cnpj_cpf)
    ) {
      toast.error("Digito verificador do CNPJ está incorreto.");
      return;
    }

    try {
      clienteContext.updateCliente(clienteForUpdate.id, {
        nickname: formData.nickname,
        name: formData.name,
        address: formData.address,
        number: formData.number,
        complement: formData.complement,
        district: formData.district,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        kind: formData.kind,
        cnpj_cpf: formData.cnpj_cpf,
        ins_est: formData.ins_est,
        ins_mun: formData.ins_mun,
        telephone: formData.telephone,
        cellphone: formData.cellphone,
        situation: formData.situation,
      });

      toast.success(`Cliente ${formData.name}, foi alterado com sucesso!`);
      // Colocando um estado para atualizar a tabela depois que fizermos qualquer atualização no clientes
      navigate("/clientes", { state: { updated: true } });
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
          address: data.logradouro,
          district: data.bairro,
          city: data.localidade,
          state: data.uf,
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
