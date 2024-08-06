import { createContext, useContext } from "react";
import { INotificationsProvider, IUpdateNotificationData } from "./types";
import { Api } from "../../services/api";

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
            console.log("Context: ", user);

            const response = await Api.get(`/notifications/user/${user}`);

            console.log("Context: ", response);

            return response;
        } catch (error) {
            console.error("Erro lendo notificações:", error);
            throw error;
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
            console.error("Erro alterando notificação:", error);
        }
    }

    return (
        <newContext.Provider
            value={{ listUserNotifications, updateNotification }}
        >
            {children}
        </newContext.Provider>
    );
};

export const NotificationContext = () => {
    const context = useContext(newContext);

    return context;
};
