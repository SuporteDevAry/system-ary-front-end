import { createContext, useContext } from "react";
import { AxiosError } from "axios";
import { Api } from "../../services/api";
import {
  IAuditLog,
  IAuditLogFilters,
  IDevPanelContext,
  IDevPanelProvider,
  ILoginHistory,
  ILoginHistoryFilters,
  IOnlineUser,
  IPaginatedResponse,
  IUserMetric,
} from "./types";

const newContext = createContext<IDevPanelContext>({
  getLoginHistory: () => Promise.resolve({ data: [], total: 0 }),
  getUserMetrics: () => Promise.resolve([]),
  getAuditLog: () => Promise.resolve({ data: [], total: 0 }),
  getOnlineUsers: () => Promise.resolve([]),
});

export const DevPanelProvider = ({ children }: IDevPanelProvider) => {
  async function getLoginHistory(
    filters: ILoginHistoryFilters = {}
  ): Promise<IPaginatedResponse<ILoginHistory>> {
    try {
      const response = await Api.get("/dev-panel/login-history", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string })
          .message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  async function getUserMetrics(): Promise<IUserMetric[]> {
    try {
      const response = await Api.get("/dev-panel/user-metrics");
      return response.data;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string })
          .message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  async function getAuditLog(
    filters: IAuditLogFilters = {}
  ): Promise<IPaginatedResponse<IAuditLog>> {
    try {
      const response = await Api.get("/dev-panel/audit-log", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string })
          .message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  async function getOnlineUsers(): Promise<IOnlineUser[]> {
    try {
      const response = await Api.get("/dev-panel/online-users");
      return response.data;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string })
          .message;
        throw new Error(errorMessage);
      }

      throw error;
    }
  }

  return (
    <newContext.Provider
      value={{ getLoginHistory, getUserMetrics, getAuditLog, getOnlineUsers }}
    >
      {children}
    </newContext.Provider>
  );
};

export const DevPanelContext = () => {
  const context = useContext(newContext);

  return context;
};
