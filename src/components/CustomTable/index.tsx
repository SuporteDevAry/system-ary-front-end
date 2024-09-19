import React, { useState } from "react";
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
import { SColumnHeader, SCheckbox, STableHead } from "./styles";
import { convertToCustomFormat } from "../../helpers/dateFormat";
import { insertMaskInCpf } from "../../helpers/front-end/insertMaskInCpf";
import { insertMaskInCnpj } from "../../helpers/front-end/insertMaskInCnpj";
import Loading from "../Loading";
import { insertMaskInTelefone } from "../../helpers/front-end/insertMaskInFone";
import { insertMaskInCelular } from "../../helpers/front-end/insertMaskInCelular";
import { getNestedValue } from "../../helpers/getNestedValue";
import { CustomTruncateText } from "../CustomTruncateText";
// import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

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
  renderChildren,
  onRowClick,
  actionButtons,
}) => {
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

    const stringValue = value?.toString() ?? "-";
    return value ? (
      <CustomTruncateText text={stringValue} maxChars={maxChars} />
    ) : (
      "-"
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <STableHead>
          <TableRow>
            {hasCheckbox && <TableCell />}
            {columns.map((column) => (
              <TableCell key={column.field}>
                <SColumnHeader>{column.header}</SColumnHeader>
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
            data
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
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
                          checked={selectedRowId === row.id}
                          onChange={() => handleRowClick(row.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {formatCellValue(row, column)}
                      </TableCell>
                    ))}

                    {actionButtons && (
                      <TableCell>{actionButtons(row)}</TableCell>
                    )}
                  </TableRow>
                  {collapsible && (
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
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
