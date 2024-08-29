import { createContext, useContext } from "react";
import { INotificationsProvider, IUpdateNotificationData } from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";

interface INotificationContext {
  listUserNotifications: (user: string) => Promise<any>;
  updateNotification: (id: string, updateNotificationData: any) => void;
}

const newContext = createContext<INotificationContext>({
  listUserNotifications: () => Promise.resolve(),
  updateNotification: () => Promise.resolve(),
});

export const NotificationsProvider = ({ children }: INotificationsProvider) => {
  async function listUserNotifications(user: string): Promise<any> {
    try {
      const response = await Api.get(`/notifications/user/${user}`);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
    }
  }

  async function updateNotification(
    id: string,
    updateNotificationData: IUpdateNotificationData
  ) {
    try {
      const response = await Api.patch(
        `/notification/${id}`,
        updateNotificationData
      );
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
    <newContext.Provider value={{ listUserNotifications, updateNotification }}>
      {children}
    </newContext.Provider>
  );
};

export const NotificationContext = () => {
  const context = useContext(newContext);

  return context;
};
