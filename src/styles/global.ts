import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`

 *, *::before, *::after  {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    text-decoration: none;
  }

  :focus {
    outline: 0;
    box-shadow: 0 0 0 2px ${({ theme }) => theme["yellow-100"]}
  }

  body {
     -webkit-font-smoothing: antialiased;
  }

  body, input, textarea, button {
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    letter-spacing: .6px;
  }
`;
