import { useEffect, useState } from "react";
import {
  SBox,
  SCardInfo,
  SContainer,
  SKeyContainer,
  SkeyName,
  SKeyValue,
  STitle,
} from "./styles";

import { useLocation } from "react-router-dom";

import { IProductsData } from "../../../../contexts/Products/types";

export function ViewProduct(): JSX.Element {
  const location = useLocation();

  const [dataProduct, setDataProduct] = useState<IProductsData | null>(null);

  useEffect(() => {
    const productForView: IProductsData = location.state?.productForView;
    setDataProduct(productForView);
  }, [location]);

  const typeComission =
    dataProduct?.type_commission_seller === "Percentual" ? "%" : "R$";

  const contractFields = [
    { label: "Sigla", value: dataProduct?.product_type },
    { label: "Nome", value: dataProduct?.name },
    { label: "Qualidade", value: dataProduct?.quality },
    { label: "Observação", value: dataProduct?.observation },
    {
      label: "Comissão vendedor ",
      value: `${typeComission} ${dataProduct?.commission_seller}`,
    },
  ];

  return (
    <>
      <SContainer>
        <STitle>Dados do Produto</STitle>
        <SBox>
          <SCardInfo>
            {contractFields.map((field, index) => (
              <SKeyContainer key={index}>
                <SkeyName>
                  {field.label}:<SKeyValue>{field.value}</SKeyValue>
                </SkeyName>
              </SKeyContainer>
            ))}
          </SCardInfo>
        </SBox>
      </SContainer>
    </>
  );
}
