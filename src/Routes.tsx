import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { Layout } from "./components/Layout";
import { Users } from "./pages/Users";
import { Logout } from "./pages/Logout";
import { Clientes } from "./pages/Clientes";
import { CadastrarCliente } from "./pages/Clientes/components/CadastrarCliente";
import { EditarCliente } from "./pages/Clientes/components/EditarCliente";

export function RoutesForPages() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedLayout>
            <Layout>
              <Clientes />
            </Layout>
          </ProtectedLayout>
        }
      />
      <Route
        path="/cliente-cadastrar"
        element={
          <ProtectedLayout>
            <Layout>
              <CadastrarCliente />
            </Layout>
          </ProtectedLayout>
        }
      />

     <Route
        path="/cliente-editar"
        element={
          <ProtectedLayout>
            <Layout>
              <EditarCliente />
            </Layout>
          </ProtectedLayout>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedLayout>
            <Layout>
              <Users />
            </Layout>
          </ProtectedLayout>
        }
      />
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
