export function Extenso(vlr: number): string {
  if (vlr === 0) return "zero";

  const unidades = [
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
  const centenas = [
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

  let extenso = "";

  const milhoes = Math.floor(vlr / 1000000);
  const milhar = Math.floor((vlr % 1000000) / 1000);
  const centena = Math.floor((vlr % 1000) / 100);
  const dezena = Math.floor((vlr % 100) / 10);
  const unidade = vlr % 10;

  if (milhoes > 0) {
    if (milhoes === 1) {
      extenso += "um milhão";
    } else {
      extenso += Extenso(milhoes) + " milhões";
    }
    if (milhar > 0 || centena > 0 || dezena > 0 || unidade > 0) extenso += ", ";
  }

  if (milhar > 0) {
    if (milhar === 1) {
      extenso += "mil";
    } else {
      extenso += Extenso(milhar) + " mil";
    }
    if (centena > 0 || dezena > 0 || unidade > 0) extenso += " e ";
  }

  if (centena > 0) {
    if (centena === 1 && dezena === 0 && unidade === 0) {
      extenso += "cem";
    } else {
      extenso += centenas[centena];
    }
    if (dezena > 0 || unidade > 0) extenso += " e ";
  }

  if (dezena > 1) {
    extenso += dezenas[dezena];
    if (unidade > 0) extenso += " e " + unidades[unidade];
  } else if (dezena === 1) {
    extenso += especiais[unidade];
  } else if (unidade > 0) {
    extenso += unidades[unidade];
  }

  return extenso.trim();
}
