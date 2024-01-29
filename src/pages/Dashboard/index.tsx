import { SContainer } from "./styles";

export function Dashboard() {
  return (
    <>
      <h2>Dashboard</h2>
      <SContainer>
        <iframe
          title="Soja"
          src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=23&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
          width="420"
          height="240"
          frameBorder="0"
          allowFullScreen
        />

        <iframe
          title="Farelo de Soja"
          src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=139&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
          width="420"
          height="240"
          frameBorder="0"
          allowFullScreen
        />

        <iframe
          title="Milho"
          src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=10&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
          width="420"
          height="240"
          frameBorder="0"
          allowFullScreen
        />

        <iframe
          title="Dolar"
          src="https://www.noticiasagricolas.com.br/widgets/cotacoes?id=232&fonte=Arial%2C%20Helvetica%2C%20sans-serif&tamanho=10pt&largura=400px&cortexto=333333&corcabecalho=B2C3C6&corlinha=DCE7E9&imagem=true"
          width="420"
          height="240"
          frameBorder="0"
          allowFullScreen
        />
      </SContainer>
    </>
  );
}
