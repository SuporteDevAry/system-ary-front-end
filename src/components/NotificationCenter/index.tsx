import { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Box,
    IconButton,
    Popper,
    Fade,
    Typography,
    FormGroup,
    FormControlLabel,
    Switch,
    Stack,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import CheckIcon from "@mui/icons-material/Check";

import { SButtonApaga, SButtonMarcaLida } from "./style";
import { getUserLocalStorage } from "../../contexts/AuthProvider/util";
import { NotificationContext } from "../../contexts/NotificationContext";
import { INotifications } from "../../contexts/NotificationContext/types";

export function NotificationCenter() {
    const moka_notifications = [
        {
            id: "68d503be-db61-4930-94f3-1e2cb42ea3fe",
            user: "carlos@dev.com",
            read: false,
            content: "Notificação 2, Contrato conferido pela execução.",
            type: "info",
            isLoading: false,
            created_at: "2024-08-06T23:50:30.241Z",
            updated_at: "2024-08-06T23:50:30.241Z",
        },
        {
            id: "50c37b63-dbf9-4d14-bc38-3237650fd8d4",
            user: "carlos@dev.com",
            read: false,
            content: "Notificação 4, Contrato validado pela execução.",
            type: "info",
            isLoading: false,
            created_at: "2024-08-06T23:52:15.234Z",
            updated_at: "2024-08-06T23:52:15.234Z",
        },
    ];

    const token = getUserLocalStorage();
    const parsejwt = JSON.parse(atob(token.token.split(".")[1]));
    const user = parsejwt.email;

    const notificationContext = NotificationContext();

    const [notifications, setNotifications] = useState<INotifications[]>([]);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const toggleNotificationCenter = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setIsOpen(!isOpen);
    };

    const toggleFilter = () => {
        setShowUnreadOnly(!showUnreadOnly);
    };

    const toggleRead = (notification_id: any) => {
        const updatedNotifications = notifications.map((notification, id) =>
            notification.id === notification_id
                ? { ...notification, read: !notification.read }
                : notification
        );
        setNotifications(updatedNotifications);
    };

    const clear = () => {
        setNotifications([]);
    };

    const toogleAllAsRead = () => {
        const updatedNotifications = notifications.map((notification) => ({
            ...notification,
            read: true,
        }));
        setNotifications(updatedNotifications);
    };

    const fetchData = async () => {
        try {
            const response = await notificationContext.listUserNotifications(
                `${user}`
            );
            console.log("Component: ", response);
            setNotifications(response);

            // mokado
            setNotifications(moka_notifications);
        } catch (error) {
            console.error("Erro lendo notificações:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Chama fetchData apenas uma vez quando o componente é montado

    var unreadCount = notifications.length;

    return (
        <Box sx={{ margin: "8px" }}>
            <IconButton size="large" onClick={toggleNotificationCenter}>
                <Badge badgeContent={unreadCount} color="primary">
                    <MailIcon color="action" />
                </Badge>
            </IconButton>
            <Popper open={isOpen} anchorEl={anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Box>
                            <Box
                                sx={{
                                    background: "#666",
                                    padding: "8px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="h5" color="#fff">
                                    Notificações
                                </Typography>
                                <FormGroup sx={{ color: "#fff" }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                color="secondary"
                                                onChange={toggleFilter}
                                                checked={showUnreadOnly}
                                            />
                                        }
                                        label="Mostrar somente não lida"
                                    />
                                </FormGroup>
                            </Box>
                            <Stack
                                sx={{
                                    height: "400px",
                                    width: "min(60ch, 100ch)",
                                    padding: "12px",
                                    background: "#f1f1f1",
                                    borderRadius: "8px",
                                    overflowY: "auto",
                                }}
                                spacing={2}
                            >
                                {(!notifications?.length ||
                                    (unreadCount === 0 && showUnreadOnly)) && (
                                    <h4>
                                        Nenhuma notificação!{" "}
                                        {/* <span
                                            role="img"
                                            aria-label="dunno what to put"
                                        >
                                            🎉
                                        </span> */}
                                    </h4>
                                )}
                                {(showUnreadOnly
                                    ? notifications.filter((v) => !v.read)
                                    : notifications
                                ).map((notification) => {
                                    return (
                                        <Alert
                                            severity={"info"}
                                            variant={"outlined"}
                                            action={
                                                notification.read ? (
                                                    <CheckIcon />
                                                ) : (
                                                    <IconButton
                                                        color="primary"
                                                        aria-label="upload picture"
                                                        component="span"
                                                        onClick={() =>
                                                            toggleRead(
                                                                notification.id
                                                            )
                                                        }
                                                    >
                                                        <MarkChatReadIcon />
                                                    </IconButton>
                                                )
                                            }
                                        >
                                            {notification.content}
                                        </Alert>
                                    );
                                })}
                            </Stack>
                            <Box
                                sx={{
                                    background: "#666",
                                    padding: "8px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <SButtonApaga onClick={clear}>
                                    Apaga todas
                                </SButtonApaga>

                                <SButtonMarcaLida onClick={toogleAllAsRead}>
                                    Marca todas como lida
                                </SButtonMarcaLida>
                            </Box>
                        </Box>
                    </Fade>
                )}
            </Popper>
        </Box>
    );
}
