import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CardContent from "@mui/material/CardContent";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DevPanelContext } from "../../contexts/DevPanelContext";
import {
  IAuditLog,
  ILoginHistory,
  IOnlineUser,
  IUserMetric,
} from "../../contexts/DevPanelContext/types";
import CustomTable from "../../components/CustomTable";
import { CustomSearch } from "../../components/CustomSearch";
import CustomButton from "../../components/CustomButton";
import { Modal } from "../../components/Modal";
import {
  SChartContainer,
  SContainer,
  SOnlineDot,
  SOnlineStatus,
  SPre,
  STitle,
  SUpdatedAt,
} from "./styles";

const ONLINE_POLL_INTERVAL_MS = 15000;

const PIE_COLORS = [
  "#413ea0",
  "#00A335",
  "#D72735",
  "#ff7300",
  "#8884d8",
  "#A349A4",
  "#B97A57",
];

export function DevPanel() {
  const devPanelContext = DevPanelContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState(0);
  const [accessDenied, setAccessDenied] = useState(false);

  const [metrics, setMetrics] = useState<IUserMetric[]>([]);
  const [metricsOrder, setMetricsOrder] = useState<"asc" | "desc">("asc");
  const [metricsOrderBy, setMetricsOrderBy] = useState<string>("name");

  const [loginHistory, setLoginHistory] = useState<ILoginHistory[]>([]);
  const [loginHistorySearch, setLoginHistorySearch] = useState("");
  const [loginHistoryPage, setLoginHistoryPage] = useState(0);
  const [loginHistoryOrder, setLoginHistoryOrder] = useState<"asc" | "desc">(
    "desc"
  );
  const [loginHistoryOrderBy, setLoginHistoryOrderBy] =
    useState<string>("created_at");

  const [auditLog, setAuditLog] = useState<IAuditLog[]>([]);
  const [auditLogSearch, setAuditLogSearch] = useState("");
  const [auditLogPage, setAuditLogPage] = useState(0);
  const [auditLogOrder, setAuditLogOrder] = useState<"asc" | "desc">("desc");
  const [auditLogOrderBy, setAuditLogOrderBy] = useState<string>("created_at");
  const [selectedAuditLog, setSelectedAuditLog] = useState<IAuditLog | null>(
    null
  );

  const [onlineUsers, setOnlineUsers] = useState<IOnlineUser[]>([]);
  const [onlineUsersUpdatedAt, setOnlineUsersUpdatedAt] = useState<Date | null>(
    null
  );
  const [onlineUsersOrder, setOnlineUsersOrder] = useState<"asc" | "desc">(
    "asc"
  );
  const [onlineUsersOrderBy, setOnlineUsersOrderBy] =
    useState<string>("name");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [
        metricsResponse,
        loginHistoryResponse,
        auditLogResponse,
        onlineUsersResponse,
      ] = await Promise.all([
        devPanelContext.getUserMetrics(),
        devPanelContext.getLoginHistory(),
        devPanelContext.getAuditLog(),
        devPanelContext.getOnlineUsers(),
      ]);

      setMetrics(metricsResponse);
      setLoginHistory(loginHistoryResponse.data);
      setAuditLog(auditLogResponse.data);
      setOnlineUsers(onlineUsersResponse);
      setOnlineUsersUpdatedAt(new Date());
    } catch (error) {
      const err = error as Error & { response?: { status?: number } };

      if ((err as any)?.response?.status === 403) {
        setAccessDenied(true);
      } else {
        toast.error(
          `Erro ao tentar ler dados do painel de devs, contacte o administrador do sistema: ${error}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [devPanelContext]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab !== 3) return;

    const pollOnlineUsers = () => {
      devPanelContext
        .getOnlineUsers()
        .then((data) => {
          setOnlineUsers(data);
          setOnlineUsersUpdatedAt(new Date());
        })
        .catch(() => {});
    };

    const intervalId = setInterval(pollOnlineUsers, ONLINE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [activeTab, devPanelContext]);

  const metricsWithLogins = useMemo(
    () => metrics.filter((metric) => metric.logins_this_month > 0),
    [metrics]
  );

  const filteredLoginHistory = useMemo(() => {
    if (loginHistorySearch.trim() === "") return loginHistory;

    return loginHistory.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(loginHistorySearch.toLowerCase())
      )
    );
  }, [loginHistory, loginHistorySearch]);

  const filteredAuditLog = useMemo(() => {
    if (auditLogSearch.trim() === "") return auditLog;

    return auditLog.filter((item) =>
      Object.values(item).some((value) => {
        if (value && typeof value === "object") return false;
        return String(value ?? "")
          .toLowerCase()
          .includes(auditLogSearch.toLowerCase());
      })
    );
  }, [auditLog, auditLogSearch]);

  const metricsColumns = useMemo(
    () => [
      { field: "name", header: "Nome", width: "180px", sortable: true },
      { field: "email", header: "E-mail", width: "200px", sortable: true },
      {
        field: "last_login",
        header: "Último Login",
        width: "160px",
        sortable: true,
      },
      {
        field: "logins_this_month",
        header: "Logins no Mês",
        width: "140px",
        sortable: true,
      },
    ],
    []
  );

  const loginHistoryColumns = useMemo(
    () => [
      {
        field: "created_at",
        header: "Data/Hora",
        width: "160px",
        sortable: true,
      },
      { field: "name", header: "Nome", width: "180px", sortable: true },
      { field: "email", header: "E-mail", width: "200px", sortable: true },
      { field: "ip_address", header: "IP", width: "140px" },
    ],
    []
  );

  const auditLogColumns = useMemo(
    () => [
      {
        field: "created_at",
        header: "Data/Hora",
        width: "160px",
        sortable: true,
      },
      { field: "user_name", header: "Nome", width: "160px", sortable: true },
      {
        field: "user_email",
        header: "E-mail",
        width: "200px",
        sortable: true,
      },
      { field: "action", header: "Ação", width: "100px", sortable: true },
      {
        field: "entity_name",
        header: "Entidade",
        width: "140px",
        sortable: true,
      },
      { field: "entity_id", header: "Registro", width: "200px" },
    ],
    []
  );

  const onlineUsersColumns = useMemo(
    () => [
      {
        field: "status",
        header: "",
        width: "90px",
        renderCell: () => (
          <SOnlineStatus>
            <SOnlineDot />
            Online
          </SOnlineStatus>
        ),
      },
      { field: "name", header: "Nome", width: "180px", sortable: true },
      { field: "email", header: "E-mail", width: "200px", sortable: true },
      {
        field: "last_seen_at",
        header: "Visto por último",
        width: "160px",
        sortable: true,
      },
    ],
    []
  );

  const renderAuditActionButtons = (row: any) => (
    <CustomButton
      $variant={"primary"}
      width="120px"
      onClick={() => setSelectedAuditLog(row as IAuditLog)}
    >
      Ver detalhes
    </CustomButton>
  );

  if (accessDenied) {
    return (
      <SContainer>
        <STitle>Acesso restrito</STitle>
        <p>Esse painel é restrito à equipe de desenvolvimento.</p>
      </SContainer>
    );
  }

  return (
    <SContainer>
      <STitle>Painel de Devs</STitle>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ marginBottom: "16px" }}
      >
        <Tab label="Métricas de Usuários" />
        <Tab label="Histórico de Login" />
        <Tab label="Auditoria" />
        <Tab label={`Usuários Online (${onlineUsers.length})`} />
      </Tabs>

      {activeTab === 0 && (
        <>
          {metricsWithLogins.length === 0 ? (
            <p>Ninguém logou no sistema neste mês ainda.</p>
          ) : (
            <SChartContainer>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={metricsWithLogins}
                    dataKey="logins_this_month"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={1}
                    fill="#8884d8"
                  >
                    {metricsWithLogins.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: "12px", lineHeight: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </SChartContainer>
          )}

          <CardContent>
            <CustomTable
              data={metrics}
              columns={metricsColumns}
              isLoading={isLoading}
              dateFields={["last_login"]}
              order={metricsOrder}
              orderBy={metricsOrderBy}
              setOrder={setMetricsOrder}
              setOrderBy={setMetricsOrderBy}
            />
          </CardContent>
        </>
      )}

      {activeTab === 1 && (
        <>
          <CustomSearch
            width="400px"
            placeholder="Buscar por nome, e-mail ou IP"
            value={loginHistorySearch}
            onChange={(e) => setLoginHistorySearch(e.target.value)}
          />

          <CardContent>
            <CustomTable
              data={filteredLoginHistory}
              columns={loginHistoryColumns}
              isLoading={isLoading}
              hasPagination
              dateFields={["created_at"]}
              page={loginHistoryPage}
              setPage={setLoginHistoryPage}
              order={loginHistoryOrder}
              orderBy={loginHistoryOrderBy}
              setOrder={setLoginHistoryOrder}
              setOrderBy={setLoginHistoryOrderBy}
            />
          </CardContent>
        </>
      )}

      {activeTab === 2 && (
        <>
          <CustomSearch
            width="400px"
            placeholder="Buscar por nome, e-mail, ação ou entidade"
            value={auditLogSearch}
            onChange={(e) => setAuditLogSearch(e.target.value)}
          />

          <CardContent>
            <CustomTable
              data={filteredAuditLog}
              columns={auditLogColumns}
              isLoading={isLoading}
              hasPagination
              dateFields={["created_at"]}
              actionButtons={renderAuditActionButtons}
              page={auditLogPage}
              setPage={setAuditLogPage}
              order={auditLogOrder}
              orderBy={auditLogOrderBy}
              setOrder={setAuditLogOrder}
              setOrderBy={setAuditLogOrderBy}
            />
          </CardContent>
        </>
      )}

      {activeTab === 3 && (
        <>
          <SUpdatedAt>
            {onlineUsers.length === 0
              ? "Ninguém online no momento."
              : `${onlineUsers.length} usuário(s) online agora`}
            {onlineUsersUpdatedAt &&
              ` — atualizado às ${onlineUsersUpdatedAt.toLocaleTimeString("pt-BR")}`}
          </SUpdatedAt>

          <CardContent>
            <CustomTable
              data={onlineUsers}
              columns={onlineUsersColumns}
              isLoading={isLoading}
              dateFields={["last_seen_at"]}
              order={onlineUsersOrder}
              orderBy={onlineUsersOrderBy}
              setOrder={setOnlineUsersOrder}
              setOrderBy={setOnlineUsersOrderBy}
            />
          </CardContent>
        </>
      )}

      <Modal
        open={!!selectedAuditLog}
        titleText="Detalhes da alteração"
        onClose={() => setSelectedAuditLog(null)}
        onHandleConfirm={() => setSelectedAuditLog(null)}
        variantCancel="secondary"
        variantConfirm="primary"
        cancelButton="Fechar"
        maxWidth="md"
        fullWidth
      >
        {selectedAuditLog && (
          <>
            <p>
              <strong>{selectedAuditLog.user_name}</strong> (
              {selectedAuditLog.user_email}) — {selectedAuditLog.action} em{" "}
              {selectedAuditLog.entity_name}
            </p>
            <p>
              <strong>Antes:</strong>
            </p>
            <SPre>
              {JSON.stringify(selectedAuditLog.before ?? {}, null, 2)}
            </SPre>
            <p>
              <strong>Depois:</strong>
            </p>
            <SPre>
              {JSON.stringify(selectedAuditLog.after ?? {}, null, 2)}
            </SPre>
          </>
        )}
      </Modal>
    </SContainer>
  );
}
