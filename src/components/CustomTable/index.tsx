import React, { useState, useMemo, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Collapse,
    Box,
    TablePagination,
} from "@mui/material";
import { ICustomTableProps } from "./types";
import {
    SColumnHeader,
    SCheckbox,
    STableHead,
    CustomTableSortLabel,
} from "./styles";
import { convertToCustomFormat } from "../../helpers/dateFormat";
import { insertMaskInCpf } from "../../helpers/front-end/insertMaskInCpf";
import { insertMaskInCnpj } from "../../helpers/front-end/insertMaskInCnpj";
import Loading from "../Loading";
import { insertMaskInTelefone } from "../../helpers/front-end/insertMaskInFone";
import { insertMaskInCelular } from "../../helpers/front-end/insertMaskInCelular";
import {
    compareValues,
    extractNumberFromContract,
    getNestedValue,
} from "./helpers";
import { CustomTruncateText } from "../CustomTruncateText";
import useTableSearch from "../../hooks/useTableSearch";
import { CustomStatusIndicator } from "../CustomStatusIndicator";

const locale = "pt-BR";

const CustomTable: React.FC<ICustomTableProps> = ({
    data,
    columns,
    isLoading,
    hasPagination = false,
    hasCheckbox = false,
    collapsible = false,
    dateFields,
    maxChars = 18,
    page = 0,
    setPage,
    renderChildren,
    onRowClick,
    actionButtons,
    order,
    orderBy,
    setOrder,
    setOrderBy,
    searchTerm = "",
    searchableFields = columns.map((col) => col.field),
}) => {
    const [openRows, setOpenRows] = useState<number[]>([]);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { filteredData, handleSearch } = useTableSearch({
        data,
        searchTerm,
        searchableFields,
    });

    const totalPages = useMemo(
        () => Math.ceil(filteredData.length / rowsPerPage),
        [filteredData.length, rowsPerPage]
    );

    useEffect(() => {
        // Aciona a busca sempre que o termo mudar
        handleSearch();
    }, [searchTerm, handleSearch]);

    useEffect(() => {
        // Se a página atual for maior que o número de páginas após o filtro, ajuste para a última página disponível
        if (page >= totalPages && totalPages > 0) {
            setPage?.(totalPages - 1); // Ajusta a página para a última página
        }
    }, [filteredData.length, page, totalPages, setPage]);

    const handleRequestSort = (property: string) => {
        const column = columns.find((col) => col.field === property);
        if (!column?.sortable) return;

        const isAscending = orderBy === property && order === "asc";
        setOrder(isAscending ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleRowClick = (id: number) => {
        if (selectedRowId === id) {
            setSelectedRowId(null);
            setOpenRows(openRows.filter((rowId) => rowId !== id));
        } else {
            setSelectedRowId(id);
            if (collapsible) {
                setOpenRows((prevOpenRows) => [...prevOpenRows, id]);
            }
        }
    };

    const handleChangePage = (
        _event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        // Verifica se a nova página está dentro do limite das páginas disponíveis
        if (newPage >= 0 && newPage < totalPages) {
            if (setPage) {
                setPage(newPage);
            }
        }
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));

        if (setPage) {
            setPage(0); // Volta para a primeira página ao alterar a quantidade de itens por página
        }
    };

    var typeCommission = "";
    const formatCellValue = (
        row: any,
        column: { field: string }
    ): React.ReactNode => {
        const value = getNestedValue(row, column.field);

        if (column.field === "cnpj_cpf") {
            return row.kind === "F"
                ? insertMaskInCpf(value)
                : insertMaskInCnpj(value);
        }
        if (dateFields?.includes(column.field)) {
            return convertToCustomFormat(value, locale);
        }

        if (column.field === "telephone") return insertMaskInTelefone(value);

        if (column.field === "cellphone") return insertMaskInCelular(value);

        if (column.field === "quantity") {
            let auxQtd = Math.round(value) || 0;
            return auxQtd.toLocaleString("pt-BR", {
                minimumFractionDigits: 3,
            });
        }

        // Carlos - usado no relatorio de Faturamento Grãos (Invoicing)
        if (column.field === "TOTALCALC" || column.field.startsWith("S_CN")) {
            let auxQtd = value || 0;
            return auxQtd.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
            });
        }

        // Carlos - usado no relatorio de Grãos Maiores (Grains Bigger)
        if (column.field === "TOTAL") {
            let auxQtd = value || 0;
            return auxQtd.toLocaleString("pt-BR", {
                minimumFractionDigits: 3,
            });
        }
        const validProducts = ["S", "CN", "O", "F", "OC", "OA", "SB", "EP"];
        if (validProducts.includes(column.field)) {
            let auxQtd = value || 0;
            return auxQtd.toLocaleString("pt-BR", {
                minimumFractionDigits: 3,
            });
        }
        if (
            column.field === "price" ||
            column.field === "total_contract_value"
        ) {
            let auxQtd = parseFloat(value.replace(",", ".")) || 0;
            return auxQtd.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
            });
        }

        if (column.field === "type_commission") {
            return (typeCommission = value);
        }

        if (column.field === "commission") {
            let auxQtd = value; //parseFloat(value.replace(",", ".")) || 0;

            return typeCommission === "P"
                ? auxQtd.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                  })
                : auxQtd.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 2,
                  });
        }

        if (column.field === "status.status_current") {
            const statusCurrent = row?.status?.status_current;

            return (
                <CustomStatusIndicator
                    status={statusCurrent}
                    text={statusCurrent}
                />
            );
        }

        const stringValue = value?.toString() ?? "-";
        return value ? (
            <CustomTruncateText text={stringValue} maxChars={maxChars} />
        ) : (
            "-"
        );
    };

    // Onde fazemos o sort nos dados da tabela
    const sortedData = useMemo(() => {
        return filteredData.slice().sort((a, b) => {
            const aValue = getNestedValue(a, orderBy);
            const bValue = getNestedValue(b, orderBy);

            if (orderBy === "number_contract") {
                const aContractNumber = extractNumberFromContract(aValue);
                const bContractNumber = extractNumberFromContract(bValue);
                return compareValues(aContractNumber, bContractNumber, order);
            }

            return compareValues(aValue, bValue, order);
        });
    }, [filteredData, order, orderBy]);

    // Onde fazemos a paginação nos dados da tabela
    const paginatedData = useMemo(() => {
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, page, rowsPerPage]);

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <STableHead>
                    <TableRow>
                        {hasCheckbox && <TableCell />}
                        {columns.map((column) => (
                            <TableCell
                                key={column.field}
                                style={{
                                    width: column.width || "auto",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {column.sortable ? (
                                    <CustomTableSortLabel
                                        active={orderBy === column.field}
                                        direction={
                                            orderBy === column.field
                                                ? order
                                                : "asc"
                                        }
                                        onClick={() =>
                                            handleRequestSort(column.field)
                                        }
                                    >
                                        <SColumnHeader>
                                            {column.header}
                                        </SColumnHeader>
                                    </CustomTableSortLabel>
                                ) : (
                                    <SColumnHeader>
                                        {column.header}
                                    </SColumnHeader>
                                )}
                            </TableCell>
                        ))}
                        {actionButtons && <TableCell />}
                    </TableRow>
                </STableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell
                                colSpan={
                                    columns.length +
                                    (hasCheckbox ? 1 : 0) +
                                    (actionButtons ? 1 : 0)
                                }
                            >
                                <Loading />
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedData.map((row) => (
                            <React.Fragment key={row.id}>
                                <TableRow
                                    onClick={() => {
                                        if (onRowClick && !collapsible) {
                                            onRowClick(row);
                                        }
                                        if (collapsible) {
                                            handleRowClick(row.id);
                                        }
                                    }}
                                >
                                    {hasCheckbox && (
                                        <TableCell>
                                            <SCheckbox
                                                checked={
                                                    selectedRowId === row.id
                                                }
                                                onChange={() =>
                                                    handleRowClick(row.id)
                                                }
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.field}
                                            style={{
                                                width: column.width || "auto",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {formatCellValue(row, column)}
                                        </TableCell>
                                    ))}
                                    {actionButtons && (
                                        <TableCell>
                                            {actionButtons(row)}
                                        </TableCell>
                                    )}
                                </TableRow>
                                {collapsible && (
                                    <TableRow>
                                        <TableCell
                                            style={{
                                                paddingBottom: 0,
                                                paddingTop: 0,
                                            }}
                                            colSpan={
                                                columns.length +
                                                (hasCheckbox ? 1 : 0) +
                                                (actionButtons ? 1 : 0)
                                            }
                                        >
                                            <Collapse
                                                in={openRows.includes(row.id)}
                                                timeout="auto"
                                                unmountOnExit
                                            >
                                                <Box margin={1}>
                                                    {renderChildren
                                                        ? renderChildren(row)
                                                        : null}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </TableBody>
            </Table>
            {hasPagination && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Linhas por página:"
                />
            )}
        </TableContainer>
    );
};

export default CustomTable;
