import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { TbFilter, TbFilterOff, TbInfinity } from "react-icons/tb";
import { PiScroll } from "react-icons/pi";
import { CustomSearch } from "../../../../components/CustomSearch";
import CustomTable from "../../../../components/CustomTable";
import { IColumn } from "../../../../components/CustomTable/types";
import ReportFilter from "../../../../components/ReportFilter";
import { SelectState } from "../../../../components/ReportFilter/types";
import useTableSearch from "../../../../hooks/useTableSearch";
import { InvoiceContext } from "../../../../contexts/InvoiceContext";
import { IListInvoices } from "../../../../contexts/InvoiceContext/types";
import { SContainer, SContainerSearchAndButton, STitle } from "./styles";
import CustomButton from "../../../../components/CustomButton";
import CustomTooltipLabel from "../../../../components/CustomTooltipLabel";
import { sortTableData } from "../../../../components/CustomTable/helpers";

const DATE_FIELDS: string[] = ["rps_emission_date", "nfs_emission_date"];
const CURRENCY_FIELDS: string[] = [
    "service_value",
    "value_adjust1",
    "irrf_value",
    "service_liquid_value",
    "pis_value",
    "cofins_value",
    "csll_value",
    "iss_value",
    "ibs_value",
    "cbs_value",
];

const INVOICE_DETAIL_GROUPS = [
    {
        key: "identificacao",
        label: "Identificação",
        fields: [
            "rps_number",
            "rps_emission_date",
            "nfs_number",
            "nfs_emission_date",
            "status",
            "code_verif",
        ],
    },
    {
        key: "tomador",
        label: "Tomador",
        fields: [
            "name",
            "cpf_cnpj",
            "address",
            "number",
            "complement",
            "district",
            "city",
            "state",
            "zip_code",
            "cod_pais",
        ],
    },
    {
        key: "servico",
        label: "Serviço e Valores",
        fields: [
            "service_discrim",
            "service_value",
            "name_adjust1",
            "value_adjust1",
            "deduction_value",
            "irrf_value",
            "valor_ir",
            "service_liquid_value",
            "pis_value",
            "cofins_value",
            "csll_value",
            "iss_value",
            "aliquot",
            "ibs_value",
            "cbs_value",
            "exportacao",
        ],
    },
] as const;

const formatInvoiceValue = (field: string, value: any) => {
    if (value === null || value === undefined || value === "") return "-";

    if (DATE_FIELDS.includes(field)) {
        if (typeof value !== "string") return String(value);
        const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            return `${day}/${month}/${year}`;
        }
        return value;
    }

    if (CURRENCY_FIELDS.includes(field)) {
        return Number(value || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    if (field === "xml_nfse") {
        return String(value);
    }

    return String(value);
};

const formatServiceDiscrimValue = (value: any) => {
    if (value === null || value === undefined || value === "") return "-";

    return String(value)
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean)
        .join("\n");
};

const getFieldLabel = (field: string) =>
    ({
        id: "ID",
        rps_number: "Nº RPS",
        rps_emission_date: "Dt. RPS",
        nfs_number: "Nº NFS",
        nfs_emission_date: "Dt. NFS",
        status: "Status",
        code_verif: "Cód. Verificação",
        name: "Tomador",
        cpf_cnpj: "CPF/CNPJ",
        address: "Endereço",
        number: "Número",
        complement: "Complemento",
        district: "Bairro",
        city: "Cidade",
        state: "UF",
        zip_code: "CEP",
        cod_pais: "País",
        service_discrim: "Discriminação",
        service_value: "Valor Serviço",
        name_adjust1: "Ajuste",
        value_adjust1: "Valor Ajuste",
        deduction_value: "Valor Dedução",
        irrf_value: "IRRF",
        valor_ir: "Valor IR",
        service_liquid_value: "Valor Líquido",
        pis_value: "PIS",
        cofins_value: "COFINS",
        csll_value: "CSLL",
        iss_value: "ISS",
        aliquot: "Alíquota",
        ibs_value: "IBS",
        cbs_value: "CBS",
        exportacao: "Exportação",
        url_danfse: "URL DANFSe",
        xml_nfse: "XML NFSe",
        owner_record: "Usuário RPS",
        owner_send: "Usuário Emissão",
    })[field] ?? field;

const DetailTable = ({
    title,
    fields,
    invoice,
}: {
    title: string;
    fields: readonly string[];
    invoice: IListInvoices;
}) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableBody>
                    {fields.map((field) => {
                        const invoiceField = field as keyof IListInvoices;
                        const value = invoice?.[invoiceField];
                        const displayValue =
                            field === "service_discrim"
                                ? formatServiceDiscrimValue(value)
                                : formatInvoiceValue(field, value);
                        return (
                            <TableRow key={field}>
                                <TableCell
                                    sx={{ width: "32%", fontWeight: 700 }}
                                >
                                    {getFieldLabel(field)}
                                </TableCell>
                                <TableCell>
                                    {field === "xml_nfse" ? (
                                        <Box
                                            component="pre"
                                            sx={{
                                                margin: 0,
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                                maxHeight: 220,
                                                overflow: "auto",
                                                fontFamily: "monospace",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            {displayValue}
                                        </Box>
                                    ) : field === "service_discrim" ? (
                                        <Box
                                            sx={{
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {displayValue}
                                        </Box>
                                    ) : field === "url_danfse" &&
                                      displayValue !== "-" ? (
                                        <a
                                            href={String(displayValue)}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {String(displayValue)}
                                        </a>
                                    ) : (
                                        displayValue
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
);

const TabPanel = ({
    children,
    value,
    index,
}: {
    children: ReactNode;
    value: number;
    index: number;
}) => {
    if (value !== index) return null;

    return <Box sx={{ pt: 2 }}>{children}</Box>;
};

export function LookupInvoices() {
    const invoiceContext = InvoiceContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [allInvoices, setAllInvoices] = useState<IListInvoices[]>([]);
    const [listInvoices, setListInvoices] = useState<IListInvoices[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [orderBy, setOrderBy] = useState<string>("nfs_number");
    const [isSelectionModal, setSelectionModal] = useState<boolean>(false);
    const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);
    const [selectedInvoice, setSelectedInvoice] =
        useState<IListInvoices | null>(null);
    const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
    const [invoiceDetailsTab, setInvoiceDetailsTab] = useState(0);

    const getInitialSelectData = (): SelectState => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const fmt = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate(),
            ).padStart(2, "0")}`;

        return {
            seller: "",
            buyer: "",
            date_start: fmt(firstDay),
            date_end: fmt(today),
            product: "",
            name_product: "",
        };
    };

    const [selectData, setSelectData] = useState<SelectState>(
        getInitialSelectData(),
    );

    const handleSelectionModal = () => setSelectionModal((prev) => !prev);
    const handleCloseModal = () => setSelectionModal(false);
    const handleOpenInvoiceDetails = useCallback((invoice: IListInvoices) => {
        setSelectedInvoice(invoice);
        setInvoiceDetailsTab(0);
        setIsInvoiceDetailsOpen(true);
    }, []);

    const handleCloseInvoiceDetails = useCallback(() => {
        setIsInvoiceDetailsOpen(false);
        setSelectedInvoice(null);
        setInvoiceDetailsTab(0);
    }, []);

    const normalizeStr = useCallback((value?: string | number | null) => {
        return (value ?? "")
            .toString()
            .toUpperCase()
            .normalize("NFD")
            .replace(/̀-ͯ/g, "")
            .trim();
    }, []);

    const parseYMD = useCallback((iso?: string) => {
        if (!iso) return null;
        const [y, m, d] = iso.split("-").map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    }, []);

    const onlyDate = useCallback(
        (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        [],
    );

    const formatDateBR = useCallback((value?: string) => {
        if (!value) return "";
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

        const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            return `${day}/${month}/${year}`;
        }

        return value;
    }, []);

    const getInvoiceDate = useCallback(
        (invoice: IListInvoices) =>
            invoice.nfs_emission_date || invoice.rps_emission_date || "",
        [],
    );

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await invoiceContext.listInvoices();
            const onlyIssuedInvoices = (response.data || []).filter(
                (invoice: IListInvoices) => Boolean(invoice.nfs_number),
            );

            setAllInvoices(onlyIssuedInvoices);
            setListInvoices(onlyIssuedInvoices);
        } catch (error) {
            toast.error(
                `Erro ao tentar ler invoices, contacte o administrador do sistema: ${error}`,
            );
        } finally {
            setIsLoading(false);
        }
    }, [invoiceContext]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchSelectData = useCallback(
        (filters: SelectState, showToast = true) => {
            try {
                setIsLoading(true);

                const startDate = parseYMD(filters.date_start);
                const endDate = parseYMD(filters.date_end);
                const sDate = startDate ? onlyDate(startDate) : null;
                const eDate = endDate ? onlyDate(endDate) : null;

                const sellerTerms = (filters.seller || "")
                    .split(",")
                    .map((item) => normalizeStr(item))
                    .filter(Boolean);
                const buyerTerms = (filters.buyer || "")
                    .split(",")
                    .map((item) => normalizeStr(item))
                    .filter(Boolean);
                const rpsTerm = normalizeStr(filters.product);
                const nfsTerm = normalizeStr(filters.name_product);

                const filtered = allInvoices.filter((invoice) => {
                    const invoiceDate = getInvoiceDate(invoice);
                    if (!invoiceDate) return false;

                    const normalizedDate = formatDateBR(invoiceDate);
                    const [day, month, year] = normalizedDate
                        .split("/")
                        .map(Number);

                    if (!day || !month || !year) return false;

                    const currentDate = onlyDate(
                        new Date(year, month - 1, day),
                    );
                    const matchStart = sDate ? currentDate >= sDate : true;
                    const matchEnd = eDate ? currentDate <= eDate : true;

                    const name = normalizeStr(invoice.name);
                    const serviceCode = normalizeStr(invoice.service_code);
                    const rpsNumber = normalizeStr(invoice.rps_number);
                    const nfsNumber = normalizeStr(invoice.nfs_number);

                    const matchSeller =
                        sellerTerms.length === 0 ||
                        sellerTerms.some((term) => name.includes(term));
                    const matchBuyer =
                        buyerTerms.length === 0 ||
                        buyerTerms.some((term) => serviceCode.includes(term));
                    const matchRps = !rpsTerm || rpsNumber.includes(rpsTerm);
                    const matchNfs = !nfsTerm || nfsNumber.includes(nfsTerm);

                    return (
                        matchStart &&
                        matchEnd &&
                        matchSeller &&
                        matchBuyer &&
                        matchRps &&
                        matchNfs
                    );
                });

                setSelectData(filters);
                setListInvoices(filtered);

                if (showToast) {
                    if (filtered.length > 0) {
                        toast.success(
                            `${filtered.length} NFSe(s) encontrada(s)`,
                            { toastId: "list-invoices-filter" },
                        );
                    } else {
                        toast.info("Nenhuma NFSe encontrada", {
                            toastId: "list-invoices-filter",
                        });
                    }
                }

                setSelectionModal(false);
            } catch (error) {
                if (showToast) {
                    toast.error(`Erro ao aplicar filtros: ${error}`);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [
            allInvoices,
            formatDateBR,
            getInvoiceDate,
            normalizeStr,
            onlyDate,
            parseYMD,
        ],
    );

    const handleClearFilterModal = () => {
        const initialFilters = getInitialSelectData();
        setSelectData(initialFilters);
        fetchSelectData(initialFilters, false);
        setSelectionModal(false);
    };

    const isInitialFilter = useMemo(() => {
        const initial = getInitialSelectData();
        const isDefaultRange =
            (selectData.date_start ?? "") === (initial.date_start ?? "") &&
            (selectData.date_end ?? "") === (initial.date_end ?? "");

        const isClearedRange =
            (selectData.date_start ?? "") === "" &&
            (selectData.date_end ?? "") === "";

        const isSellerCleared = (selectData.seller ?? "").trim() === "";
        const isBuyerCleared = (selectData.buyer ?? "").trim() === "";
        const isProductCleared = (selectData.product ?? "").trim() === "";
        const isNfsCleared = (selectData.name_product ?? "").trim() === "";

        return (
            (isDefaultRange &&
                isSellerCleared &&
                isBuyerCleared &&
                isProductCleared &&
                isNfsCleared) ||
            (isClearedRange &&
                isSellerCleared &&
                isBuyerCleared &&
                isProductCleared &&
                isNfsCleared)
        );
    }, [selectData]);

    useEffect(() => {
        if (allInvoices.length > 0 && isInitialFilter) {
            fetchSelectData(selectData, false);
        }
    }, [allInvoices, fetchSelectData, isInitialFilter, selectData]);

    const { filteredData } = useTableSearch({
        data: listInvoices,
        searchTerm,
        searchableFields: [
            "rps_number",
            "nfs_number",
            "name",
            "cpf_cnpj",
            "city",
            "state",
        ],
    });

    const nameColumns: IColumn[] = useMemo(
        () => [
            {
                field: "rps_number",
                header: "Nº RPS",
                width: "130px",
                sortable: false,
            },
            {
                field: "rps_emission_date",
                header: "Dt. RPS",
                width: "120px",
                sortable: false,
            },
            {
                field: "nfs_number",
                header: "NFS",
                width: "120px",
                sortable: true,
                renderCell: (row) => (
                    <Button
                        variant="text"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleOpenInvoiceDetails(row as IListInvoices);
                        }}
                        sx={{
                            minWidth: 0,
                            padding: 0,
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#0f5ea8",
                            textDecoration: "underline",
                            justifyContent: "flex-start",
                            "&:hover": {
                                backgroundColor: "transparent",
                                textDecoration: "underline",
                            },
                        }}
                    >
                        {String((row as IListInvoices).nfs_number ?? "")}
                    </Button>
                ),
            },
            {
                field: "nfs_emission_date",
                header: "Dt. NFS",
                width: "120px",
                sortable: false,
            },
            {
                field: "status",
                header: "Status",
                width: "120px",
                sortable: false,
            },
            {
                field: "name",
                header: "Tomador",
                width: "220px",
                sortable: false,
            },
            {
                field: "cpf_cnpj",
                header: "CPF/CNPJ",
                width: "150px",
                sortable: false,
            },
            {
                field: "exportacao",
                header: "Exportação",
                width: "130px",
                sortable: false,
            },
        ],
        [handleOpenInvoiceDetails],
    );

    const displayedData = useMemo(
        () => sortTableData([...filteredData], orderBy, order),
        [filteredData, orderBy, order],
    );

    const invoiceDetailTabs = useMemo(() => {
        if (!selectedInvoice) return [];

        return [
            ...INVOICE_DETAIL_GROUPS.map((group) => ({
                key: group.key,
                label: group.label,
                content: (
                    <DetailTable
                        title={group.label}
                        fields={group.fields}
                        invoice={selectedInvoice}
                    />
                ),
            })),
        ].filter(Boolean) as Array<{
            key: string;
            label: string;
            content: React.ReactNode;
        }>;
    }, [selectedInvoice]);

    return (
        <SContainer>
            <STitle>Consulta NFSe</STitle>

            <SContainerSearchAndButton>
                <CustomSearch
                    width="400px"
                    placeholder="Digite Nº RPS,Nº NFS,Tomador ou CPF/CNPJ"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Tooltip title="Filtrar invoices">
                    <IconButton
                        aria-label="filter"
                        onClick={handleSelectionModal}
                        sx={{ color: "#E7B10A" }}
                    >
                        <TbFilter />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Limpar filtros">
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
                </Tooltip>

                <ReportFilter
                    titleText="Filtros - Consulta NFSe"
                    open={isSelectionModal}
                    initialFilters={selectData}
                    onClose={handleCloseModal}
                    onChange={(filters) => setSelectData(filters)}
                    onConfirm={fetchSelectData}
                    visibleFields={["date_start", "date_end"]}
                    fieldLabels={{
                        date_start: "Data Emissão inicial",
                        date_end: "Data Emissão final",
                    }}
                />

                <CustomTooltipLabel
                    title={
                        useInfiniteScroll
                            ? "Voltar para paginação"
                            : "Ativar scroll infinito"
                    }
                >
                    <IconButton
                        onClick={() => setUseInfiniteScroll((prev) => !prev)}
                        sx={{ color: "#E7B10A" }}
                    >
                        {!useInfiniteScroll ? <TbInfinity /> : <PiScroll />}
                    </IconButton>
                </CustomTooltipLabel>
            </SContainerSearchAndButton>

            <CustomTable
                isLoading={isLoading}
                data={displayedData}
                columns={nameColumns}
                hasInfiniteScroll={useInfiniteScroll}
                hasPagination={!useInfiniteScroll}
                dateFields={DATE_FIELDS}
                currencyFields={CURRENCY_FIELDS}
                maxChars={20}
                page={page}
                setPage={setPage}
                order={order}
                orderBy={orderBy}
                setOrder={setOrder}
                setOrderBy={setOrderBy}
            />

            <Dialog
                open={isInvoiceDetailsOpen}
                onClose={handleCloseInvoiceDetails}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                        }}
                    >
                        <Typography variant="h6" component="span">
                            Detalhes da NFSe {selectedInvoice?.nfs_number ?? ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedInvoice?.name ?? "-"}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Tabs
                        value={invoiceDetailsTab}
                        onChange={(_, value) => setInvoiceDetailsTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            mb: 2,
                            borderBottom: "1px solid #E1E1E6",
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#E7B10A",
                            },
                        }}
                    >
                        {invoiceDetailTabs.map((tab, index) => (
                            <Tab
                                key={tab.key}
                                label={tab.label}
                                value={index}
                                sx={{
                                    minWidth: 140,
                                    width: 140,
                                    flexShrink: 0,
                                    color: "#323238",
                                    "&.Mui-selected": {
                                        color: "#E7B10A",
                                        fontWeight: 700,
                                    },
                                }}
                            />
                        ))}
                    </Tabs>

                    {invoiceDetailTabs.map((tab, index) => (
                        <TabPanel
                            key={tab.key}
                            value={invoiceDetailsTab}
                            index={index}
                        >
                            {tab.content}
                        </TabPanel>
                    ))}
                </DialogContent>
                <DialogActions>
                    <CustomButton
                        $variant="primary"
                        width="120px"
                        onClick={handleCloseInvoiceDetails}
                    >
                        Fechar
                    </CustomButton>
                </DialogActions>
            </Dialog>
        </SContainer>
    );
}
