import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { AuthProvider } from "./contexts/AuthProvider/index.tsx";
import { UserProvider } from "./contexts/UserContext/index.tsx";
import { ClientesProvider } from "./contexts/ClienteContext/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider>
        <ClientesProvider>
        <App />
        </ClientesProvider>
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
);
