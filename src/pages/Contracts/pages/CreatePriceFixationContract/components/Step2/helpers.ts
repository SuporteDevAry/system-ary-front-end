import dayjs from "dayjs";

// Função para gerar os anos de safra
export const generateCropYears = () => {
  const currentYear = dayjs().year(); // Ano atual
  const listYears = [];

  // Adiciona 2 anos para trás
  for (let i = -2; i <= 5; i++) {
    const year = currentYear + i;
    listYears.push({ label: `${year}`, value: `${year}` });

    // Adiciona ano simples com barra (ano/ano)
    listYears.push({
      label: `${year} / ${year}`,
      value: `${year} / ${year}`,
    });

    if (i < 5) {
      // Adiciona anos compostos (ano/ano)
      listYears.push({
        label: `${year}/${year + 1}`,
        value: `${year}/${year + 1}`,
      });
    }
  }

  return listYears;
};
