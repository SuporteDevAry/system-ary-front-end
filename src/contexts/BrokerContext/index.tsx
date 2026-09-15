import { createContext, useContext } from "react";
import { AxiosError } from "axios";
import { Api } from "../../services/api";
import {
  IBrokerProvider,
  ICreateBrokerData,
  IUpdateBrokerData,
} from "./types";

interface IBrokerContext {
  listBrokers: () => Promise<any>;
  getBrokerById: (brokerId: string) => Promise<any>;
  createBroker: (brokerData: ICreateBrokerData) => Promise<any>;
  updateBroker: (
    brokerId: string,
    brokerData: IUpdateBrokerData,
  ) => Promise<any>;
  deleteBroker: (brokerId: string) => Promise<any>;
}

const newContext = createContext<IBrokerContext>({
  listBrokers: () => Promise.resolve(),
  getBrokerById: () => Promise.resolve(),
  createBroker: () => Promise.resolve(),
  updateBroker: () => Promise.resolve(),
  deleteBroker: () => Promise.resolve(),
});

export const BrokerProvider = ({ children }: IBrokerProvider) => {
  async function listBrokers(): Promise<any> {
    try {
      const response = await Api.get("/brokers");
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  async function getBrokerById(brokerId: string): Promise<any> {
    try {
      const response = await Api.get(`/brokers/${brokerId}`);
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  async function createBroker(brokerData: ICreateBrokerData): Promise<any> {
    try {
      const response = await Api.post("/brokers", brokerData);
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  async function updateBroker(
    brokerId: string,
    brokerData: IUpdateBrokerData,
  ): Promise<any> {
    try {
      const response = await Api.patch(`/brokers/${brokerId}`, brokerData);
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  async function deleteBroker(brokerId: string): Promise<any> {
    try {
      const response = await Api.delete(`/brokers/${brokerId}`);
      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  return (
    <newContext.Provider
      value={{
        listBrokers,
        getBrokerById,
        createBroker,
        updateBroker,
        deleteBroker,
      }}
    >
      {children}
    </newContext.Provider>
  );
};

export const BrokerContext = () => {
  const context = useContext(newContext);
  return context;
};
