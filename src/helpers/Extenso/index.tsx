export function Extenso(vlr: number | string, genero: "M" | "F" = "M"): string {
  // suporta número ou string (com pontos e vírgulas)
  let numStr = String(vlr).trim();
  // remover separador de milhares e normalizar decimal para ponto
  numStr = numStr.replace(/\./g, "").replace(/,/g, ".");
  const num = Math.floor(Number(numStr) || 0);

  if (num === 0) return "zero";

  const unidadesM = [
    "",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
  ];
  const unidadesF = [
    "",
    "uma",
    "duas",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
  ];
  const especiais = [
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];
  const dezenas = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];
  const centenasM = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];
  const centenasF = [
    "",
    "cento",
    "duzentas",
    "trezentas",
    "quatrocentas",
    "quinhentas",
    "seiscentas",
    "setecentas",
    "oitocentas",
    "novecentas",
  ];

  const unidades = genero === "F" ? unidadesF : unidadesM;
  const centenas = genero === "F" ? centenasF : centenasM;

  function extensoAte999(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";

    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    let str = "";

    if (c > 0) str += centenas[c];

    if (d > 0 || u > 0) {
      if (str !== "") str += " e ";

      if (d === 1) {
        str += especiais[u];
      } else {
        if (d > 0) {
          str += dezenas[d];
          if (u > 0) str += " e ";
        }
        if (u > 0) str += unidades[u];
      }
    }

    return str;
  }

  let extenso = "";

  const milhoes = Math.floor(num / 1000000);
  const milhar = Math.floor((num % 1000000) / 1000);
  const resto = num % 1000;

  if (milhoes > 0) {
    if (milhoes === 1) {
      extenso += "um milhão";
    } else {
      extenso += Extenso(milhoes, genero) + " milhões";
    }
    if (milhar > 0 || resto > 0) extenso += ", ";
  }

  if (milhar > 0) {
    if (milhar === 1) {
      extenso += "mil";
    } else {
      extenso += Extenso(milhar, genero) + " mil";
    }
    if (resto > 0) extenso += " e ";
  }

  if (resto > 0) {
    extenso += extensoAte999(resto);
  }

  return extenso.trim();
}
