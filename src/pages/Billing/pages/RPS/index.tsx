import { useCallback, useEffect, useState } from "react";
import { SBox, SContainer } from "./styles";
import { useNavigate, useLocation } from "react-router-dom";
import { FormularioNF } from "../../../../components/FormularioNF";
import { toast } from "react-toastify";
import CustomButton from "../../../../components/CustomButton";
import { ClienteContext } from "../../../../contexts/ClienteContext";
import { InvoiceContext } from "../../../../contexts/InvoiceContext";
import { IListCliente } from "../../../../contexts/ClienteContext/types";
import dayjs from "dayjs";
import {
    formatEuropeanDecimal,
    parseEuropeanDecimal,
} from "../../../../helpers/europeanDecimal";
import { ModalClientes } from "../../../Contracts/pages/CreateNewContract/components/Step1/components/ModalClientes";
import { CustomerInfo } from "../../../../contexts/ContractContext/types";
import useInfo from "../../../../hooks/userInfo";

export function RPS(): JSX.Element {
    const ISS_PERCENT = 0.05;
    const PIS_PERCENT = 0.0065;
    const COFINS_PERCENT = 0.04;
    const navigate = useNavigate();
    const location = useLocation();
    const invoiceContext = InvoiceContext();
    const clienteContext = ClienteContext();
    const { dataUserInfo } = useInfo();
    const currentDate = dayjs().format("DD/MM/YYYY");
    const [cnpjFound, setCnpjFound] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string>("");
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientes, setClientes] = useState<IListCliente[]>([]);
    const [suggestedRpsNumber, setSuggestedRpsNumber] = useState<number | null>(
        null,
    );
    const [originalRpsValue, setOriginalRpsValue] = useState<string>("");
    const [originalRpsNumber, setOriginalRpsNumber] = useState<number | null>(
        null,
    );

    const isCpf = useCallback((document: string) => {
        const digits = document.replace(/\D/g, "");
        return digits.length === 11;
    }, []);

    const normalizeExportService = useCallback((value?: string | null) => {
        return value === "Sim" ? "Sim" : "Não";
    }, []);

    const normalizeDateToBr = useCallback(
        (value?: string | null, fallback = currentDate) => {
            if (!value) {
                return fallback;
            }

            const trimmedValue = String(value).trim();

            if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedValue)) {
                return trimmedValue;
            }

            const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) {
                const [, year, month, day] = isoMatch;
                return `${day}/${month}/${year}`;
            }

            const parsedDate = dayjs(trimmedValue);
            return parsedDate.isValid()
                ? parsedDate.format("DD/MM/YYYY")
                : fallback;
        },
        [currentDate],
    );

    const shouldApplyIrrf = useCallback(
        (exportacao?: string | null) =>
            normalizeExportService(exportacao) !== "Sim",
        [normalizeExportService],
    );

    const calculateIrrfValue = useCallback(
        (
            serviceValue: number,
            document: string,
            exportacao?: string | null,
        ) => {
            if (!shouldApplyIrrf(exportacao)) {
                return "0,00";
            }

            if (isCpf(document)) {
                return "0,00";
            }

            return formatEuropeanDecimal(serviceValue * 0.015);
        },
        [isCpf, shouldApplyIrrf],
    );

    const calculateServiceLiquidValue = useCallback(
        (
            serviceValue: number,
            irrfValue: string,
            valueAdjust1: string,
            exportacao?: string | null,
        ) =>
            formatEuropeanDecimal(
                serviceValue -
                    (shouldApplyIrrf(exportacao)
                        ? parseEuropeanDecimal(irrfValue)
                        : 0) +
                    parseEuropeanDecimal(valueAdjust1),
            ),
        [shouldApplyIrrf],
    );

    const calculateCsllValue = useCallback(
        (serviceValue: number, emissionDate: string) => {
            if (!emissionDate) {
                return 0;
            }

            const [day, month, year] = emissionDate.split("/").map(Number);
            if (!day || !month || !year) {
                return 0;
            }

            const rpsEmissionDate = new Date(year, month - 1, day);
            const limit2025 = new Date(2025, 11, 31);
            const limitMarch2026 = new Date(2026, 2, 31);

            if (
                rpsEmissionDate > limit2025 &&
                rpsEmissionDate <= limitMarch2026
            ) {
                return serviceValue * 0.0288;
            }

            if (rpsEmissionDate > limitMarch2026) {
                return serviceValue * 0.032;
            }

            return 0;
        },
        [],
    );

    const initialformData = {
        rps_number: "",
        rps_emission_date: currentDate,
        exportacao: "Não",
        nfs_number: "",
        nfs_emission_date: "",
        service_code: "",
        aliquot: 0,
        cpf_cnpj: "",
        name: "",
        address: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        cod_pais: "",
        zip_code: "",
        email: "",
        service_discrim: "",
        service_value: "0,00",
        name_adjust1: "",
        value_adjust1: "0,00",
        name_adjust2: "",
        value_adjust2: 0,
        irrf_value: "0,00",
        service_liquid_value: "0,00",
        deduction_value: 0,
        pis_value: 0,
        cofins_value: 0,
        csll_value: 0,
        iss_value: 0,
    };

    const [formData, setFormData] = useState(initialformData);

    const buildServiceValuesBlock = useCallback(
        (data: typeof formData) => {
            const larguraValor = 15;
            const colunaTotal = 40;

            function formatLinha(nome: string, valor: number | string) {
                const valorStr = parseEuropeanDecimal(valor)
                    .toFixed(2)
                    .padStart(larguraValor, " ");
                const pontosQtd = colunaTotal - nome.length - valorStr.length;
                const pontos = ".".repeat(pontosQtd > 0 ? pontosQtd : 0);
                return `${nome}${pontos} R$ ${valorStr}`;
            }

            const linhaTotalServicos = formatLinha(
                "TOTAL DOS SERVICOS",
                data.service_value,
            );
            const linhaIRRF =
                normalizeExportService(data.exportacao) === "Sim"
                    ? ""
                    : formatLinha("(-) I.R.R.F.", data.irrf_value);
            const linhaAjuste1 =
                data.name_adjust1.length > 0
                    ? formatLinha(data.name_adjust1, data.value_adjust1)
                    : "";
            const linhaTotalPago = formatLinha(
                "VALOR A SER PAGO",
                data.service_liquid_value,
            );

            return [
                linhaTotalServicos,
                linhaIRRF,
                linhaAjuste1,
                linhaTotalPago,
            ]
                .filter(Boolean)
                .join("\n");
        },
        [],
    );

    const upsertServiceValuesBlock = useCallback(
        (currentText: string, valuesBlock: string) => {
            const text = String(currentText ?? "");
            const trimmedText = text.trim();

            if (!trimmedText) {
                return `Intermediacao de Negocios:

CTR. 

${valuesBlock}


*** Depositar no Banco Bradesco S.A. (237)   Ag. 0108-2   C/C: 132.362-8

*** Chave PIX: 43.025.030/0001-65`;
            }

            const startToken = "TOTAL DOS SERVICOS";
            const endToken = "VALOR A SER PAGO";
            const startIndex = text.indexOf(startToken);
            const endIndex = text.indexOf(endToken, startIndex >= 0 ? startIndex : 0);

            if (startIndex === -1 || endIndex === -1) {
                return text.endsWith("\n")
                    ? `${text}\n${valuesBlock}`
                    : `${text}\n\n${valuesBlock}`;
            }

            const lineEndIndex = text.indexOf("\n", endIndex);
            const blockEndIndex =
                lineEndIndex === -1 ? text.length : lineEndIndex + 1;

            return `${text.slice(0, startIndex)}${valuesBlock}\n${text.slice(
                blockEndIndex,
            )}`;
        },
        [],
    );

    const buildInvoiceTaxValues = useCallback(
        (data: typeof formData) => {
            const serviceValue = parseEuropeanDecimal(data.service_value);
            const emissionDate = normalizeDateToBr(data.rps_emission_date);

            return {
                pis_value: serviceValue * PIS_PERCENT,
                cofins_value: serviceValue * COFINS_PERCENT,
                csll_value: calculateCsllValue(serviceValue, emissionDate),
                iss_value: serviceValue * ISS_PERCENT,
            };
        },
        [calculateCsllValue, normalizeDateToBr],
    );

    const populateFormData = useCallback(
        (editingInvoice: any) => {
            setIsEditing(true);
            setEditingId(editingInvoice.id);
            setCnpjFound(true);
            setOriginalRpsValue(String(editingInvoice.rps_number ?? ""));
            setOriginalRpsNumber(
                Number(editingInvoice.rps_number ?? editingInvoice.rpsNumber ?? 0),
            );
            const exportacaoValue = normalizeExportService(
                editingInvoice.exportacao,
            );
            const serviceValue = parseEuropeanDecimal(
                editingInvoice.service_value || 0,
            );
            const irrfValue =
                exportacaoValue === "Sim"
                    ? "0,00"
                    : formatEuropeanDecimal(editingInvoice.irrf_value || 0);
            const valueAdjust1 = formatEuropeanDecimal(
                editingInvoice.value_adjust1 || 0,
            );

            setFormData({
                rps_number: editingInvoice.rps_number || "",
                rps_emission_date: normalizeDateToBr(
                    editingInvoice.rps_emission_date,
                ),
                exportacao: exportacaoValue,
                nfs_number: editingInvoice.nfs_number || "",
                nfs_emission_date: editingInvoice.nfs_emission_date
                    ? normalizeDateToBr(editingInvoice.nfs_emission_date, "")
                    : "",
                service_code: editingInvoice.service_code || "",
                aliquot: editingInvoice.aliquot || 0,
                cpf_cnpj: editingInvoice.cpf_cnpj || "",
                name: editingInvoice.name || "",
                address: editingInvoice.address || "",
                number: editingInvoice.number || "",
                complement: editingInvoice.complement || "",
                district: editingInvoice.district || "",
                city: editingInvoice.city || "",
                state: editingInvoice.state || "",
                cod_pais:
                    editingInvoice.cod_pais ||
                    editingInvoice.country_code ||
                    "",
                zip_code: editingInvoice.zip_code || "",
                email: editingInvoice.email || "",
                service_discrim: editingInvoice.service_discrim || "",
                service_value: formatEuropeanDecimal(
                    serviceValue,
                ),
                name_adjust1: editingInvoice.name_adjust1 || "",
                value_adjust1: valueAdjust1,
                name_adjust2: editingInvoice.name_adjust2 || "",
                value_adjust2: editingInvoice.value_adjust2 || 0,
                irrf_value: irrfValue,
                service_liquid_value: calculateServiceLiquidValue(
                    serviceValue,
                    irrfValue,
                    valueAdjust1,
                    exportacaoValue,
                ),
                deduction_value: editingInvoice.deduction_value || 0,
                pis_value: editingInvoice.pis_value || 0,
                cofins_value: editingInvoice.cofins_value || 0,
                csll_value: editingInvoice.csll_value || 0,
                iss_value: editingInvoice.iss_value || 0,
            });
        },
        [normalizeDateToBr, normalizeExportService],
    );

    const fetchCustomers = useCallback(async () => {
        try {
            setIsLoadingCustomers(true);
            const response = await clienteContext.listClientes();
            setClientes(response.data);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler clientes, contacte o administrador do sistema ${error}`,
            );
        } finally {
            setIsLoadingCustomers(false);
        }
    }, [clienteContext]);

    const findInvoiceByRps = useCallback(
        async (rpsNumber: string) => {
            try {
                const response = await invoiceContext.getInvoiceByRps(rpsNumber);
                const invoice = Array.isArray(response?.data)
                    ? response.data[0]
                    : response?.data;

                return invoice ?? null;
            } catch {
                return null;
            }
        },
        [invoiceContext],
    );

    const restoreValidRpsNumber = useCallback(() => {
        const validRpsValue = isEditing
            ? originalRpsValue
            : suggestedRpsNumber !== null
              ? String(suggestedRpsNumber)
              : "";

        if (!validRpsValue) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            rps_number: validRpsValue,
        }));
    }, [isEditing, originalRpsValue, suggestedRpsNumber]);

    const validateMinimumRpsNumber = useCallback(
        (rpsNumber: string, inputElement?: HTMLInputElement) => {
            const minimumRpsNumber = isEditing
                ? originalRpsNumber
                : suggestedRpsNumber;

            if (minimumRpsNumber === null) {
                return true;
            }

            const currentRpsNumber = Number(
                String(rpsNumber).replace(/\D/g, ""),
            );

            if (
                Number.isFinite(currentRpsNumber) &&
                currentRpsNumber < minimumRpsNumber
            ) {
                const messageNumber = isEditing
                    ? originalRpsNumber
                    : suggestedRpsNumber;
                restoreValidRpsNumber();
                toast.error(
                    `Não é permitido informar número RPS inferior a ${messageNumber}`,
                );
                if (inputElement) {
                    setTimeout(() => {
                        inputElement.focus();
                        inputElement.select();
                    }, 0);
                }
                return false;
            }

            return true;
        },
        [
            isEditing,
            originalRpsNumber,
            restoreValidRpsNumber,
            suggestedRpsNumber,
        ],
    );

    const validateRpsNumber = useCallback(
        async (rpsNumber: string, inputElement?: HTMLInputElement) => {
            const normalizedRpsNumber = String(rpsNumber || "").trim();

            if (!normalizedRpsNumber) {
                return true;
            }

            const existingInvoice = await findInvoiceByRps(normalizedRpsNumber);
            if (
                existingInvoice &&
                String(existingInvoice.id) !== String(editingId)
            ) {
                toast.error(
                    `Já existe uma RPS cadastrada com o número ${normalizedRpsNumber}`,
                );
                restoreValidRpsNumber();
                setTimeout(() => {
                    inputElement?.focus();
                    inputElement?.select();
                }, 0);
                return false;
            }

            return true;
        },
        [editingId, findInvoiceByRps, restoreValidRpsNumber],
    );

    const fetchData = useCallback(async () => {
        const editingInvoice = location.state?.editingInvoice;
        let nextNumberValue: number | null = null;

        try {
            const nextNumberRps = await invoiceContext.getNextNumberRps();
            nextNumberValue = Number(nextNumberRps.data.nextNumber ?? 0);
            setSuggestedRpsNumber(nextNumberValue);
        } catch {
            setSuggestedRpsNumber(null);
        }

        if (editingInvoice) {
            try {
                const response = await invoiceContext.getInvoiceById(
                    editingInvoice.id,
                );
                populateFormData(response.data);
            } catch {
                populateFormData(editingInvoice);
            }
            return;
        }

        const cnpj = "";

        setIsEditing(false);
        setEditingId("");
        setOriginalRpsValue("");
        setOriginalRpsNumber(null);

        setFormData((prev) => ({
            ...prev,
            cpf_cnpj: cnpj,
        }));

        setFormData((prev) => ({
            ...prev,
            rps_number: String(nextNumberValue || ""),
        }));

        try {
            // const response = await clienteContext.getClientByCnpj_cpf(cnpj);
            // if (response.status == "200") {
            //     setFormData((prev) => ({
            //         ...prev,
            //         cpf_cnpj: cnpj,
            //         name: response.data.name || "",
            //         address: response.data.address || "",
            //         number: response.data.number || "",
            //         district: response.data.district || "",
            //         city: response.data.city || "",
            //         state: response.data.state || "",
            //         zip_code: response.data.zip_code || "",
            //     }));
            // }
        } catch (error) {
            setCnpjFound(false);
            setFormData((prev) => ({
                ...prev,
                cpf_cnpj: cnpj,
            }));
        }
    }, [invoiceContext, location.state, populateFormData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        const valuesBlock = buildServiceValuesBlock(formData);

        setFormData((prev) => ({
            ...prev,
            service_discrim: upsertServiceValuesBlock(
                prev.service_discrim,
                valuesBlock,
            ),
        }));
    }, [
        formData.service_value,
        formData.irrf_value,
        formData.name_adjust1,
        formData.value_adjust1,
        formData.service_liquid_value,
        formData.exportacao,
        buildServiceValuesBlock,
        upsertServiceValuesBlock,
    ]);

    const checkCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (cnpjFound) return;

        const cnpj = e.target.value.replace(/\D/g, "");

        if (cnpj.length > 11) {
            fetch(`${process.env.REACT_APP_URL_CNPJ}/${cnpj}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "ERROR") {
                        toast.error(`${data.message}`);
                        setFormData({
                            ...initialformData,
                            cpf_cnpj: cnpj,
                        });
                        return;
                    }
                    setFormData((prev) => ({
                        ...prev,
                        name: data.nome || "",
                        address: data.logradouro || "",
                        number: data.numero || "",
                        district: data.bairro || "",
                        city: data.municipio || "",
                        state: data.uf || "",
                        zip_code: data.cep || "",
                    }));
                });
        }
    };

    const handleCreate = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (!validateMinimumRpsNumber(formData.rps_number)) {
                setIsSubmitting(false);
                return;
            }

            const isRpsNumberValid = await validateRpsNumber(
                formData.rps_number,
            );
            if (!isRpsNumberValid) {
                return;
            }

            const taxValues = buildInvoiceTaxValues(formData);
            const exportServiceValue = normalizeExportService(
                formData.exportacao,
            );
            const irrfValue = exportServiceValue === "Sim"
                ? 0
                : parseEuropeanDecimal(formData.irrf_value);
            const serviceLiquidValue = parseEuropeanDecimal(
                calculateServiceLiquidValue(
                    parseEuropeanDecimal(formData.service_value),
                    formData.irrf_value,
                    String(formData.value_adjust1),
                    exportServiceValue,
                ),
            );
            if (
                exportServiceValue === "Sim" &&
                !String(formData.cod_pais || "").trim()
            ) {
                toast.error("Informe o Cód.País para exportação de serviço.");
                setIsSubmitting(false);
                return;
            }
            const emissionDateValue = normalizeDateToBr(
                formData.rps_emission_date,
            );

            if (isEditing) {
                await invoiceContext.updateInvoice(editingId, {
                    ...formData,
                    owner_record: dataUserInfo?.email || "",
                    exportacao: exportServiceValue,
                    rps_emission_date: emissionDateValue,
                    service_value: parseEuropeanDecimal(formData.service_value),
                    irrf_value: irrfValue,
                    value_adjust1: parseEuropeanDecimal(formData.value_adjust1),
                    service_liquid_value: serviceLiquidValue,
                    ...taxValues,
                });
                toast.success(
                    `RPS ${formData.rps_number} atualizada com sucesso!`,
                );
            } else {
                await invoiceContext.createInvoice({
                    ...formData,
                    owner_record: dataUserInfo?.email || "",
                    exportacao: exportServiceValue,
                    rps_emission_date: emissionDateValue,
                    service_value: parseEuropeanDecimal(formData.service_value),
                    irrf_value: irrfValue,
                    value_adjust1: parseEuropeanDecimal(formData.value_adjust1),
                    service_liquid_value: serviceLiquidValue,
                    ...taxValues,
                });
                toast.success(
                    `RPS ${formData.rps_number} foi gravada com sucesso!`,
                );
            }
            navigate("/cobranca/notafiscal");
        } catch (error: any) {
            console.error(error);
            toast.error(
                `Erro ao ${isEditing ? "atualizar" : "criar"} a RPS: ${
                    error.message || String(error)
                }`,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRpsNumberBlur = useCallback(
        async (e: React.FocusEvent<HTMLInputElement>) => {
            const inputElement = e.currentTarget;

            if (!validateMinimumRpsNumber(e.target.value, inputElement)) {
                return;
            }

            await validateRpsNumber(e.target.value, inputElement);
        },
        [validateMinimumRpsNumber, validateRpsNumber],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "cpf_cnpj") {
            setCnpjFound(false);
        }

        setFormData((prevData) => {
            const normalizedValue =
                name === "exportacao"
                    ? normalizeExportService(value)
                    : name === "rps_emission_date"
                      ? normalizeDateToBr(value)
                      : value;
            const nextData = {
                ...prevData,
                [name]: normalizedValue,
                ...(name === "exportacao" && normalizedValue !== "Sim"
                    ? { cod_pais: "" }
                    : null),
            };
            const exportacaoAtual =
                name === "exportacao" ? normalizedValue : prevData.exportacao;
            const serviceValueAtual =
                name === "service_value"
                    ? parseEuropeanDecimal(value)
                    : parseEuropeanDecimal(prevData.service_value);
            const documentAtual =
                name === "cpf_cnpj" ? value : prevData.cpf_cnpj;
            const irrfAtual = calculateIrrfValue(
                serviceValueAtual,
                documentAtual,
                exportacaoAtual,
            );
            const serviceLiquidAtual = calculateServiceLiquidValue(
                serviceValueAtual,
                irrfAtual,
                String(prevData.value_adjust1),
                exportacaoAtual,
            );

            if (name === "cpf_cnpj") {
                return {
                    ...nextData,
                    irrf_value: irrfAtual,
                    service_liquid_value: serviceLiquidAtual,
                };
            }

            if (name === "service_value") {
                return {
                    ...nextData,
                    irrf_value: irrfAtual,
                    service_liquid_value: serviceLiquidAtual,
                };
            }

            if (name === "exportacao") {
                return {
                    ...nextData,
                    irrf_value: irrfAtual,
                    service_liquid_value: serviceLiquidAtual,
                };
            }

            return nextData;
        });
    };

    const handleOpenCustomerModal = useCallback(() => {
        setCustomerModalOpen(true);
    }, []);

    const handleCloseCustomerModal = useCallback(() => {
        setCustomerModalOpen(false);
    }, []);

    const handleSelectedSeller = useCallback(
        (
            selectedCustomerData: CustomerInfo & {
                type: "buyer" | "seller";
                zip_code?: string;
            },
        ) => {
            setCnpjFound(true);
            const serviceValue = parseEuropeanDecimal(formData.service_value);
            const irrfValue = calculateIrrfValue(
                serviceValue,
                selectedCustomerData.cnpj_cpf || "",
                formData.exportacao,
            );

            setFormData((prevData) => ({
                ...prevData,
                cpf_cnpj: selectedCustomerData.cnpj_cpf || "",
                name: selectedCustomerData.name || "",
                address: selectedCustomerData.address || "",
                number: selectedCustomerData.number || "",
                complement: selectedCustomerData.complement || "",
                district: selectedCustomerData.district || "",
                city: selectedCustomerData.city || "",
                state: selectedCustomerData.state || "",
                zip_code: selectedCustomerData.zip_code || "",
                irrf_value: irrfValue,
                service_liquid_value: calculateServiceLiquidValue(
                    serviceValue,
                    irrfValue,
                    String(prevData.value_adjust1),
                    prevData.exportacao,
                ),
            }));
        },
        [
            calculateIrrfValue,
            calculateServiceLiquidValue,
            formData.service_value,
            formData.exportacao,
        ],
    );

    return (
        <>
            <SContainer>
                <SBox>
                    <FormularioNF
                        titleText={isEditing ? "Editar RPS" : "Cadastro RPS"}
                        data={formData}
                        onHandleCreate={handleCreate}
                        onChange={handleChange}
                        onCheckCNPJ={checkCNPJ}
                        onRpsNumberBlur={handleRpsNumberBlur}
                        rpsNumberReadOnly={false}
                        isSubmitDisabled={isSubmitting}
                        cpfCnpjAction={
                            <CustomButton
                                $variant="success"
                                width="180px"
                                onClick={handleOpenCustomerModal}
                            >
                                Selecione Tomador
                            </CustomButton>
                        }
                    />
                </SBox>
            </SContainer>
            <ModalClientes
                open={isCustomerModalOpen}
                onClose={handleCloseCustomerModal}
                onConfirm={handleSelectedSeller}
                data={clientes}
                loading={isLoadingCustomers}
                selectionType="seller"
            />
        </>
    );
}
