import { useState } from "react";
import CustomButton from "../../../../../../components/CustomButton";
import { StepProps } from "../../types";
import { SCard } from "./styles";

export const Save: React.FC<StepProps> = ({}) => {
  const [status, setStatus] = useState("em-pausa");

  const toggleStatus = () => {
    setStatus(status === "em-pausa" ? "a-conferir" : "em-pausa");
  };

  return (
    <>
      <SCard>
        <h4>Status:{status}</h4>
        <CustomButton $variant={"primary"} onClick={toggleStatus}>
          Mudar Status
        </CustomButton>
      </SCard>
    </>
  );
};
