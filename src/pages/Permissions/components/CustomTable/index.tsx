import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
} from "@mui/material";
import { ICustomTableProps } from "./types";
import { SColumnHeader, SCheckbox } from "./styles";
// import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const CustomTable: React.FC<ICustomTableProps> = ({
  data,
  columns,
  //hasPagination = false,
  hasCheckbox = false,
  collapsible = false,
  onRowClick,
}) => {
  const [openRows, setOpenRows] = useState<number[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {hasCheckbox && <TableCell />}
            {columns.map((column) => (
              <TableCell key={column.field}>
                <SColumnHeader>{column.header}</SColumnHeader>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
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
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
              </TableRow>
              {collapsible && (
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={3}
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;
