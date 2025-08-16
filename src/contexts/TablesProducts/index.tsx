import { createContext, useContext } from "react";
import {
  ITableProductsContext,
  ITableProductsData,
  ITableProductsProvider,
} from "./types";
import { Api, ApiResponse } from "../../services/api";
import { AxiosError } from "axios";

const newContext = createContext<ITableProductsContext>({
  listTableProducts: () => Promise.resolve({ data: [] }),
  getTableProductById: () =>
    Promise.resolve({ data: {} as ITableProductsData }),
  createTableProduct: () => Promise.resolve({ data: {} as ITableProductsData }),
  updateTableProduct: () => Promise.resolve({ data: {} as ITableProductsData }),
  deleteTableProduct: () => Promise.resolve({ data: {} as ITableProductsData }),
});

export const TableProductsProvider = ({ children }: ITableProductsProvider) => {
  async function listTableProducts(): Promise<
    ApiResponse<ITableProductsData[]>
  > {
    try {
      const response = await Api.get("/tables-products");
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
      return Promise.reject(error);
    }
  }

  async function getTableProductById(
    tableProductId: string
  ): Promise<ApiResponse<ITableProductsData>> {
    try {
      const response = await Api.get(`/tables-products/${tableProductId}`);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
      return Promise.reject(error);
    }
  }

  async function createTableProduct(
    tableProductData: ITableProductsData
  ): Promise<ApiResponse<ITableProductsData>> {
    try {
      const response = await Api.post("/tables-products", tableProductData);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
      return Promise.reject(error);
    }
  }

  async function updateTableProduct(
    productId: string,
    productData: ITableProductsData
  ): Promise<ApiResponse<ITableProductsData>> {
    try {
      const response = await Api.patch(
        `/tables-products/${productId}`,
        productData
      );

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
      return Promise.reject(error);
    }
  }

  async function deleteTableProduct(
    tableProductId: string
  ): Promise<ApiResponse<ITableProductsData>> {
    try {
      const response = await Api.delete(`/tables-products/${tableProductId}`);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }

      return Promise.reject(error);
    }
  }

  return (
    <newContext.Provider
      value={{
        listTableProducts,
        createTableProduct,
        getTableProductById,
        updateTableProduct,
        deleteTableProduct,
      }}
    >
      {children}
    </newContext.Provider>
  );
};

export const TableProductContext = () => {
  const context = useContext(newContext);

  return context;
};
