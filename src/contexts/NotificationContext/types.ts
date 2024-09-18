export interface INotificationsProvider {
    children: JSX.Element;
}

export interface INotifications {
    id: string;
    user: string;
    read: boolean;
    content: string;
    type: string;
    isLoading: boolean;
    created_at: string;
    updated_at: string;
}

export interface ICreateNotificationData {
    user: string;
    read: boolean;
    content: string;
    type: string;
    isLoading: boolean;
}

export interface IUpdateNotificationData {
    read: boolean;
}
