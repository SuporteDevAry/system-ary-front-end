import { createContext, useContext } from "react";
import { Api, ApiResponse } from "../../services/api";
import {
  IPriceFixationContractContext,
  IPriceFixationContractData,
  IPriceFixationContractsProvider,
  IFixationItem,
  IPendingFixationItem,
} from "./types";
import { AxiosError } from "axios";

const newContext = createContext<IPriceFixationContractContext>({
  getFixationContractById: () =>
    Promise.resolve({ data: {} as IPriceFixationContractData }),
  listFixationContracts: () => Promise.resolve({ data: [] }),
  createFixationContract: () =>
    Promise.resolve({ data: {} as IPriceFixationContractData }),
  updateFixationContract: () =>
    Promise.resolve({ data: {} as IPriceFixationContractData }),
  deleteFixationContract: () =>
    Promise.resolve({ data: {} as IPriceFixationContractData }),
  addFixationItem: () => Promise.resolve({ data: {} }),
  listFixationItems: () => Promise.resolve({ data: [] as IFixationItem[] }),
  updateFixationItemPdfMetadata: () =>
    Promise.resolve({ data: {} as IFixationItem }),
  listPendingFixationItems: () =>
    Promise.resolve({ data: [] as IPendingFixationItem[] }),
  sendFixationEmail: () => Promise.resolve({ data: {} }),
});

export const PriceFixationContractProvider = ({
  children,
}: IPriceFixationContractsProvider) => {
  const handleApiError = (error: unknown) => {
    const err = error as AxiosError;

    if (err.response && err.response.data) {
      const errorMessage = (err.response.data as { message: string }).message;
      throw new Error(errorMessage);
    }
    return Promise.reject(error);
  };

  async function getFixationContractById(
    contractId: string,
  ): Promise<ApiResponse<IPriceFixationContractData>> {
    try {
      const response = await Api.get(`/grain-fixation-contracts/${contractId}`);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function listFixationContracts(): Promise<ApiResponse<IPriceFixationContractData[]>> {
    try {
      const response = await Api.get("/grain-fixation-contracts");
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function createFixationContract(
    contractData: IPriceFixationContractData,
  ): Promise<ApiResponse<IPriceFixationContractData>> {
    try {
      const response = await Api.post(
        "/grain-fixation-contracts",
        contractData,
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function updateFixationContract(
    contractId: string,
    contractData: IPriceFixationContractData,
  ): Promise<ApiResponse<IPriceFixationContractData>> {
    try {
      const response = await Api.patch(
        `/grain-fixation-contracts/${contractId}`,
        contractData,
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function deleteFixationContract(
    contractId: string,
    contractData: IPriceFixationContractData,
  ): Promise<ApiResponse<IPriceFixationContractData>> {
    try {
      const response = await Api.patch(
        `/grain-fixation-contracts/${contractId}`,
        contractData,
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function addFixationItem(
    contractId: string,
    item: IFixationItem,
  ): Promise<ApiResponse<{ contract: IPriceFixationContractData; item: IFixationItem }>> {
    try {
      const response = await Api.post(
        `/grain-fixation-contracts/${contractId}/fixation-items`,
        item,
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function listFixationItems(
    contractId: string,
  ): Promise<ApiResponse<IFixationItem[]>> {
    try {
      const response = await Api.get(
        `/grain-fixation-contracts/${contractId}/fixation-items`,
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function updateFixationItemPdfMetadata(
    contractId: string,
    itemId: string,
    metadata: Pick<
      IFixationItem,
      "pdf_file_name" | "pdf_file_size_kb" | "pdf_pages"
    >,
  ): Promise<ApiResponse<IFixationItem>> {
    try {
      const response = await Api.patch(
        `/grain-fixation-contracts/${contractId}/fixation-items/${itemId}`,
        metadata,
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function listPendingFixationItems(): Promise<
    ApiResponse<IPendingFixationItem[]>
  > {
    try {
      const response = await Api.get(
        "/grain-fixation-contracts/fixation-items/pending",
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async function sendFixationEmail(
    contractId: string,
    itemId: string,
    data: {
      sender: string;
      list_email_seller?: string[];
      list_email_buyer?: string[];
    },
  ): Promise<any> {
    try {
      const response = await Api.post(
        `/grain-fixation-contracts/${contractId}/fixation-items/${itemId}/send-email`,
        data,
      );
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }

  return (
    <newContext.Provider
      value={{
        getFixationContractById,
        listFixationContracts,
        createFixationContract,
        updateFixationContract,
        deleteFixationContract,
        addFixationItem,
        listFixationItems,
        updateFixationItemPdfMetadata,
        listPendingFixationItems,
        sendFixationEmail,
      }}
    >
      {children}
    </newContext.Provider>
  );
};

export const PriceFixationContractContext = () => {
  const context = useContext(newContext);
  return context;
};
