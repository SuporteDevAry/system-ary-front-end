import { useCallback, useEffect, useMemo, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { CustomSearch } from "../../components/CustomSearch";
import CustomTable from "../../components/CustomTable";
import { ModalDelete } from "../../components/ModalDelete";
import { ModalTablesProducts } from "./components/ModalTablesProducts";
import {
  SButtonContainer,
  SContainer,
  SContainerSearchAndButton,
  STitle,
} from "./styles";
import { ITableProductsData } from "../../contexts/TablesProducts/types";
import { toast } from "react-toastify";
import { TableProductContext } from "../../contexts/TablesProducts";
import useTableSearch from "../../hooks/useTableSearch";
import { IColumn } from "../../components/CustomTable/types";

export function TableProducts() {
  const { listTableProducts, deleteTableProduct } = TableProductContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listTables, setListTable] = useState<ITableProductsData[]>([]);
  const [isTableProductModalOpen, setTableProductModalOpen] =
    useState<boolean>(false);
  const [tableProductToEdit, setTableProductToEdit] =
    useState<ITableProductsData | null>(null);
  const [modalContent, setModalContent] = useState<string>("");
  const [isDeleteTableProductModal, setDeleteTableProductModal] =
    useState<boolean>(false);
  const [tableProductForDelete, setTableProductForDelete] =
    useState<ITableProductsData>();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("created_at");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await listTableProducts();

      setListTable(response.data);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler mesas, contacte o administrador do sistema: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [listTableProducts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { filteredData, handleSearch } = useTableSearch({
    data: listTables,
    searchTerm,
    searchableFields: ["product_types", "name"],
  });

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "name",
        header: "Nome",
        width: "160px",
        sortable: true,
      },
      {
        field: "product_types",
        header: "Grupo de Produtos",
        width: "50px",
        sortable: true,
      },
    ],
    []
  );

  const handleCreateNewTable = async () => {
    setTableProductToEdit(null);
    setTableProductModalOpen(true);
  };

  const handleCloseTableProductModal = () => {
    setTableProductModalOpen(false);
    setTableProductToEdit(null);
    fetchData();
  };

  const handleUpdateTablesProductsModal = (
    tableProduct: ITableProductsData
  ) => {
    setTableProductToEdit(tableProduct);
    setTableProductModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTableProductModal(false);
  };

  const handleOpenDeleteTablesProductsModal = (
    tableProduct: ITableProductsData
  ) => {
    setModalContent(
      `Tem certeza que deseja deletar a mesa: ${tableProduct?.name} ?`
    );

    setTableProductForDelete(tableProduct);

    setDeleteTableProductModal(true);
  };

  const handleDeleteTableProduct = async () => {
    if (!tableProductForDelete || !tableProductForDelete.id) {
      toast.error("Id do Produto não encontrado.");
      return;
    }

    try {
      await deleteTableProduct(tableProductForDelete?.id);
      toast.success(
        <div>
          Mesa: <strong>{tableProductForDelete.name}</strong> deletado com
          sucesso!
        </div>
      );
      fetchData();
    } catch (error) {
      toast.error(
        `Erro ao tentar deletar mesa: ${tableProductForDelete.name}, contacte o administrador do sistema ${error}`
      );
    } finally {
      setDeleteTableProductModal(false);
    }
  };

  const renderActionButtons = useCallback(
    (row: any) => (
      <SButtonContainer>
        <CustomButton
          $variant="primary"
          width="60px"
          onClick={() => handleUpdateTablesProductsModal(row)}
        >
          Editar
        </CustomButton>
        <CustomButton
          $variant="danger"
          width="60px"
          onClick={() => handleOpenDeleteTablesProductsModal(row)}
        >
          Deletar
        </CustomButton>
      </SButtonContainer>
    ),
    [handleUpdateTablesProductsModal, handleOpenDeleteTablesProductsModal]
  );
  return (
    <>
      <SContainer>
        <STitle>Cadastro de Mesas</STitle>

        <SContainerSearchAndButton>
          <CustomSearch
            width="400px"
            placeholder="Pesquise mesa ou pela sigla do produto."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CustomButton
            $variant={"success"}
            width="180px"
            onClick={handleCreateNewTable}
          >
            Criar Nova Mesa
          </CustomButton>
        </SContainerSearchAndButton>
        <CustomTable
          isLoading={isLoading}
          data={filteredData}
          columns={nameColumns}
          hasPagination
          dateFields={["created_at"]}
          actionButtons={renderActionButtons}
          maxChars={15}
          page={page}
          setPage={setPage}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
        />
      </SContainer>
      <ModalTablesProducts
        open={isTableProductModalOpen}
        onClose={handleCloseTableProductModal}
        tableProductToEdit={tableProductToEdit}
      />
      <ModalDelete
        open={isDeleteTableProductModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteTableProduct}
        content={modalContent}
      />
    </>
  );
}
