import { createContext, useContext } from "react";
import { Api } from "../../services/api";
import { IContractContext, IContractData, IContractsProvider } from "./types";
import { AxiosError } from "axios";

const newContext = createContext<IContractContext>({
  listContracts: () => Promise.resolve([]),
  createContract: () => Promise.resolve(),
});

export const ContractProvider = ({ children }: IContractsProvider) => {
  async function listContracts(): Promise<any> {
    try {
      const response = await Api.get("/grain-contracts");
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function createContract(contractData: IContractData): Promise<any> {
    try {
      const response = await Api.post("/grain-contracts", contractData);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  return (
    <newContext.Provider value={{ listContracts, createContract }}>
      {children}
    </newContext.Provider>
  );
};

export const ContractContext = () => {
  const context = useContext(newContext);

  return context;
};
