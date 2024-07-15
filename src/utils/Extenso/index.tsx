// Exemplo de uso
// const vlr = 123456789;
// const num_extenso = Extenso(vlr);

// console.log(vlr);
// console.log(num_extenso);

export function Extenso(vlr: number): string {
    //const Num = parseFloat(vlr.toString());

    if (vlr === 0) {
        return "zero";
    } else {
        const inteiro = parseInt(vlr.toString(), 10); // parte inteira do valor
        if (inteiro < 1000000000000000) {
            //let resto = parseFloat((Num - inteiro).toFixed(2)); // parte fracionária do valor
            const vlrS = inteiro.toString();

            const cont = vlrS.length;
            let extenso = "";
            let auxnumero: number;
            let auxnumero2: string;
            let auxnumero3: string;

            const unidade = [
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

            const centena = [
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

            const dezena = [
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

            const qualificaS = ["", "mil,", "milhão,", "bilhão,", "trilhão,"];
            const qualificaP = [
                "",
                "mil,",
                "milhões,",
                "bilhões,",
                "trilhões,",
            ];

            for (let i = cont; i > 0; i--) {
                let verifica1 = "";
                let verifica2 = 0;
                let verifica3 = 0;
                auxnumero2 = "";
                auxnumero3 = "";
                auxnumero = 0;
                auxnumero2 = vlrS.substr(cont - i, 1);
                auxnumero = parseInt(auxnumero2, 10);

                if (i === 14 || i === 11 || i === 8 || i === 5 || i === 2) {
                    auxnumero2 = vlrS.substr(cont - i, 2);
                    auxnumero = parseInt(auxnumero2, 10);
                }

                if (i === 15 || i === 12 || i === 9 || i === 6 || i === 3) {
                    extenso = extenso + centena[auxnumero];
                    auxnumero2 = vlrS.substr(cont - i + 1, 1);
                    auxnumero3 = vlrS.substr(cont - i + 2, 1);

                    if (auxnumero2 !== "0" || auxnumero3 !== "0")
                        extenso += " e ";
                } else if (auxnumero > 19) {
                    auxnumero2 = vlrS.substr(cont - i, 1);
                    auxnumero = parseInt(auxnumero2, 10);
                    extenso = extenso + dezena[auxnumero];
                    auxnumero3 = vlrS.substr(cont - i + 1, 1);

                    if (auxnumero3 !== "0" && auxnumero2 !== "1")
                        extenso += " e ";
                } else if (
                    auxnumero <= 19 &&
                    auxnumero > 9 &&
                    (i === 14 || i === 11 || i === 8 || i === 5 || i === 2)
                ) {
                    extenso = extenso + unidade[auxnumero];
                } else if (
                    auxnumero < 10 &&
                    (i === 13 || i === 10 || i === 7 || i === 4 || i === 1)
                ) {
                    auxnumero3 = vlrS.substr(cont - i - 1, 1);
                    if (auxnumero3 !== "1" && auxnumero3 !== "")
                        extenso = extenso + unidade[auxnumero];
                }

                if (i % 3 === 1) {
                    verifica3 = cont - i;
                    if (verifica3 === 0) verifica1 = vlrS.substr(cont - i, 1);

                    if (verifica3 === 1)
                        verifica1 = vlrS.substr(cont - i - 1, 2);

                    if (verifica3 > 1) verifica1 = vlrS.substr(cont - i - 2, 3);

                    verifica2 = parseInt(verifica1, 10);

                    if (i === 13) {
                        if (verifica2 === 1) {
                            extenso = extenso + " " + qualificaS[4] + " ";
                        } else if (verifica2 !== 0) {
                            extenso = extenso + " " + qualificaP[4] + " ";
                        }
                    }
                    if (i === 10) {
                        if (verifica2 === 1) {
                            extenso = extenso + " " + qualificaS[3] + " ";
                        } else if (verifica2 !== 0) {
                            extenso = extenso + " " + qualificaP[3] + " ";
                        }
                    }
                    if (i === 7) {
                        if (verifica2 === 1) {
                            extenso = extenso + " " + qualificaS[2] + " ";
                        } else if (verifica2 !== 0) {
                            extenso = extenso + " " + qualificaP[2] + " ";
                        }
                    }
                    if (i === 4) {
                        if (verifica2 === 1) {
                            extenso = extenso + " " + qualificaS[1] + " ";
                        } else if (verifica2 !== 0) {
                            extenso = extenso + " " + qualificaP[1] + " ";
                        }
                    }
                    if (i === 1) {
                        if (verifica2 === 1) {
                            extenso = extenso + " " + qualificaS[0] + " ";
                        } else {
                            extenso = extenso + " " + qualificaP[0] + " ";
                        }
                    }
                }
            }

            return extenso;
        } else {
            return "Ponto 2 - Numero maior que 999 trilhões";
        }
    }
}
