import { useEffect, useState } from "react";
import { IUserInfo } from "../../contexts/ContractContext/types";
import { getDataUserFromToken } from "../../contexts/AuthProvider/util";

const useInfo = () => {
  const [dataUserInfo, setDataUserInfo] = useState<IUserInfo | null>(null);

  useEffect(() => {
    const userInfo = getDataUserFromToken();
    if (userInfo) {
      setDataUserInfo(userInfo);
    }
  }, []);

  return { dataUserInfo };
};

export default useInfo;
