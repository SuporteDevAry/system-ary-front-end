import useInfo from "../userInfo";

const useUserPermissions = () => {
  const { dataUserInfo } = useInfo();

  const hasPermission = (permission: string) => {
    return dataUserInfo?.permissions?.includes(permission);
  };

  // Verifica as permissões
  const canConsult = hasPermission("CONSULTA");
  const canChangeStatus = hasPermission("EXECUCAO");

  // Pode ser implementado no futuro!
  //   const canWrite = hasPermission("ESCREVER");
  //   const canDelete = hasPermission("DELETAR");

  return {
    canConsult,
    canChangeStatus,
    hasPermission, // Também pode retornar a função geral para verificar outras permissões caso necessário
  };
};

/* outra forma de utilizar o hook, é com o hasPermission:
 *const canAdmin = hasPermission("ADMIN");
 *const canViewReports = hasPermission("VISUALIZAR_RELATORIOS");
 */
export default useUserPermissions;
