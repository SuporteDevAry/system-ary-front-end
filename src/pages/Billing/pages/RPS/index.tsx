import { useCallback, useEffect, useState } from "react";
import { SBox, SContainer } from "./styles";
import { useNavigate, useLocation } from "react-router-dom";
import { FormularioNF } from "../../../../components/FormularioNF";
import { toast } from "react-toastify";
//import { ClienteContext } from "../../../../contexts/ClienteContext";
import { InvoiceContext } from "../../../../contexts/InvoiceContext";
import dayjs from "dayjs";

export function RPS(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceContext = InvoiceContext();
  const currentDate = dayjs().format("DD/MM/YYYY");
  const [cnpjContract, setCnpjContract] = useState("");
  const [cnpjFound, setCnpjFound] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string>("");

  const initialformData = {
    rps_number: "",
    rps_emission_date: currentDate,
    nfs_number: "",
    nfs_emission_date: "",
    service_code: "",
    aliquot: 0,
    cpf_cnpj: "",
    name: "",
    address: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    zip_code: "",
    email: "",
    service_discrim: "",
    service_value: 0,
    name_adjust1: "",
    value_adjust1: 0,
    name_adjust2: "",
    value_adjust2: 0,
    irrf_value: 0,
    service_liquid_value: 0,
    deduction_value: 0,
  };

  const [formData, setFormData] = useState({
    rps_number: "",
    rps_emission_date: currentDate,
    nfs_number: "",
    nfs_emission_date: "",
    service_code: "",
    aliquot: 0,
    cpf_cnpj: "",
    name: "",
    address: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    zip_code: "",
    email: "",
    service_discrim: "",
    service_value: 0,
    name_adjust1: "",
    value_adjust1: 0,
    name_adjust2: "",
    value_adjust2: 0,
    irrf_value: 0,
    service_liquid_value: 0,
    deduction_value: 0,
  });

  //const clienteContext = ClienteContext();

  const fetchData = useCallback(async () => {
    // Verifica se está em modo de edição
    const editingInvoice = location.state?.editingInvoice;

    if (editingInvoice) {
      setIsEditing(true);
      setEditingId(editingInvoice.id);
      setCnpjFound(true);

      // Preenche o formulário com os dados da RPS
      setFormData({
        rps_number: editingInvoice.rps_number || "",
        rps_emission_date: editingInvoice.rps_emission_date
          ? dayjs(editingInvoice.rps_emission_date).format("DD/MM/YYYY")
          : currentDate,
        nfs_number: editingInvoice.nfs_number || "",
        nfs_emission_date: editingInvoice.nfs_emission_date
          ? dayjs(editingInvoice.nfs_emission_date).format("DD/MM/YYYY")
          : "",
        service_code: editingInvoice.service_code || "",
        aliquot: editingInvoice.aliquot || 0,
        cpf_cnpj: editingInvoice.cpf_cnpj || "",
        name: editingInvoice.name || "",
        address: editingInvoice.address || "",
        number: editingInvoice.number || "",
        complement: editingInvoice.complement || "",
        district: editingInvoice.district || "",
        city: editingInvoice.city || "",
        state: editingInvoice.state || "",
        zip_code: editingInvoice.zip_code || "",
        email: editingInvoice.email || "",
        service_discrim: editingInvoice.service_discrim || "",
        service_value: editingInvoice.service_value || 0,
        name_adjust1: editingInvoice.name_adjust1 || "",
        value_adjust1: editingInvoice.value_adjust1 || 0,
        name_adjust2: editingInvoice.name_adjust2 || "",
        value_adjust2: editingInvoice.value_adjust2 || 0,
        irrf_value: editingInvoice.irrf_value || 0,
        service_liquid_value: editingInvoice.service_liquid_value || 0,
        deduction_value: editingInvoice.deduction_value || 0,
      });
      return;
    }

    const cnpj = "";
    // const cnpj =
    //     location.state?.selectedContract.seller.account[0].cnpj_pagto.replace(
    //         /\.|-|\//g,
    //         ""
    //     );

    setCnpjContract(cnpj);

    setFormData((prev) => ({
      ...prev,
      cpf_cnpj: cnpj,
    }));

    const nextNumberRps = await invoiceContext.getNextNumberRps();
    setFormData((prev) => ({
      ...prev,
      rps_number: nextNumberRps.data.nextNumber,
    }));

    try {
      //const response = await clienteContext.getClientByCnpj_cpf(cnpj);
      // if (response.status == "200") {
      //     setFormData((prev) => ({
      //         ...prev,
      //         cpf_cnpj: cnpj,
      //         name: response.data.name || "",
      //         address: response.data.address || "",
      //         number: response.data.number || "",
      //         district: response.data.district || "",
      //         city: response.data.city || "",
      //         state: response.data.state || "",
      //         zip_code: response.data.zip_code || "",
      //     }));
      // }
    } catch (error) {
      setCnpjFound(false);
      setFormData((prev) => ({
        ...prev,
        cpf_cnpj: cnpj,
      }));
    }
  }, [cnpjContract, location.state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const larguraValor = 15; // largura da coluna dos valores
    const colunaTotal = 40; // posição onde o valor deve começar

    // Função para gerar a linha com pontos dinâmicos
    function formatLinha(nome: string, valor: number | string) {
      const valorStr = Number(valor).toFixed(2).padStart(larguraValor, " ");
      const pontosQtd = colunaTotal - nome.length - valorStr.length;
      const pontos = ".".repeat(pontosQtd > 0 ? pontosQtd : 0);
      return `${nome}${pontos} R$ ${valorStr}`;
    }

    // Linhas principais
    const linhaTotalServicos = formatLinha(
      "TOTAL DOS SERVIÇOS",
      formData.service_value
    );
    const linhaIRRF = formatLinha("(-) I.R.R.F.", formData.irrf_value);
    const linhaAjuste1 =
      formData.name_adjust1.length > 0
        ? formatLinha(formData.name_adjust1, formData.value_adjust1)
        : "";
    const linhaTotalPago = formatLinha(
      "VALOR A SER PAGO",
      formData.service_liquid_value
    );

    const contract = "";
    const dadosContrato = {
      service_discrim: `Intermediação de Negócios:

CTR. ${contract}

${linhaTotalServicos}
${linhaIRRF}
${linhaAjuste1}
${linhaTotalPago}


Depositar no Banco Bradesco S.A. (237)       Ag. 0108-2       C/C. 132.362-8`,
    };

    setFormData({ ...formData, ...dadosContrato });
  }, [
    formData.service_value,
    formData.irrf_value,
    formData.name_adjust1,
    formData.value_adjust1,
    formData.service_liquid_value,
  ]);

  const checkCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cnpjFound) return;

    const cnpj = e.target.value
      .replace(/\D/g, "")
      .replace(".", "")
      .replace("/", "")
      .replace("-", "");

    //fetch(`${process.env.REACT_APP_URL_CNPJ}/${cnpj}`)
    if (cnpj.length > 11) {
      fetch(` /api-cnpj/cnpj/${cnpj}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status == "ERROR") {
            toast.error(`${data.message}`);
            setFormData({
              ...initialformData,
              cpf_cnpj: cnpj,
            });
          }

          setFormData((prev) => ({
            ...prev,
            name: data.nome || "",
            address: data.logradouro || "",
            number: data.numero || "",
            district: data.bairro || "",
            city: data.municipio || "",
            state: data.uf || "",
            zip_code: data.cep || "",
          }));
        });
    }
  };

  const handleCreate = async () => {
    try {
      if (isEditing) {
        // Atualiza RPS existente
        await invoiceContext.updateInvoice(editingId, formData);
        toast.success(`RPS ${formData.rps_number} atualizada com sucesso!`);
      } else {
        // Cria nova RPS
        await invoiceContext.createInvoice({
          ...formData,
          //service_code: location.state?.selectedContract.number_contract,
        });
        toast.success(`RPS ${formData.rps_number} foi gravada com sucesso!`);
      }
      navigate("/cobranca/notafiscal");
    } catch (error: any) {
      console.error(error);
      toast.error(
        `Erro ao ${isEditing ? "atualizar" : "criar"} a RPS: ${
          error.message || String(error)
        }`
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <>
      <SContainer>
        <SBox>
          <FormularioNF
            titleText={isEditing ? "Editar RPS" : "Cadastro RPS"}
            data={formData}
            onHandleCreate={handleCreate}
            onChange={handleChange}
            onCheckCNPJ={checkCNPJ}
          />
        </SBox>
      </SContainer>
    </>
  );
}
