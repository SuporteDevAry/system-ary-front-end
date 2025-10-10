import { createContext, useContext } from "react";
import { Api, ApiResponse } from "../../services/api";
import { IContractContext, IContractData, IContractsProvider } from "./types";
import { AxiosError } from "axios";

const newContext = createContext<IContractContext>({
    getGrainContractById: () => Promise.resolve({ data: {} as IContractData }),
    listContracts: () => Promise.resolve({ data: [] }),
    createContract: () => Promise.resolve({ data: {} as IContractData }),
    updateContract: () => Promise.resolve({ data: {} as IContractData }),
    deleteContract: () => Promise.resolve({ data: {} as IContractData }),
    updateContractAdjustments: () =>
        Promise.resolve({ data: {} as IContractData }),
});

export const ContractProvider = ({ children }: IContractsProvider) => {
    async function getGrainContractById(
        contractId: string
    ): Promise<ApiResponse<IContractData>> {
        try {
            const response = await Api.get(`/grain-contracts/${contractId}`);

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
            return Promise.reject(error);
        }
    }

    async function listContracts(): Promise<ApiResponse<IContractData[]>> {
        try {
            const response = await Api.get("/grain-contracts");
            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
            return Promise.reject(error);
        }
    }

    async function createContract(
        contractData: IContractData
    ): Promise<ApiResponse<IContractData>> {
        try {
            const response = await Api.post("/grain-contracts", contractData);

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
            return Promise.reject(error);
        }
    }

    async function updateContract(
        contractId: string,
        contractData: IContractData
    ): Promise<ApiResponse<IContractData>> {
        try {
            const response = await Api.patch(
                `/grain-contracts/${contractId}`,
                contractData
            );

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
            return Promise.reject(error);
        }
    }

    async function deleteContract(
        contractId: string,
        contractData: IContractData
    ): Promise<ApiResponse<IContractData>> {
        try {
            const response = await Api.patch(
                `/grain-contracts/${contractId}`,
                contractData
            );

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }

            return Promise.reject(error);
        }
    }

    async function updateContractAdjustments(
        contractId: string,
        contractData: Partial<IContractData>
    ): Promise<ApiResponse<Partial<IContractData>>> {
        try {
            const response = await Api.patch(
                `/grain-contracts/update-contract-adjustments/${contractId}`,
                contractData
            );

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
            return Promise.reject(error);
        }
    }

    return (
        <newContext.Provider
            value={{
                listContracts,
                getGrainContractById,
                createContract,
                updateContract,
                deleteContract,
                updateContractAdjustments,
            }}
        >
            {children}
        </newContext.Provider>
    );
};

export const ContractContext = () => {
    const context = useContext(newContext);

    return context;
};
