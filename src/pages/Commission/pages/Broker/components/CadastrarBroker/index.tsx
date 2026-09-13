import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomButton from "../../../../../../components/CustomButton";
import { CustomDatePicker } from "../../../../../../components/CustomDatePicker";
import { CustomInput } from "../../../../../../components/CustomInput";
import { BrokerContext } from "../../../../../../contexts/BrokerContext";
import { ICreateBrokerData } from "../../../../../../contexts/BrokerContext/types";
import { SButtons, SContainer, SFieldsRow, SForm, STitle } from "../../styles";

const emptyBroker: ICreateBrokerData = {
  mesa: "",
  broker: "",
  product: "",
  broker_name: "",
  broker_nick: "",
  broker_abbrev: "",
  company_name: "",
  cnpj_cpf: "",
  bank_number: "",
  bank_name: "",
  ag_number: "",
  account_number: "",
  date_ini: "",
  date_fin: "",
  commision: 0,
  cctipo: "",
  ccdesconto: 0,
  sca: "",
  aj_prolab: 0,
};

type BrokerFieldName = keyof ICreateBrokerData;

type BrokerFieldConfig = {
  name: BrokerFieldName;
  label: string;
  width: string;
  type?: "text" | "number";
  kind?: "date";
};

const fieldRows: BrokerFieldConfig[][] = [
  [
    { name: "mesa", label: "Mesa", width: "110px" },
    { name: "broker", label: "Broker", width: "130px" },
    { name: "product", label: "Produto", width: "130px" },
  ],
  [
    { name: "broker_name", label: "Nome do Broker", width: "250px" },
    { name: "broker_nick", label: "Apelido", width: "180px" },
    { name: "broker_abbrev", label: "Abreviacao", width: "140px" },
  ],
  [
    { name: "company_name", label: "Empresa", width: "250px" },
    { name: "cnpj_cpf", label: "CNPJ/CPF", width: "170px" },
    { name: "bank_number", label: "Numero Banco", width: "140px" },
  ],
  [
    { name: "bank_name", label: "Banco", width: "220px" },
    { name: "ag_number", label: "Agencia", width: "140px" },
    { name: "account_number", label: "Conta", width: "160px" },
  ],
  [
    { name: "date_ini", label: "Data Inicial", width: "180px", kind: "date" },
    { name: "date_fin", label: "Data Final", width: "180px", kind: "date" },
  ],
  [
    { name: "commision", label: "Comissao", width: "140px", type: "number" },
    { name: "cctipo", label: "Tipo CC", width: "140px" },
    { name: "ccdesconto", label: "Desconto CC", width: "140px", type: "number" },
  ],
  [
    { name: "sca", label: "SCA", width: "140px" },
    { name: "aj_prolab", label: "Ajuste Prolabore", width: "180px", type: "number" },
  ],
];

export function CadastrarBroker() {
  const brokerContext = BrokerContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ICreateBrokerData>(emptyBroker);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = ["commision", "ccdesconto", "aj_prolab"];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value.toUpperCase(),
    }));
  };

  const handleDateChange = (field: "date_ini" | "date_fin", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    if (!formData.broker || !formData.broker_name) {
      toast.error("Preencha os campos obrigatorios.");
      return;
    }

    try {
      await brokerContext.createBroker(formData);
      toast.success("Broker cadastrado com sucesso!");
      navigate("/commission/broker");
    } catch (error) {
      toast.error(`Erro ao cadastrar Broker: ${error}`);
    }
  };

  const renderField = (field: BrokerFieldConfig) => {
    if (field.kind === "date") {
      return (
        <div key={field.name} style={{ paddingBottom: "12px" }}>
          <CustomDatePicker
            width={field.width}
            height="38px"
            name={field.name}
            label={`${field.label}:`}
            $labelPosition="top"
            onChange={(newDate) =>
              handleDateChange(field.name as "date_ini" | "date_fin", newDate)
            }
            value={String(formData[field.name] ?? "")}
            suggestCurrentDateWhenEmpty={false}
          />
        </div>
      );
    }

    return (
      <CustomInput
        key={field.name}
        type={field.type || "text"}
        label={`${field.label}:`}
        $labelPosition="top"
        name={field.name}
        value={String(formData[field.name] ?? "")}
        onChange={handleChange}
        width={field.width}
        height="38px"
      />
    );
  };

  return (
    <SContainer>
      <STitle>Cadastrar Broker</STitle>
      <SForm>
        {fieldRows.map((row) => (
          <SFieldsRow key={row.map((field) => field.name).join("-")}>
            {row.map(renderField)}
          </SFieldsRow>
        ))}
      </SForm>
      <SButtons>
        <CustomButton
          $variant="primary"
          width="120px"
          onClick={() => navigate("/commission/broker")}
        >
          Cancelar
        </CustomButton>
        <CustomButton $variant="success" width="120px" onClick={handleCreate}>
          Gravar
        </CustomButton>
      </SButtons>
    </SContainer>
  );
}
