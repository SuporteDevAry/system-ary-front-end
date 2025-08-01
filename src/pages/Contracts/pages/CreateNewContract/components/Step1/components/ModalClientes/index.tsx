import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../../../../../../../../components/Modal";
import { ISelectedCustomer, ModalClientesProps } from "./types";
import CustomTable from "../../../../../../../../components/CustomTable";
import { IColumn } from "../../../../../../../../components/CustomTable/types";
import { CustomSearch } from "../../../../../../../../components/CustomSearch";
import CustomButton from "../../../../../../../../components/CustomButton";

import { SContainerSearchAndButton } from "./styles";
import useTableSearch from "../../../../../../../../hooks/useTableSearch";

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
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");

  const [page, setPage] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (selectedCustomer) {
      onConfirm({
        ...selectedCustomer,
        type: selectionType,
      });
      setSearchTerm("");
      onClose();
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  useEffect(() => {
    if (open) {
      handleSearch();

      const timeout = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [open]);

  const { filteredData, handleSearch } = useTableSearch({
    data: data,
    searchTerm,
  });

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const nameColumns: IColumn[] = useMemo(
    () => [
      { field: "name", header: "Nome", sortable: true },
      { field: "nickname", header: "Fantasia", sortable: true },
      { field: "cnpj_cpf", header: "CNPJ/CPF", sortable: true },
      { field: "city", header: "Cidade" },
      { field: "state", header: "UF" },
    ],
    []
  );

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
        onHandleConfirm={handleConfirm}
        maxWidth="md"
        fullWidth
      >
        <SContainerSearchAndButton>
          <CustomSearch
            width="400px"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputRef={searchInputRef}
          />
          <CustomButton $variant="primary" width="70px" onClick={handleSearch}>
            Search
          </CustomButton>
        </SContainerSearchAndButton>
        <CustomTable
          isLoading={loading}
          data={filteredData}
          columns={nameColumns}
          hasCheckbox
          hasPagination
          page={page}
          setPage={setPage}
          onRowClick={(rowData) =>
            setSelectedCustomer({
              ...rowData,
              name: rowData.name,
              type: selectionType,
            })
          }
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
        />
      </Modal>
    </>
  );
}
