import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import { TbFilter, TbFilterOff } from "react-icons/tb";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { BrokerContext } from "../../../../contexts/BrokerContext";
import { IColumn } from "../../../../components/CustomTable/types";
import CustomTable from "../../../../components/CustomTable";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomButton from "../../../../components/CustomButton";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import { ModalDelete } from "../../../../components/ModalDelete";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import { useUserPermissions } from "../../../../hooks";
import useTableSearch from "../../../../hooks/useTableSearch";
import { BoxContainer, SButtonContainer, SContainer, STitle } from "./styles";

type BrokerRow = Record<string, any> & { id: string; broker_name?: string };

// const brokerFields = [
//     "mesa",
//     "broker",
//     "product",
//     "broker_name",
//     "broker_nick",
//     "broker_abbrev",
//     "company_name",
//     "cnpj_cpf",
//     "bank_number",
//     "bank_name",
//     "ag_number",
//     "account_number",
//     "date_ini",
//     "date_fin",
//     "commision",
//     "cctipo",
//     "ccdesconto",
//     "sca",
//     "aj_prolab",
// ];

const brokerFieldsSearch = ["mesa", "broker_name", "broker_nick"];

function parseBrokerDate(value?: string) {
    const normalizedValue = String(value ?? "").trim();
    if (!normalizedValue) return null;

    const dateText = normalizedValue.split(/[T ]/)[0];
    const parts = dateText.split(/[\/.-]/).filter(Boolean);
    if (parts.length !== 3) return null;

    const numbers = parts.map(Number);
    if (numbers.some((part) => !Number.isInteger(part))) return null;

    const [first, second, third] = numbers;
    const year = parts[0].length === 4 ? first : third;
    const month = second;
    const day = parts[0].length === 4 ? third : first;
    if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31)
        return null;

    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    )
        return null;

    date.setHours(0, 0, 0, 0);
    return date;
}

function isBrokerActive(dateIni?: string, dateFin?: string) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const startDate = parseBrokerDate(dateIni);
    const endDate = parseBrokerDate(dateFin);

    return Boolean(
        startDate &&
        endDate &&
        startDate < currentDate &&
        endDate > currentDate,
    );
}

export function Broker() {
    const brokerContext = BrokerContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { canConsult } = useUserPermissions();
    const [isLoading, setIsLoading] = useState(true);
    const [brokers, setBrokers] = useState<BrokerRow[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const [isDeleteModal, setDeleteModal] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState<BrokerRow | null>(
        null,
    );
    const [modalContent, setModalContent] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState("mesa");
    const [isSelectionModal, setSelectionModal] = useState(false);
    const [selectData, setSelectData] = useState<SelectState>({});

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await brokerContext.listBrokers();
            setBrokers(response.data);
        } catch (error) {
            toast.error(`Erro ao ler brokers: ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [brokerContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    useEffect(() => {
        if ((location.state as any)?.updated) {
            fetchData();
            navigate(location.pathname, { state: {} });
        }
    }, [location.state, fetchData, navigate, location.pathname]);

    const filteredBrokers = useMemo(() => {
        let result = showOnlyActive
            ? brokers.filter((broker) =>
                  isBrokerActive(broker.date_ini, broker.date_fin),
              )
            : brokers;

        const filterStart = parseBrokerDate(selectData.date_start as string);
        const filterEnd = parseBrokerDate(selectData.date_end as string);
        const filterMesa = String(selectData.mesa ?? "")
            .trim()
            .toUpperCase();

        if (filterStart || filterEnd || filterMesa) {
            result = result.filter((broker) => {
                if (filterStart || filterEnd) {
                    const brokerStart = parseBrokerDate(broker.date_ini);
                    const brokerEnd = parseBrokerDate(broker.date_fin);

                    if (
                        filterStart &&
                        (!brokerStart || brokerStart < filterStart)
                    )
                        return false;
                    if (filterEnd && (!brokerEnd || brokerEnd > filterEnd))
                        return false;
                }

                if (
                    filterMesa &&
                    String(broker.mesa ?? "")
                        .trim()
                        .toUpperCase() !== filterMesa
                ) {
                    return false;
                }

                return true;
            });
        }

        return result;
    }, [brokers, showOnlyActive, selectData]);

    const { filteredData: visibleBrokers } = useTableSearch({
        data: filteredBrokers,
        searchTerm,
        searchableFields: brokerFieldsSearch,
    });

    const isInitialFilter = useMemo(
        () =>
            !selectData.date_start && !selectData.date_end && !selectData.mesa,
        [selectData],
    );

    const mesaOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    brokers
                        .map((broker) => String(broker.mesa ?? "").trim())
                        .filter(Boolean),
                ),
            ).sort(),
        [brokers],
    );

    const brokerExcelColumns: IColumn[] = useMemo(
        () => [
            { field: "mesa", header: "Mesa", width: "100px", sortable: true },
            {
                field: "broker",
                header: "Broker",
                width: "120px",
                sortable: true,
            },
            { field: "product", header: "Produto", width: "120px" },
            { field: "broker_name", header: "Nome do Broker", width: "180px" },
            { field: "broker_nick", header: "Apelido", width: "140px" },
            { field: "broker_abbrev", header: "Abreviacao", width: "120px" },
            { field: "company_name", header: "Empresa", width: "180px" },
            { field: "cnpj_cpf", header: "CNPJ/CPF", width: "140px" },
            { field: "bank_number", header: "Numero Banco", width: "130px" },
            { field: "bank_name", header: "Banco", width: "160px" },
            { field: "ag_number", header: "Agencia", width: "120px" },
            { field: "account_number", header: "Conta", width: "130px" },
            { field: "date_ini", header: "Data Inicial", width: "120px" },
            { field: "date_fin", header: "Data Final", width: "120px" },
            { field: "commision", header: "Comissao", width: "110px" },
            { field: "cctipo", header: "Tipo CC", width: "110px" },
            { field: "ccdesconto", header: "Desconto CC", width: "120px" },
            { field: "sca", header: "SCA", width: "100px" },
            { field: "aj_prolab", header: "Ajuste Prolabore", width: "140px" },
        ],
        [],
    );

    const brokerTableColumns = useMemo(
        () =>
            brokerExcelColumns.filter(
                (column) =>
                    ![
                        "broker_abbrev",
                        "company_name",
                        "cnpj_cpf",
                        "bank_number",
                        "bank_name",
                        "ag_number",
                        "account_number",
                        "commision",
                        "cctipo",
                        "ccdesconto",
                        "sca",
                        "aj_prolab",
                    ].includes(column.field),
            ),
        [brokerExcelColumns],
    );

    const handleDelete = async () => {
        if (!selectedBroker) return;
        try {
            await brokerContext.deleteBroker(selectedBroker.id);
            toast.success("Broker deletado com sucesso!");
            fetchData();
        } catch (error) {
            toast.error(`Erro ao excluir broker: ${error}`);
        } finally {
            setDeleteModal(false);
            setSelectedBroker(null);
        }
    };

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);

    const handleClearFilterModal = () => {
        setSelectData({});
        setPage(0);
        setSelectionModal(false);
    };

    const handleConfirmFilters = (filters: SelectState) => {
        setSelectData(filters);
        setPage(0);
        setSelectionModal(false);
    };

    const handleExportExcel = () => {
        try {
            const exportRows = [
                ["Brokers"],
                [],
                brokerExcelColumns.map((col) => col.header),
                ...visibleBrokers.map((row) =>
                    brokerExcelColumns.map((col) => row[col.field] ?? ""),
                ),
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
            const columnCount = brokerExcelColumns.length;

            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
            ];

            worksheet["!cols"] = brokerExcelColumns.map((col) => ({
                wch: Math.max(
                    12,
                    Math.round(Number.parseInt(col.width || "120", 10) / 8),
                ),
            }));

            const titleStyle = {
                font: { bold: true, sz: 14, color: { rgb: "1F1F1F" } },
                fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const headerStyle = {
                font: { bold: true, color: { rgb: "1F1F1F" } },
                fill: { patternType: "solid", fgColor: { rgb: "E7B10A" } },
                border: {
                    top: { style: "thin", color: { rgb: "FFFFFF" } },
                    bottom: { style: "thin", color: { rgb: "FFFFFF" } },
                    left: { style: "thin", color: { rgb: "FFFFFF" } },
                    right: { style: "thin", color: { rgb: "FFFFFF" } },
                },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const textStyle = {
                alignment: { horizontal: "left", vertical: "center" },
            };

            const applyStyle = (cellRef: string, style: any) => {
                if (worksheet[cellRef]) worksheet[cellRef].s = style;
            };

            for (let col = 0; col < columnCount; col += 1) {
                applyStyle(
                    XLSX.utils.encode_cell({ r: 0, c: col }),
                    titleStyle,
                );
                applyStyle(
                    XLSX.utils.encode_cell({ r: 2, c: col }),
                    headerStyle,
                );
            }

            for (let row = 3; row < exportRows.length; row += 1) {
                for (let col = 0; col < columnCount; col += 1) {
                    applyStyle(
                        XLSX.utils.encode_cell({ r: row, c: col }),
                        textStyle,
                    );
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Brokers");
            XLSX.writeFile(workbook, "Brokers.xlsx", { bookType: "xlsx" });
        } catch (error) {
            toast.error(`Erro ao exportar Excel: ${error}`);
        }
    };

    const renderActionButtons = useCallback(
        (row: any) => (
            <SButtonContainer>
                <CustomButton
                    $variant="primary"
                    width="60px"
                    onClick={() =>
                        navigate("/commission/broker/editar", {
                            state: { brokerForUpdate: row },
                        })
                    }
                    disabled={canConsult}
                >
                    Editar
                </CustomButton>
                <CustomButton
                    $variant="danger"
                    width="60px"
                    onClick={() => {
                        setSelectedBroker(row);
                        setModalContent(
                            `Tem certeza que deseja deletar o broker: ${row.broker_name}?`,
                        );
                        setDeleteModal(true);
                    }}
                    disabled={canConsult}
                >
                    Deletar
                </CustomButton>
            </SButtonContainer>
        ),
        [canConsult, navigate],
    );

    return (
        <SContainer>
            <STitle>Brokers</STitle>
            <BoxContainer>
                <CustomSearch
                    width="350px"
                    placeholder="Pesquise por Mesa, Nome ou Apelido"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={showOnlyActive}
                            onChange={(event) => {
                                setShowOnlyActive(event.target.checked);
                                setPage(0);
                            }}
                            color="success"
                        />
                    }
                    label="Somente ativos"
                />
                <CustomTooltipLabel title="Filtrar brokers">
                    <IconButton
                        aria-label="filter"
                        onClick={handleSelectionModal}
                        sx={{ color: "#E7B10A" }}
                    >
                        <TbFilter />
                    </IconButton>
                </CustomTooltipLabel>
                <CustomTooltipLabel title="Limpar filtros">
                    <span>
                        <IconButton
                            aria-label="clearfilter"
                            onClick={handleClearFilterModal}
                            sx={{ color: "#E7B10A" }}
                            disabled={isInitialFilter}
                        >
                            <TbFilterOff />
                        </IconButton>
                    </span>
                </CustomTooltipLabel>
                <ReportFilter
                    titleText="Filtrar Brokers"
                    open={isSelectionModal}
                    initialFilters={selectData}
                    onClose={handleCloseModal}
                    onChange={(filters) => setSelectData(filters)}
                    onConfirm={handleConfirmFilters}
                    visibleFields={["date_start", "date_end", "mesa"]}
                    fieldLabels={{
                        date_start: "Data Inicial",
                        date_end: "Data Final",
                    }}
                    mesaOptions={mesaOptions}
                    allowEmptyMesa
                />
                <CustomButton
                    $variant="success"
                    width="120px"
                    onClick={handleExportExcel}
                >
                    Excel
                </CustomButton>
                <CustomButton
                    $variant="success"
                    width="160px"
                    onClick={() => navigate("/commission/broker/cadastrar")}
                    disabled={canConsult}
                >
                    Criar Novo Broker
                </CustomButton>
            </BoxContainer>
            <CardContent>
                <CustomTable
                    data={visibleBrokers}
                    columns={brokerTableColumns}
                    isLoading={isLoading}
                    hasPagination
                    actionButtons={renderActionButtons}
                    page={page}
                    setPage={setPage}
                    order={order}
                    orderBy={orderBy}
                    setOrder={setOrder}
                    setOrderBy={setOrderBy}
                />
            </CardContent>
            {selectedBroker && (
                <ModalDelete
                    open={isDeleteModal}
                    onClose={() => {
                        setDeleteModal(false);
                        setSelectedBroker(null);
                    }}
                    content={modalContent}
                    onConfirm={handleDelete}
                />
            )}
        </SContainer>
    );
}
