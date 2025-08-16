import { AxiosError } from "axios";
import { Api, ApiResponse } from "../../services/api";
import { IProductContext, IProductsData, IProductsProvider } from "./types";
import { createContext, useContext } from "react";

const newContext = createContext<IProductContext>({
  listProducts: () => Promise.resolve({ data: [] }),
  getProductById: () => Promise.resolve({ data: {} as IProductsData }),
  createProduct: () => Promise.resolve({ data: {} as IProductsData }),
  updateProduct: () => Promise.resolve({ data: {} as IProductsData }),
  deleteProduct: () => Promise.resolve({ data: {} as IProductsData }),
});

export const ProductProvider = ({ children }: IProductsProvider) => {
  async function listProducts(): Promise<ApiResponse<IProductsData[]>> {
    try {
      const response = await Api.get("/products");
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

  async function getProductById(
    productId: string
  ): Promise<ApiResponse<IProductsData>> {
    try {
      const response = await Api.get(`/products/${productId}`);

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

  async function createProduct(
    productData: IProductsData
  ): Promise<ApiResponse<IProductsData>> {
    try {
      const response = await Api.post("/products", productData);

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

  async function updateProduct(
    productId: string,
    productData: IProductsData
  ): Promise<ApiResponse<IProductsData>> {
    try {
      const response = await Api.patch(`/products/${productId}`, productData);

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

  async function deleteProduct(
    productId: string
  ): Promise<ApiResponse<IProductsData>> {
    try {
      const response = await Api.delete(`/products/${productId}`);

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
        listProducts,
        createProduct,
        getProductById,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </newContext.Provider>
  );
};

export const ProductContext = () => {
  const context = useContext(newContext);

  return context;
};
