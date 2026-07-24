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
  Tooltip,
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
  getNestedValue,
  sortTableData,
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
  hasInfiniteScroll = false,
  hasCheckbox = false,
  multiSelect = false,
  collapsible = false,
  dateFields,
  currencyFields,
  maxChars = 18,
  page = 0,
  setPage,
  renderChildren,
  onRowClick,
  onSelectionChange,
  selectedRowIds: controlledSelectedRowIds,
  actionButtons,
  order,
  orderBy,
  setOrder,
  setOrderBy,
  searchTerm = "",
  searchableFields,
}) => {
  const [openRows, setOpenRows] = useState<string[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleCount, setVisibleCount] = useState(30); // primeiros itens
  const resolvedSearchableFields = useMemo(
    () => searchableFields ?? columns.map((col) => col.field),
    [searchableFields, columns],
  );

  const { filteredData } = useTableSearch({
    data,
    searchTerm,
    searchableFields: resolvedSearchableFields,
  });

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / rowsPerPage),
    [filteredData.length, rowsPerPage],
  );

  useEffect(() => {
    // Se a página atual for maior que o número de páginas após o filtro, ajuste para a última página disponível
    if (page >= totalPages && totalPages > 0) {
      setPage?.(totalPages - 1); // Ajusta a página para a última página
    }
  }, [filteredData.length, page, totalPages, setPage]);

  useEffect(() => {
    if (multiSelect && hasCheckbox) {
      setSelectedRowIds(controlledSelectedRowIds ?? []);
    }
  }, [controlledSelectedRowIds, hasCheckbox, multiSelect]);

  const handleRequestSort = (property: string) => {
    const column = columns.find((col) => col.field === property);
    if (!column?.sortable) return;

    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRowClick = (id: number | string) => {
    const rowId = String(id);

    if (multiSelect && hasCheckbox) {
      // Modo de seleção múltipla
      const isSelected = selectedRowIds.includes(rowId);
      let newSelectedIds: string[];

      if (isSelected) {
        newSelectedIds = selectedRowIds.filter((currentId) => currentId !== rowId);
      } else {
        newSelectedIds = [...selectedRowIds, rowId];
      }

      setSelectedRowIds(newSelectedIds);

      // Notifica sobre a mudança de seleção
      if (onSelectionChange) {
        const selectedRows = data.filter((row) =>
          newSelectedIds.includes(String(row.id)),
        );
        onSelectionChange(selectedRows);
      }
    } else {
      // Modo de seleção única
        if (selectedRowId === rowId) {
          setSelectedRowId(null);
          setOpenRows(
            openRows.filter((currentRowId) => currentRowId !== rowId),
          );
          if (onSelectionChange) {
            onSelectionChange([]);
          }
        } else {
        setSelectedRowId(rowId);
        if (collapsible) {
          setOpenRows((prevOpenRows) => [...prevOpenRows, rowId]);
        }
        if (onSelectionChange) {
          const selectedRow = data.find((row) => String(row.id) === rowId);
          onSelectionChange(selectedRow ? [selectedRow] : []);
        }
      }
    }
  };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    // Verifica se a nova página está dentro do limite das páginas disponíveis
    if (newPage >= 0 && newPage < totalPages) {
      if (setPage) {
        setPage(newPage);
      }
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));

    if (setPage) {
      setPage(0); // Volta para a primeira página ao alterar a quantidade de itens por página
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    const isBottom = scrollTop + clientHeight >= scrollHeight - 30;

    if (isBottom) {
      setVisibleCount((prev) => prev + 30);
    }
  };

  let typeCommission = "";
  const formatCellValue = (
    row: any,
    column: { field: string },
  ): React.ReactNode => {
    const value = getNestedValue(row, column.field);

    if (column.field === "cnpj_cpf") {
      return row.kind === "F"
        ? insertMaskInCpf(value)
        : insertMaskInCnpj(value);
    }
    if (dateFields?.includes(column.field)) {
      if (!value) return "-";
      const strValue = String(value).trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(strValue)) return strValue;
      return convertToCustomFormat(strValue, locale);
    }

    if (currencyFields?.includes(column.field)) {
      const num = Number(value) || 0;
      return num.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (column.field === "telephone") return insertMaskInTelefone(value);

    if (column.field === "cellphone") return insertMaskInCelular(value);

    if (column.field === "quantity") {
      let auxQtd =
        typeof value === "number"
          ? value
          : Number(String(value ?? "0").replace(".", "").replace(",", ".")) ||
            0;
      return auxQtd.toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
      });
    }

    // if (column.field === "final_quantity") {
    //   let auxQtd = Math.round(value) || 0;
    //   return auxQtd.toLocaleString("pt-BR", {
    //     minimumFractionDigits: 3,
    //   });
    // }

    // Carlos - usado no relatorio de Faturamento Grãos (Invoicing)
    if (
      column.field === "TOTALCALC" ||
      column.field.startsWith("S_CN") ||
      /^[A-Z0-9]+_\d+$/.test(column.field)
    ) {
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
    if (column.field === "price" || column.field === "total_contract_value") {
      let auxQtd = parseFloat(String(value ?? "0").replace(",", ".")) || 0;
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
        <CustomStatusIndicator status={statusCurrent} text={statusCurrent} />
      );
    }

    // Display-only: render `status` field in uppercase without mutating data
    if (column.field === "status") {
      const statusVal = value ?? "-";
      const statusText = String(statusVal).toUpperCase();
      return <CustomTruncateText text={statusText} maxChars={maxChars} />;
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
    return sortTableData(filteredData, orderBy, order);
  }, [filteredData, order, orderBy]);

  // TODO []: SERÁ REMOVIDO POR SUPORTE
  // Onde fazemos a paginação nos dados da tabela
  // const paginatedData = useMemo(() => {
  //   const startIndex = page * rowsPerPage;
  //   const endIndex = startIndex + rowsPerPage;
  //   return sortedData.slice(startIndex, endIndex);
  // }, [sortedData, page, rowsPerPage]);

  const tableData = useMemo(() => {
    if (hasPagination) {
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return sortedData.slice(startIndex, endIndex);
    }

    if (hasInfiniteScroll) {
      return sortedData.slice(0, visibleCount);
    }

    return sortedData;
  }, [
    sortedData,
    page,
    rowsPerPage,
    visibleCount,
    hasPagination,
    hasInfiniteScroll,
  ]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: hasInfiniteScroll ? 700 : "auto",
        overflowY: hasInfiniteScroll ? "auto" : "visible",
      }}
      onScroll={hasInfiniteScroll ? handleScroll : undefined}
    >
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
                    direction={orderBy === column.field ? order : "asc"}
                    onClick={() => handleRequestSort(column.field)}
                  >
                    {column.headerTooltip ? (
                      <Tooltip title={column.headerTooltip} arrow>
                        <SColumnHeader>{column.header}</SColumnHeader>
                      </Tooltip>
                    ) : (
                      <SColumnHeader>{column.header}</SColumnHeader>
                    )}
                  </CustomTableSortLabel>
                ) : column.headerTooltip ? (
                  <Tooltip title={column.headerTooltip} arrow>
                    <SColumnHeader>{column.header}</SColumnHeader>
                  </Tooltip>
                ) : (
                  <SColumnHeader>{column.header}</SColumnHeader>
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
            tableData.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow
                  sx={
                    row?.is_grand_total
                      ? {
                          "& td": {
                            backgroundColor: "#c6e0b4",
                            fontWeight: 700,
                          },
                        }
                      : row?.is_sigla_total
                      ? {
                          "& td": {
                            backgroundColor: "#e2f0d9",
                            fontWeight: 700,
                          },
                        }
                      : undefined
                  }
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
                          multiSelect
                            ? selectedRowIds.includes(String(row.id))
                            : selectedRowId === String(row.id)
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRowClick(row.id);
                          if (!multiSelect && onRowClick) {
                            onRowClick(row);
                          }
                        }}
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
                  {actionButtons && <TableCell>{actionButtons(row)}</TableCell>}
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
                        in={openRows.includes(String(row.id))}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box margin={1}>
                          {renderChildren ? renderChildren(row) : null}
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
      {hasPagination && !hasInfiniteScroll && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          showFirstButton
          showLastButton
        />
      )}
    </TableContainer>
  );
};

export default CustomTable;
