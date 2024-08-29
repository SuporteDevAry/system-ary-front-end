import { IContractData } from "../../contexts/ContractContext/types";
import { FormDataContract } from "../../pages/Contracts/pages/CreateNewContract/types";

export const FormDataToIContractDataDTO = (
  data: FormDataContract
): IContractData => {
  return {
    number_broker: data.numberBroker,
    seller: data.seller,
    buyer: data.buyer,
    list_email_seller: data.listEmailSeller,
    list_email_buyer: data.listEmailBuyer,
    product: data.product,
    name_product: data.nameProduct,
    crop: data.crop,
    quality: data.quality,
    quantity: parseFloat(data.quantity.replace(",", ".")),
    type_currency: data.typeCurrency,
    price: parseFloat(data.price.replace(",", ".")),
    type_icms: data.typeICMS,
    icms: data.icms,
    payment: data.payment,
    commission_seller: parseFloat(data?.commissionSeller ?? ""),
    commission_buyer: parseFloat(data?.commissionBuyer ?? ""),
    type_pickup: data.typePickup,
    pickup: data.pickup,
    pickup_location: data.pickupLocation,
    inspection: data.inspection,
    observation: data.observation,
    owner_contract: data.owner_contract,
    total_contract_value: data.total_contract_value,
    quantity_kg: data.quantity_kg,
    quantity_bag: data.quantity_bag,
  };
};
