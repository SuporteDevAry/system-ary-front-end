import { ThemeProvider } from "styled-components";
import { defaultTheme } from "./styles/themes/default";
import { GlobalStyle } from "./styles/global";
import { RoutesForPages } from "./Routes";
import { BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ToastContainer } from "react-toastify";

export function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <ToastContainer autoClose={5000} />
      <Helmet>
        <title>
          Ary Oleofar &#8211; Ary Oleofar Corretora de Mercadorias LTDA
        </title>
      </Helmet>
      <BrowserRouter>
        <RoutesForPages />
        <GlobalStyle />
      </BrowserRouter>
    </ThemeProvider>
  );
}
