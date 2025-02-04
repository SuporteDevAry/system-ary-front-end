import { ISendEmailContext, ISendEmailProvider, ISendEmailData } from "./types";
import { Api } from "../../services/api";
import { AxiosError } from "axios";
import { createContext, useContext } from "react";

const newContext = createContext<ISendEmailContext>({
  sendEmail: () => Promise.resolve(),
});

export const SendEmailProvider = ({ children }: ISendEmailProvider) => {
  async function sendEmail(emailSendData: ISendEmailData): Promise<any> {
    try {
      const response = await Api.post("/send-emails", emailSendData);

      return response;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errorMessage = (err.response.data as { message: string }).message;
        throw new Error(errorMessage);
      }
      return Promise.reject(error);
    }
  }

  return (
    <newContext.Provider
      value={{
        sendEmail,
      }}
    >
      {children}
    </newContext.Provider>
  );
};

export const SendEmailContext = () => {
  const context = useContext(newContext);

  return context;
};
