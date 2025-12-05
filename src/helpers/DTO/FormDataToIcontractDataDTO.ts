import { IContractData } from "../../contexts/ContractContext/types";
import { FormDataContract } from "../../pages/Contracts/pages/CreateNewContract/types";
import { parseQuantityToNumber } from "../quantityFormat";

// Função auxiliar para converter "DD/MM/AAAA" para "AAAA-MM-DD"
export const convertToISODateForEmission = (
  dateString: string | Date | undefined
): string | undefined => {
  if (typeof dateString === "string" && dateString.includes("/")) {
    const [day, month, year] = dateString.split("/");
    // Retorna a string no formato AAAA-MM-DD, que o backend pode parsear corretamente.
    return `${year}-${month}-${day}`;
  }

  if (dateString instanceof Date) {
    return dateString.toISOString().split("T")[0]; // Opcional: garantir formato AAAA-MM-DD
  }
  return dateString as string | undefined;
};

export const FormDataToIContractDataDTO = (
  data: FormDataContract
): IContractData => {
  return {
    id: data.id,
    number_contract: data.number_contract,
    number_broker: data.number_broker,
    seller: data.seller,
    buyer: data.buyer,
    list_email_seller: data.list_email_seller,
    list_email_buyer: data.list_email_buyer,
    product: data.product,
    name_product: data.name_product,
    crop: data.crop,
    quality: data.quality,
    quantity: parseQuantityToNumber(data.quantity),
    type_currency: data.type_currency,
    price: parseFloat(data.price.replace(",", ".")),
    type_icms: data.type_icms,
    icms: data.icms,
    payment: data.payment,
    type_commission_seller: data?.type_commission_seller,
    commission_seller: data?.commission_seller,
    type_commission_buyer: data?.type_commission_buyer,
    commission_buyer: data?.commission_buyer,
    type_pickup: data.type_pickup,
    pickup: data.pickup,
    pickup_location: data.pickup_location,
    inspection: data.inspection,
    observation: data.observation,
    owner_contract: data.owner_contract,
    total_contract_value: data.total_contract_value,
    quantity_kg: data.quantity_kg,
    quantity_bag: data.quantity_bag,
    status: {
      status_current: data.status.status_current || "",
      history: data.status.history || [],
    },
    contract_emission_date:
      convertToISODateForEmission(data.contract_emission_date) || "",
    destination: data.destination,
    number_external_contract_buyer: data.number_external_contract_buyer,
    number_external_contract_seller: data.number_external_contract_seller,
    day_exchange_rate: data.day_exchange_rate,
    payment_date: data.payment_date,
    farm_direct: data.farm_direct,
    initial_pickup_date: data.initial_pickup_date,
    final_pickup_date: data.final_pickup_date,
    internal_communication: data.internal_communication,
    complement_destination: data?.complement_destination,
    type_quantity: data?.type_quantity,
    table_id: data?.table_id,
    final_quantity: parseQuantityToNumber(data?.final_quantity || "0"),
    status_received: data?.status_received,
    commission_contract: data?.commission_contract,
    charge_date: data?.charge_date,
    expected_receipt_date: data?.expected_receipt_date,
    total_received: data?.total_received,
  };
};
