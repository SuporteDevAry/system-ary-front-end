import { StepProps } from "../../pages/CriarNovoContrato/types";
import { BoxContainer, Scontainer } from "./styles";
import CustomButton from "../../../../components/CustomButton";

export const Review: React.FC<StepProps> = ({ formData }) => {
    const handleImprimir = () => {
        // const conteudo = document.getElementById("contrato").innerHTML;
        // const win = window.open("", "", "height=2480px, width=3508px");
        // win.document.write(conteudo);
        // win.print();
        // win.close();
    };

    return (
        <>
            <div>
                <div id="contrato">
                    <div style={{ textAlign: "center" }}>
                        <img
                            src="/src/assets/img/logo-ary-contrato.jpeg"
                            alt="logo ary contrato jpg"
                        />
                    </div>
                    <br />
                    <h3>
                        <p style={{ textAlign: "center" }}>
                            S&atilde;o Paulo, <span> &data_extenso </span>
                        </p>
                        <p style={{ textAlign: "center" }}>
                            Confirma&ccedil;&atilde;o de venda nr.
                            <span>&nro_contrato</span>
                            nesta data:
                        </p>
                    </h3>
                    <br />
                    <p
                        style={{
                            textAlign: "left",
                            margin: "0",
                        }}
                    >
                        <strong>VENDEDOR:</strong>
                        <span style={{ paddingLeft: "10px" }}>
                            {formData.seller}
                        </span>
                    </p>

                    <p style={{ textAlign: "left" }}>
                        <strong>COMPRADOR:</strong>
                        <span style={{ paddingLeft: "10px" }}>
                            {formData.buyer}
                        </span>
                    </p>
                    <br />
                    <p style={{ textAlign: "left" }}>
                        <strong>MERCADORIA:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        <span>{formData.product}</span>
                        <br />
                        <span>
                            <strong>
                                Safra: <span>{formData.crop}</span>
                            </strong>
                        </span>
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>QUALIDADE:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>{formData.quality}</p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>QUANTIDADE:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>{formData.quantity}</p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>PRE&Ccedil;O:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        R$ {formData.price} por sacas de 60(sessenta) quilos,
                        (+D.U.E.).
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>ICMS:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>{formData.icms}</p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>PAGAMENTO:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        No dia {formData.payment} , via Banco ...., Ag. nr .
                        ..... , c/c nr . ......, no CNPJ: &cnpj_vendedor em nome
                        de & nome_vendedor.
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>ENTREGA:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        Até o dia {formData.pickup},limpo e seco sobre rodas.
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>LOCAL DE ENTREGA:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        No terminal de {formData.pickupLocation} em{" "}
                        {formData.pickup}.
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>CONFER&Ecirc;NCIA:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.inspection}
                    </p>
                    <br />

                    <p style={{ textAlign: "left" }}>
                        <strong>OBSERVA&Ccedil;&Otilde;ES:</strong>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                        {formData.observation}
                    </p>
                    <br />

                    <p style={{ textAlign: "justify" }}>
                        <strong>
                            “Favor comunicar qualquer discrepância em 01 (um)
                            dia útil do recebimento da confirmação por escrito.
                            Se não houver discrepâncias relatadas, presume-se
                            que todas as partes envolvidas aceitam e concordam
                            com todos os termos conforme descrito na confirmação
                            de negócio acima.“
                        </strong>
                    </p>
                    <br />
                    <br />

                    <p style={{ textAlign: "justify" }}>
                        <strong>
                            === Comissão de <span>&perc_comissao</span> por
                            conta do vendedor. ===
                        </strong>
                    </p>
                    <br />
                    <br />
                    <br />

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ flex: "1" }}>
                                ______________________________________
                            </div>
                            <div style={{ flex: "1" }}>
                                _____________________________________
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ flex: "1" }}>{formData.seller}</div>
                            <div style={{ flex: "1" }}>{formData.buyer}</div>
                        </div>
                    </div>
                    <br />
                    <br />
                    <div style={{ flex: "1" }}>
                        <p style={{ textAlign: "center" }}>
                            Gerado automaticamente pelo sistema AryOleofar.
                        </p>
                    </div>
                </div>
                <Scontainer>
                    <BoxContainer>
                        <CustomButton
                            onClick={handleImprimir}
                            variant={"primary"}
                        >
                            Imprimir
                        </CustomButton>
                    </BoxContainer>
                </Scontainer>
            </div>
        </>
    );
};
