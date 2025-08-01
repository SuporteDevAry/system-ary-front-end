import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { Layout } from "./components/Layout";
import { Users } from "./pages/Users";
import { Logout } from "./pages/Logout";
import { Permissions } from "./pages/Permissions";
import { Admin } from "./pages/Admin";
import { Clientes } from "./pages/Clientes";
import { CadastrarCliente } from "./pages/Clientes/components/CadastrarCliente";
import { EditarCliente } from "./pages/Clientes/components/EditarCliente";
import { Contract } from "./pages/Contracts";
import { HistoryContracts } from "./pages/Contracts/pages/HistoryContracts";
import { CreateNewContract } from "./pages/Contracts/pages/CreateNewContract";
import { MyAccount } from "./pages/MyAccount";
import { ViewCustomer } from "./pages/Clientes/components/ViewCustomer";
import { ViewContract } from "./pages/Contracts/pages/HistoryContracts/components/ViewContract";
import { Execution } from "./pages/Execution";
import { SendContracts } from "./pages/Execution/pages/SendContracts";
import { Reports } from "./pages/Reports";
import { GrainsBigger } from "./pages/Reports/pages/GrainsBigger";
import { GrainsVol } from "./pages/Reports/pages/GrainsVol";
import { Invoicing } from "./pages/Reports/pages/Invoicing";
import { ControlContracts } from "./pages/Execution/pages/ControlContracts";

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
                path="/contratos"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <Contract />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/contratos/novo-contrato"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <CreateNewContract />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/contratos/editar-contrato"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <CreateNewContract />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/contratos/historico"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <HistoryContracts />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/contratos/historico/visualizar-contrato"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <ViewContract />
                        </Layout>
                    </ProtectedLayout>
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
                path="/clientes/visualizar-cliente"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <ViewCustomer />
                        </Layout>
                    </ProtectedLayout>
                }
            />

            <Route
                path="/clientes/cliente-cadastrar"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <CadastrarCliente />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/clientes/cliente-editar"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <EditarCliente />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/execucao"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <Execution />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/execucao/historico"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <HistoryContracts />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/execucao/controle"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <ControlContracts />
                        </Layout>
                    </ProtectedLayout>
                }
            />

            <Route
                path="/execucao/enviar-contratos"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <SendContracts />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/relatorios"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <Reports />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/relatorios/graos-volume"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <GrainsVol />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/relatorios/graos-maiores"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <GrainsBigger />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/relatorios/faturamento"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <Invoicing />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/admin/usuarios"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <Users />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <Admin />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/admin/permissoes"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <Permissions />
                        </Layout>
                    </ProtectedLayout>
                }
            />
            <Route
                path="/minha-conta"
                element={
                    <ProtectedLayout>
                        <Layout>
                            <MyAccount />
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
