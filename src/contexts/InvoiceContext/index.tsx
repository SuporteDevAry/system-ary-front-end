import { createContext, useContext } from "react";
import {
    IInvoicesProvider,
    ICreateInvoicesData,
    IUpdateInvoicesData,
} from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

interface IInvoiceContext {
    listInvoices: () => Promise<any>;
    createInvoice: (invoiceData: ICreateInvoicesData) => Promise<any>;
    updateInvoice: (invoiceId: string, updateInvoiceData: any) => void;
    deleteInvoice: (invoiceId: string) => void;
    getInvoiceById: (invoiceId: string) => Promise<any>;
    getInvoiceByRps: (invoiceRps: string) => Promise<any>;
    getInvoiceByNfs: (invoiceNfs: string) => Promise<any>;
    getNextNumberRps: () => Promise<any>;
}

const newContext = createContext<IInvoiceContext>({
    listInvoices: () => Promise.resolve(),
    createInvoice: () => Promise.resolve(),
    updateInvoice: () => {},
    deleteInvoice: () => {},
    getInvoiceById: () => Promise.resolve(),
    getInvoiceByRps: () => Promise.resolve(),
    getInvoiceByNfs: () => Promise.resolve(),
    getNextNumberRps: () => Promise.resolve(),
});

export const InvoicesProvider = ({ children }: IInvoicesProvider) => {
    async function listInvoices(): Promise<any> {
        try {
            const response = await Api.get("/invoices");

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

    async function createInvoice(
        invoiceData: ICreateInvoicesData
    ): Promise<any> {
        try {
            const response = await Api.post("/invoices", invoiceData);

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

    async function updateInvoice(
        invoiceId: string,
        updateInvoiceData: IUpdateInvoicesData
    ) {
        try {
            const response = await Api.patch(
                `/invoices/${invoiceId}`,
                updateInvoiceData
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

    async function deleteInvoice(invoiceId: string) {
        try {
            const response = await Api.delete(`/invoices/${invoiceId}`);

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

    async function getInvoiceById(invoiceId: string) {
        try {
            const response = await Api.get(`/invoices/${invoiceId}`);

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

    async function getInvoiceByRps(invoiceRps: string) {
        try {
            const response = await Api.get(`/invoices/rps/${invoiceRps}`);

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

    async function getInvoiceByNfs(invoiceNfs: string) {
        try {
            const response = await Api.get(`/invoices/nfs/${invoiceNfs}`);

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

    async function getNextNumberRps() {
        try {
            const response = await Api.get(`/invoices/nextrps`);
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
                listInvoices,
                createInvoice,
                updateInvoice,
                deleteInvoice,
                getInvoiceById,
                getInvoiceByRps,
                getInvoiceByNfs,
                getNextNumberRps,
            }}
        >
            {children}
        </newContext.Provider>
    );
};

export const InvoiceContext = () => {
    const context = useContext(newContext);

    return context;
};
