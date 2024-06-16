import { useEffect, useState } from "react";
import { Modal } from "../../../../../../components/Modal";
import { ISelectedCustomer, ModalClientesProps } from "./types";
import CustomTable from "../../../../../../components/CustomTable";
import { IColumn } from "../../../../../../components/CustomTable/types";
import { CustomSearch } from "../../../../../../components/CustomSearch";
import CustomButton from "../../../../../../components/CustomButton";

import { SContainerSearchAndButton } from "./styles";
interface TableData {
  [key: string]: any;
}

export function ModalClientes({
  onClose,
  onConfirm,
  open,
  data,
  loading,
  selectionType,
}: ModalClientesProps) {
  const [selectedCustomer, setSelectedCustomer] =
    useState<ISelectedCustomer | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dataTable, setDataTable] = useState<TableData[]>([]);

  const handleConfirm = () => {
    if (selectedCustomer) {
      console.log("Salvo no Modal", selectedCustomer);
      onConfirm(selectedCustomer);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (data) {
      setDataTable(data);
    }
  }, [data]);

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setDataTable(data);
    } else {
      const filteredData = data.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setDataTable(filteredData);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const nameColumns: IColumn[] = [
    { field: "nome", header: "Nome" },
    { field: "cnpj", header: "CNPJ/CPF" },
    { field: "cidade", header: "Cidade" },
    { field: "uf", header: "UF" },
  ];

  return (
    <>
      <Modal
        titleText={`Selecione um ${
          selectionType === "buyer" ? "Comprador" : "Vendedor"
        }!`}
        open={open}
        confirmButton="Confirmar"
        cancelButton="Cancelar"
        variantCancel={"primary"}
        variantConfirm={"success"}
        onClose={handleClose}
        onHandleCreate={handleConfirm}
        maxWidth="md"
        fullWidth
      >
        <SContainerSearchAndButton>
          <CustomSearch
            width="400px"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CustomButton variant="primary" width="70px" onClick={handleSearch}>
            Search
          </CustomButton>
        </SContainerSearchAndButton>
        <CustomTable
          isLoading={loading}
          data={dataTable}
          columns={nameColumns}
          hasCheckbox
          hasPagination
          onRowClick={(rowData) =>
            setSelectedCustomer({ name: rowData.nome, type: selectionType })
          }
        />
      </Modal>
    </>
  );
}
