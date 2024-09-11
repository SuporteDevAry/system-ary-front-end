import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BoxContainer,
  SBox,
  SCardContainer,
  SCardInfo,
  SCardInfoActions,
  SCardInfoNumber,
  SContainer,
  SKeyContainer,
  SkeyName,
  SKeyValue,
  SNumberContract,
  STitle,
} from "./styles";

import { useLocation, useNavigate } from "react-router-dom";

// import { toast } from "react-toastify";
//import CardContent from "@mui/material/CardContent";
import { IContractData } from "../../../../../../contexts/ContractContext/types";
import CustomButton from "../../../../../../components/CustomButton";
import { formatCurrency } from "../../../../../../helpers/currencyFormat";

export function ViewContract(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [dataClient, setDataClient] = useState<IContractData | null>(null);

  useEffect(() => {
    const contractForView: IContractData = location.state?.contractForView;
    setDataClient(contractForView);
    //Remover depois de fechar
    console.log("testesss", dataClient);
  }, [location]);

  const handleEdit = () => {
    // Navegar para a rota de criação de contrato com os dados do contrato
    navigate("/caminho/para/criar/contrato", {
      state: { contractData: dataClient },
    });
  };

  const contractFields = [
    { label: "Produto", value: dataClient?.name_product },
    { label: "Vendedor", value: dataClient?.seller.name },
    { label: "Comprador", value: dataClient?.buyer.name },
    {
      label: "Preço",
      value: formatCurrency(
        dataClient?.price?.toString() ?? "0",
        dataClient?.type_currency ?? "Real"
      ),
    },
    {
      label: "Quantidade por Saca",
      value:
        dataClient?.quantity_bag && dataClient?.type_currency
          ? Number(dataClient.quantity_bag).toFixed(2)
          : "0,00",
    },
    {
      label: "Total do Contrato",
      value: formatCurrency(
        dataClient?.total_contract_value?.toString() ?? "0",
        dataClient?.type_currency ?? "Real"
      ),
    },
  ];

  return (
    <>
      <SContainer>
        <STitle>Dados do Contrato</STitle>
        <SBox>
          <SCardInfoNumber>
            <SKeyContainer>
              <SkeyName>
                Nº Contrato:
                <SNumberContract>{dataClient?.number_contract}</SNumberContract>
              </SkeyName>
            </SKeyContainer>
          </SCardInfoNumber>
          <SCardInfoActions>
            <SKeyContainer>
              <SkeyName>
                Status:
                <SKeyValue>{dataClient?.status.status_current}</SKeyValue>
              </SkeyName>
            </SKeyContainer>
            <BoxContainer>
              <CustomButton
                $variant="secondary"
                width="90px"
                onClick={() => console.log()}
              >
                Visualizar
              </CustomButton>
              <CustomButton
                $variant={"primary"}
                width="70px"
                onClick={handleEdit}
              >
                Editar
              </CustomButton>
              <CustomButton
                $variant="danger"
                width="70px"
                onClick={() => console.log()}
              >
                Deletar
              </CustomButton>
            </BoxContainer>
          </SCardInfoActions>
        </SBox>

        <SCardInfo>
          {contractFields.map((field, index) => (
            <SKeyContainer key={index}>
              <SkeyName>
                {field.label}:<SKeyValue>{field.value}</SKeyValue>
              </SkeyName>
            </SKeyContainer>
          ))}
        </SCardInfo>
      </SContainer>
    </>
  );
}
