import { createContext, useContext } from "react";
import {
    IBillingsProvider,
    ICreateBillingsData,
    IUpdateBillingsData,
} from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

interface IBillingContext {
    listBillings: () => Promise<any>;
    createBilling: (BillingData: ICreateBillingsData) => Promise<any>;
    updateBilling: (billingId: string, updateBillingData: any) => void;
    deleteBilling: (billingId: string) => void;
    getBillingById: (billingId: string) => Promise<any>;
    getBillingByRps: (billingRps: string) => Promise<any>;
    getBillingByNfs: (billingNfs: string) => Promise<any>;
    getBillingByNumberContract: (billingNfs: string) => Promise<any>;
}

const newContext = createContext<IBillingContext>({
    listBillings: () => Promise.resolve(),
    createBilling: () => Promise.resolve(),
    updateBilling: () => {},
    deleteBilling: () => {},
    getBillingById: () => Promise.resolve(),
    getBillingByRps: () => Promise.resolve(),
    getBillingByNfs: () => Promise.resolve(),
    getBillingByNumberContract: () => Promise.resolve(),
});

export const BillingsProvider = ({ children }: IBillingsProvider) => {
    async function listBillings(): Promise<any> {
        try {
            const response = await Api.get("/billings");
            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    async function createBilling(
        billingData: ICreateBillingsData
    ): Promise<any> {
        try {
            const response = await Api.post("/billings", billingData);

            return response;
        } catch (error) {
            console.log("### error", error);
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    async function updateBilling(
        billingId: string,
        updateBillingData: IUpdateBillingsData
    ) {
        try {
            const response = await Api.patch(
                `/billings/${billingId}`,
                updateBillingData
            );
            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    async function deleteBilling(billingId: string) {
        try {
            const response = await Api.delete(`/billings/${billingId}`);

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    async function getBillingById(billingId: string) {
        try {
            const response = await Api.get(`/billings/${billingId}`);

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    async function getBillingByRps(billingRps: string) {
        try {
            const response = await Api.get(`/billings/rps/${billingRps}`);

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    async function getBillingByNfs(billingNfs: string) {
        try {
            const response = await Api.get(`/billings/nfs/${billingNfs}`);

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    async function getBillingByNumberContract(billingNumberContract: string) {
        try {
            const response = await Api.get(
                `/billings/nfs/${billingNumberContract}`
            );

            return response;
        } catch (error) {
            const err = error as AxiosError;

            if (err.response && err.response.data) {
                const errorMessage = (err.response.data as { message: string })
                    .message;
                throw new Error(errorMessage);
            }
        }
    }

    return (
        <newContext.Provider
            value={{
                listBillings,
                createBilling,
                updateBilling,
                deleteBilling,
                getBillingById,
                getBillingByRps,
                getBillingByNfs,
                getBillingByNumberContract,
            }}
        >
            {children}
        </newContext.Provider>
    );
};

export const BillingContext = () => {
    const context = useContext(newContext);

    return context;
};
