import { useState, useMemo } from "react";

export const formatValue = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined || value === "") return "";

  // Se for string, garantimos que é convertida para number (para evitar erros)
  const numValue =
    typeof value === "string"
      ? parseFloat(value.replace(/\./g, "").replace(",", "."))
      : Number(value);

  if (isNaN(numValue)) return "";

  // numValue é o valor numérico limpo (ex: 1690.765)
  // O seu toFixed(3) é a chave aqui, pois ele garante o ponto decimal para as próximas etapas
  let result = numValue.toFixed(3); // result = "1690.765"

  // 1. Troca o ponto decimal por um caractere temporário
  result = result.replace(".", "#"); // result = "1690#765"

  // 2. Adiciona o separador de milhar (ponto)
  result = result.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // result = "1.690#765"

  // 3. Restaura a vírgula decimal
  result = result.replace("#", ","); // result = "1.690,765"

  // 4. Limpa zeros no final
  result = result.replace(/,0+$/, "");

  return result;
};

// Função para limpar e converter a string de entrada formatada para um número (com ponto)
const parseValue = (formattedString: string) => {
  if (!formattedString) return null;

  // 1. Remove separadores de milhar (pontos)
  let cleaned = formattedString.replace(/\./g, "");

  // 2. Substitui a vírgula decimal por ponto
  cleaned = cleaned.replace(",", ".");

  // 3. Converte para número (float)
  const numberValue = parseFloat(cleaned);

  return isNaN(numberValue) ? null : numberValue;
};

export function useQuantitiesInput(initialValue: number | null = null) {
  const [numericValue, setNumericValue] = useState<number | null>(initialValue);

  const initialDisplayValue = useMemo(
    () => formatValue(initialValue),
    [initialValue]
  );
  const [displayValue, setDisplayValue] = useState(initialDisplayValue);

  const handleChange = (event: { target: { value: any } }) => {
    let rawValue = event.target.value;

    // Remove tudo que não for dígito, ponto ou vírgula
    let cleaned = rawValue.replace(/[^\d.,]/g, "");

    // Permite que o usuário comece a digitar ou apenas apague
    if (cleaned === "") {
      setDisplayValue("");
      setNumericValue(null);
      return;
    }

    // Normaliza para permitir apenas um separador decimal (vírgula)
    // Mantém a primeira vírgula e remove as demais
    const parts = cleaned.split(",");
    if (parts.length > 1) {
      let integerPart = parts[0];
      // Junta a vírgula com a primeira parte decimal (limitada a 2 dígitos)
      let decimalPart = parts.slice(1).join("").slice(0, 3);
      cleaned = integerPart + "," + decimalPart;
    }

    // Atualiza o valor exibido
    setDisplayValue(cleaned);

    // Atualiza o valor numérico subjacente
    const parsedNumber = parseValue(cleaned);
    setNumericValue(parsedNumber);
  };

  const handleBlur = () => {
    setDisplayValue(formatValue(numericValue));
  };

  return {
    value: numericValue,
    displayValue,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: () => {
      if (numericValue !== null) {
        setDisplayValue(String(numericValue).replace(".", ","));
      } else {
        setDisplayValue("");
      }
    },
  };
}

export const replaceLastDotWithComma = (str: string) => {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }

  // Encontra a posição do último ponto
  const lastDotIndex = str.lastIndexOf(".");

  // Se não encontrar ponto, retorna a string original
  if (lastDotIndex === -1) {
    return str;
  }

  return str.substring(0, lastDotIndex) + "," + str.substring(lastDotIndex + 1);
};

export const cleanAndParse = (
  value: string | number | null | undefined
): number => {
  if (value === null || value === undefined || value === "") return 0;
  const strValue = String(value);
  let cleaned = strValue.replace(/\./g, ""); // Remove ponto de milhar
  cleaned = cleaned.replace(",", "."); // Troca vírgula por ponto decimal
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};
