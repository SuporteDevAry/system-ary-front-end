export function convertToCustomFormat(
  isoDate: string,
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formatDate;
}
