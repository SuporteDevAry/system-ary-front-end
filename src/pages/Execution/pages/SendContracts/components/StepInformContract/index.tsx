import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../../../../../components/CustomSearch";
import CustomTable from "../../../../../../components/CustomTable";
import { ContractContext } from "../../../../../../contexts/ContractContext";
import { StepProps } from "../../types";
import { SContainer, SContainerSearchAndButton } from "./styles";
import { IContractData } from "../../../../../../contexts/ContractContext/types";
import { toast } from "react-toastify";
import { useTableSearch } from "../../../../../../hooks";
import { IColumn } from "../../../../../../components/CustomTable/types";

export const StepInformContract: React.FC<StepProps> = ({
  id,
  updateFormData,
}) => {
  const contractContext = ContractContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listcontracts, setListContracts] = useState<IContractData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("created_at");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contractContext.listContracts();

      setListContracts(
        response.data.filter(
          (contract: IContractData) =>
            contract.status.status_current === "VALIDADO"
        )
      );
    } catch (error) {
      toast.error(
        `Erro ao tentar ler contratos, contacte o administrador do sistema: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [contractContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { filteredData, handleSearch } = useTableSearch({
    data: listcontracts,
    searchTerm,
    searchableFields: ["number_contract"],
  });

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  const handleViewContract = (contract: IContractData) => {
    updateFormData?.({
      id: contract.id,
      contract_emission_date: contract.contract_emission_date,
      number_contract: contract.number_contract,
      number_broker: contract.number_broker,
      seller: {
        address: contract.seller.address,
        city: contract.seller.city,
        cnpj_cpf: contract.seller.cnpj_cpf,
        district: contract.seller.district,
        ins_est: contract.seller.ins_est,
        name: contract.seller.name,
        number: contract.seller.number,
        state: contract.seller.state,
        complement: contract.seller.complement,
        account: contract.seller.account,
      },
      buyer: {
        address: contract.buyer.address,
        city: contract.buyer.city,
        cnpj_cpf: contract.buyer.cnpj_cpf,
        district: contract.buyer.district,
        ins_est: contract.buyer.ins_est,
        name: contract.buyer.name,
        number: contract.buyer.number,
        state: contract.buyer.state,
        complement: contract.buyer.complement,
        account: contract.buyer.account,
      },
      list_email_seller: contract.list_email_seller,
      list_email_buyer: contract.list_email_buyer,
      product: contract.product,
      name_product: contract.name_product,
      crop: contract.crop,
      quality: contract.quality,
      quantity: contract.quantity,
      type_currency: contract.type_currency,
      price: contract.price,
      type_icms: contract.type_icms,
      icms: contract.icms,
      payment_date: contract.payment_date,
      payment: contract.payment,
      type_commission_seller: contract.type_commission_seller,
      commission_seller: contract.commission_seller,
      type_commission_buyer: contract.type_commission_buyer,
      commission_buyer: contract.commission_buyer,
      type_pickup: contract.type_pickup,
      pickup: contract.pickup,
      pickup_location: contract.pickup_location,
      inspection: contract.inspection,
      observation: contract.observation,
      owner_contract: contract.owner_contract,
      total_contract_value: contract.total_contract_value,
      quantity_bag: contract.quantity_bag,
      quantity_kg: contract.quantity_kg,
      status: {
        status_current: contract.status.status_current,
        history: contract.status.history,
      },
      destination: contract.destination,
      complement_destination: contract.complement_destination,
      number_external_contract_seller: contract.number_external_contract_seller,
      number_external_contract_buyer: contract.number_external_contract_buyer,
      day_exchange_rate: contract.day_exchange_rate,
      farm_direct: contract.farm_direct,
      initial_pickup_date: contract.initial_pickup_date,
      final_pickup_date: contract.final_pickup_date,
      internal_communication: contract.internal_communication,
      type_quantity: contract.type_quantity,
    });

    toast.success(
      <div>
        Contrato de Número:
        <pre>
          <strong>{contract.number_contract}</strong>
        </pre>
        foi selecionado, agora avance para a próxima etapa!
      </div>
    );
  };

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "status.status_current",
        header: "Status",
        width: "90px",
        sortable: true,
      },
      {
        field: "number_contract",
        header: "Nº Contrato",
        width: "160px",
        sortable: true,
      },
      {
        field: "created_at",
        header: "Data de Criação",
        width: "50px",
        sortable: true,
      },
      {
        field: "seller.name",
        header: "Vendedor",
        width: "160px",
        sortable: true,
      },
      {
        field: "buyer.name",
        header: "Comprador",
        width: "150px",
        sortable: true,
      },
    ],
    []
  );

  return (
    <>
      <SContainer id={id}>
        <SContainerSearchAndButton>
          <CustomSearch
            width="400px"
            placeholder="Digite o Nº Contrato"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SContainerSearchAndButton>
        <CustomTable
          isLoading={isLoading}
          data={filteredData}
          columns={nameColumns}
          hasPagination
          dateFields={["created_at"]}
          maxChars={15}
          page={page}
          setPage={setPage}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
          hasCheckbox
          onRowClick={(rowData) => handleViewContract(rowData as IContractData)}
        />
      </SContainer>
    </>
  );
};
