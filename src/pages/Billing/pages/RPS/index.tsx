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

export function RPS(): JSX.Element {
    const ISS_PERCENT = 0.05;
    const PIS_PERCENT = 0.0065;
    const COFINS_PERCENT = 0.04;
    const navigate = useNavigate();
    const location = useLocation();
    const invoiceContext = InvoiceContext();
    const clienteContext = ClienteContext();
    const currentDate = dayjs().format("DD/MM/YYYY");
    const [cnpjFound, setCnpjFound] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string>("");
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [clientes, setClientes] = useState<IListCliente[]>([]);

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

    const calculateIrrfValue = useCallback(
        (serviceValue: number, document: string) => {
            if (isCpf(document)) {
                return "0,00";
            }

            return formatEuropeanDecimal(serviceValue * 0.015);
        },
        [isCpf],
    );

    const calculateServiceLiquidValue = useCallback(
        (serviceValue: number, irrfValue: string, valueAdjust1: string) =>
            formatEuropeanDecimal(
                serviceValue -
                    parseEuropeanDecimal(irrfValue) -
                    parseEuropeanDecimal(valueAdjust1),
            ),
        [],
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

            setFormData({
                rps_number: editingInvoice.rps_number || "",
                rps_emission_date: normalizeDateToBr(
                    editingInvoice.rps_emission_date,
                ),
                exportacao: normalizeExportService(editingInvoice.exportacao),
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
                zip_code: editingInvoice.zip_code || "",
                email: editingInvoice.email || "",
                service_discrim: editingInvoice.service_discrim || "",
                service_value: formatEuropeanDecimal(
                    editingInvoice.service_value || 0,
                ),
                name_adjust1: editingInvoice.name_adjust1 || "",
                value_adjust1: formatEuropeanDecimal(
                    editingInvoice.value_adjust1 || 0,
                ),
                name_adjust2: editingInvoice.name_adjust2 || "",
                value_adjust2: editingInvoice.value_adjust2 || 0,
                irrf_value: formatEuropeanDecimal(
                    editingInvoice.irrf_value || 0,
                ),
                service_liquid_value: formatEuropeanDecimal(
                    editingInvoice.service_liquid_value || 0,
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

    const fetchData = useCallback(async () => {
        const editingInvoice = location.state?.editingInvoice;

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

        setFormData((prev) => ({
            ...prev,
            cpf_cnpj: cnpj,
        }));

        const nextNumberRps = await invoiceContext.getNextNumberRps();
        setFormData((prev) => ({
            ...prev,
            rps_number: nextNumberRps.data.nextNumber,
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
        if (isEditing) {
            return;
        }

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
            formData.service_value,
        );
        const linhaIRRF = formatLinha("(-) I.R.R.F.", formData.irrf_value);
        const linhaAjuste1 =
            formData.name_adjust1.length > 0
                ? formatLinha(formData.name_adjust1, formData.value_adjust1)
                : "";
        const linhaTotalPago = formatLinha(
            "VALOR A SER PAGO",
            formData.service_liquid_value,
        );

        const contract = "";
        const dadosContrato = {
            service_discrim: `Intermediacao de Negocios:

CTR. ${contract}

${linhaTotalServicos}
${linhaIRRF}
${linhaAjuste1}
${linhaTotalPago}


*** Depositar no Banco Bradesco S.A. (237)   Ag. 0108-2   C/C: 132.362-8

*** Chave PIX: 43.025.030/0001-65`,
        };

        setFormData((prev) => ({ ...prev, ...dadosContrato }));
    }, [
        isEditing,
        formData.service_value,
        formData.irrf_value,
        formData.name_adjust1,
        formData.value_adjust1,
        formData.service_liquid_value,
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
        try {
            const taxValues = buildInvoiceTaxValues(formData);
            const exportServiceValue = normalizeExportService(
                formData.exportacao,
            );
            const emissionDateValue = normalizeDateToBr(
                formData.rps_emission_date,
            );

            if (isEditing) {
                await invoiceContext.updateInvoice(editingId, {
                    ...formData,
                    exportacao: exportServiceValue,
                    rps_emission_date: emissionDateValue,
                    service_value: parseEuropeanDecimal(formData.service_value),
                    irrf_value: parseEuropeanDecimal(formData.irrf_value),
                    value_adjust1: parseEuropeanDecimal(formData.value_adjust1),
                    service_liquid_value: parseEuropeanDecimal(
                        formData.service_liquid_value,
                    ),
                    ...taxValues,
                });
                toast.success(
                    `RPS ${formData.rps_number} atualizada com sucesso!`,
                );
            } else {
                await invoiceContext.createInvoice({
                    ...formData,
                    exportacao: exportServiceValue,
                    rps_emission_date: emissionDateValue,
                    service_value: parseEuropeanDecimal(formData.service_value),
                    irrf_value: parseEuropeanDecimal(formData.irrf_value),
                    value_adjust1: parseEuropeanDecimal(formData.value_adjust1),
                    service_liquid_value: parseEuropeanDecimal(
                        formData.service_liquid_value,
                    ),
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
        }
    };

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
            const nextData = { ...prevData, [name]: normalizedValue };

            if (name === "cpf_cnpj") {
                const serviceValue = parseEuropeanDecimal(
                    prevData.service_value,
                );
                const irrfValue = calculateIrrfValue(serviceValue, value);

                return {
                    ...nextData,
                    irrf_value: irrfValue,
                    service_liquid_value: calculateServiceLiquidValue(
                        serviceValue,
                        irrfValue,
                        String(prevData.value_adjust1),
                    ),
                };
            }

            if (name === "service_value") {
                const serviceValue = parseEuropeanDecimal(value);
                const irrfValue = calculateIrrfValue(
                    serviceValue,
                    prevData.cpf_cnpj,
                );

                return {
                    ...nextData,
                    irrf_value: irrfValue,
                    service_liquid_value: calculateServiceLiquidValue(
                        serviceValue,
                        irrfValue,
                        String(prevData.value_adjust1),
                    ),
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
                ),
            }));
        },
        [
            calculateIrrfValue,
            calculateServiceLiquidValue,
            formData.service_value,
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
