export function convertToCustomFormat(
  isoDate: string | Date,
  locale: string,
  includeTime: boolean = false
): string {
  const date = new Date(isoDate);

  const optionsDate: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleDateString(locale, optionsDate);
  if (includeTime) {
    const formattedTime = date.toLocaleTimeString(locale, optionsTime);
    return `${formattedDate} ${formattedTime}`;
  }

  return formattedDate;
}

//   // Exemplo de uso:
//   const isoDate: string = "2024-02-08T22:29:23.625Z";
//   const brazilianDate: string = convertToCustomFormat(isoDate, 'pt-BR');
//   console.log(brazilianDate);  // Saída: "08/02/2024 19:29:23"

export function formattedDate(): string {
  const date = new Date();
  const formatDate = date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return formatDate;
}

export function formattedTime(): string {
  const date = new Date();
  const formatTime = date.toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formatTime;
}

export const formatDateWithLongMonth = (dateString: string): string => {
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  // Separar dia, mês e ano da data fornecida (formato DD/MM/YYYY)
  const [day, month, year] = dateString.split("/");

  // Obter o nome do mês a partir do índice (mês - 1 porque os meses são baseados em zero)
  const monthName = months[parseInt(month) - 1];

  // Retornar a data no formato desejado
  return `${day} de ${monthName} de ${year}`;
};

// // Exemplo de uso
// const formattedDate = formatDate("01/10/2024");
// console.log(formattedDate); // Saída: "01 de outubro de 2024"
