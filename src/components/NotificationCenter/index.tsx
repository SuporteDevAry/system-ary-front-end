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
  const token = getUserLocalStorage();
  const parsejwt = JSON.parse(atob(token.token.split(".")[1]));
  const user = parsejwt.email;

  const notificationContext = NotificationContext();

  const [notifications, setNotifications] = useState<INotifications[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchData = async () => {
    try {
      const response = await notificationContext.listUserNotifications(
        `${user}`
      );

      setNotifications(response.data);
    } catch (error) {
      console.error("Erro lendo notificações:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleNotificationCenter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(!isOpen);
  };

  const toggleFilter = () => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  const toggleRead = async (notification_id: string) => {
    try {
      // Encontre a notificação que precisa ser atualizada
      const notificationToUpdate = notifications.find(
        (notification) => notification.id === notification_id
      );

      if (!notificationToUpdate) {
        console.error("Notificação não encontrada.");
        return;
      }

      // Atualize o estado de leitura da notificação no backend
      const updateNotificationData = {
        read: !notificationToUpdate.read,
      };

      await notificationContext.updateNotification(
        notification_id,
        updateNotificationData
      );

      // Atualize o estado local das notificações
      const updatedNotifications = notifications.map((notification) =>
        notification.id === notification_id
          ? { ...notification, read: !notification.read }
          : notification
      );

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const clear = () => {
    setNotifications([]);
  };

  //   const toogleAllAsRead = () => {
  //     const updatedNotifications = notifications.map((notification) => ({
  //       ...notification,
  //       read: true,
  //     }));
  //     setNotifications(updatedNotifications);
  //   };

  const toogleAllAsRead = async () => {
    try {
      // Itera sobre todas as notificações e marca como lida
      const updatedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          // Atualiza a notificação no backend
          const updateNotificationData = { read: true };
          await notificationContext.updateNotification(
            notification.id,
            updateNotificationData
          );

          // Retorna a notificação atualizada localmente
          return { ...notification, read: true };
        })
      );

      // Atualiza o estado das notificações
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  const unreadCount = notifications.filter((i) => i.read === false).length;

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
                  <h4>Nenhuma notificação!</h4>
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
                            onClick={() => toggleRead(notification.id)}
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
                <SButtonApaga onClick={clear}>Apaga todas</SButtonApaga>

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
