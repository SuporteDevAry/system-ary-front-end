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
// import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const CustomTable: React.FC<ICustomTableProps> = ({
  data,
  columns,
  hasPagination = false,
  hasCheckbox = false,
  collapsible = false,
  onRowClick,
  isLoading,
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

  // const handleChangePage = (_event: unknown, newPage: number) => {
  //   setPage(newPage);
  // };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    //setRowsPerPage(+event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <STableHead>
          <TableRow>
            {hasCheckbox && <TableCell />}
            {columns.map((column) => (
              <TableCell key={column.field}>
                <SColumnHeader>{column.header}</SColumnHeader>
              </TableCell>
            ))}
          </TableRow>
        </STableHead>
        <TableBody>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            data
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    onClick={() => {
                      if (onRowClick) {
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
                        {row[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                  {collapsible && (
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={columns.length + (hasCheckbox ? 1 : 0)}
                      >
                        <Collapse
                          in={openRows.includes(row.id)}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box margin={1}>
                            <Table size="small" aria-label="purchases">
                              <TableBody>
                                <TableRow>
                                  <TableCell component="th" scope="row">
                                    Extra Info
                                  </TableCell>
                                  <TableCell>Teste</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
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
        // <Box display="flex" justifyContent="flex-start">
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        //</Box>
      )}
    </TableContainer>
  );
};

export default CustomTable;
