import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { Layout } from "./components/Layout";
import { Users } from "./pages/Users";
import { Logout } from "./pages/Logout";

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
        path="/back-office"
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
