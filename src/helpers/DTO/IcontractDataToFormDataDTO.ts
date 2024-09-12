import { IContractData } from "../../contexts/ContractContext/types";
import { FormDataContract } from "../../pages/Contracts/pages/CreateNewContract/types";

export const IContractDataToFormDataDTO = (
  data: IContractData
): FormDataContract => {
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
    quantity: data.quantity.toString(),
    type_currency: data.type_currency,
    price: data.price.toString(),
    type_icms: data.type_icms,
    icms: data.icms,
    payment: data.payment,
    commission_seller: data?.commission_seller?.toString(),
    commission_buyer: data?.commission_buyer?.toString(),
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
  };
};
