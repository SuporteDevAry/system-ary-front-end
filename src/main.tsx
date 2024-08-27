import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { AuthProvider } from "./contexts/AuthProvider/index.tsx";
import { UserProvider } from "./contexts/UserContext/index.tsx";
import { ClientesProvider } from "./contexts/ClienteContext/index.tsx";
import { ContatosProvider } from "./contexts/ContatoContext/index.tsx";
import { NotificationsProvider } from "./contexts/NotificationContext/index.tsx";
import { ContractProvider } from "./contexts/ContractContext/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider>
        <ClientesProvider>
          <ContatosProvider>
            <NotificationsProvider>
              <ContractProvider>
                <App />
              </ContractProvider>
            </NotificationsProvider>
          </ContatosProvider>
        </ClientesProvider>
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
);
