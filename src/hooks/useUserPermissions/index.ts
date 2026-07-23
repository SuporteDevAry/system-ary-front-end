import useInfo from "../userInfo";

const CONTRACT_CONTROL_ALLOWED_EMAILS = (
  process.env.CONTRACT_CONTROL_ALLOWED_EMAILS ?? ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const useUserPermissions = () => {
  const { dataUserInfo } = useInfo();

  const hasPermission = (permission: string) => {
    return dataUserInfo?.permissions?.includes(permission);
  };

  // Verifica as permissões
  const canConsult = hasPermission("CONSULTA");
  const canChangeStatus = hasPermission("EXECUCAO");
  const canDashFinance = hasPermission("DASHFINANCE");
  const canDevelop = hasPermission("DEV");

  // Restringe o módulo de Controle de Contratos aos e-mails definidos em .env
  const canViewContractControl = CONTRACT_CONTROL_ALLOWED_EMAILS.includes(
    (dataUserInfo?.email ?? "").toLowerCase(),
  );

  // Pode ser implementado no futuro!
  //   const canWrite = hasPermission("ESCREVER");
  //   const canDelete = hasPermission("DELETAR");

  return {
    canConsult,
    canChangeStatus,
    canDashFinance,
    canDevelop,
    canViewContractControl,
    hasPermission, // Também pode retornar a função geral para verificar outras permissões caso necessário
  };
};

/* outra forma de utilizar o hook, é com o hasPermission:
 *const canAdmin = hasPermission("ADMIN");
 *const canViewReports = hasPermission("VISUALIZAR_RELATORIOS");
 */
export default useUserPermissions;
