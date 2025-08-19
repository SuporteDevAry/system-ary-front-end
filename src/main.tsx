import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { AuthProvider } from "./contexts/AuthProvider/index.tsx";
import { UserProvider } from "./contexts/UserContext/index.tsx";
import { ClientesProvider } from "./contexts/ClienteContext/index.tsx";
import { ContatosProvider } from "./contexts/ContatoContext/index.tsx";
import { NotificationsProvider } from "./contexts/NotificationContext/index.tsx";
import { ContractProvider } from "./contexts/ContractContext/index.tsx";
import { SendEmailProvider } from "./contexts/SendEmailContext/index.tsx";
import { ProductProvider } from "./contexts/Products/index.tsx";
import { TableProductsProvider } from "./contexts/TablesProducts/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <SendEmailProvider>
        <UserProvider>
          <ClientesProvider>
            <ContatosProvider>
              <NotificationsProvider>
                <ContractProvider>
                  <ProductProvider>
                    <TableProductsProvider>
                      <App />
                    </TableProductsProvider>
                  </ProductProvider>
                </ContractProvider>
              </NotificationsProvider>
            </ContatosProvider>
          </ClientesProvider>
        </UserProvider>
      </SendEmailProvider>
    </AuthProvider>
  </React.StrictMode>
);
