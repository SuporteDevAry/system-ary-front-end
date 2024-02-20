import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { AuthProvider } from "./contexts/AuthProvider/index.tsx";
import { UserProvider } from "./contexts/UserContext/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
);
