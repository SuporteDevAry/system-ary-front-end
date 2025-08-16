import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomSearch } from "../../components/CustomSearch";
import {
  SButtonContainer,
  SContainer,
  SContainerSearchAndButton,
  STitle,
} from "./styles";
import CustomTable from "../../components/CustomTable";
import useTableSearch from "../../hooks/useTableSearch";
import { IColumn } from "../../components/CustomTable/types";
import { ProductContext } from "../../contexts/Products";
import { IProductsData } from "../../contexts/Products/types";
import { toast } from "react-toastify";
import CustomButton from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import { ModalProduct } from "./components/ModalProduct";
import { ModalDelete } from "../../components/ModalDelete";

export function Products() {
  const { listProducts, deleteProduct } = ProductContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProductModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<IProductsData | null>(
    null
  );
  const [isDeleteProductModal, setDeleteProductModal] =
    useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>("");
  const [listproducts, setListProducts] = useState<IProductsData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("created_at");
  const [productForDelete, setProductForDelete] = useState<IProductsData>();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await listProducts();

      setListProducts(response.data);
    } catch (error) {
      toast.error(
        `Erro ao tentar ler produtos, contacte o administrador do sistema: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [listProducts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { filteredData, handleSearch } = useTableSearch({
    data: listproducts,
    searchTerm,
    searchableFields: ["product_type", "name"],
  });

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  const nameColumns: IColumn[] = useMemo(
    () => [
      {
        field: "product_type",
        header: "Sigla",
        width: "50px",
        sortable: true,
      },
      {
        field: "name",
        header: "Nome",
        width: "160px",
        sortable: true,
      },
      {
        field: "quality",
        header: "Qualidade",
        width: "160px",
      },
      {
        field: "observation",
        header: "Observação",
        width: "160px",
      },
      // { field: "created_at", header: "Data", width: "90px", sortable: true },
    ],
    []
  );

  const handleViewProduct = (product: IProductsData) => {
    navigate("/admin/produtos/visualizar-produto", {
      state: { productForView: product },
    });
  };

  const handleCreateNewProduct = async () => {
    setProductToEdit(null);
    setProductModalOpen(true);
  };

  const handleUpdateProduct = (product: IProductsData) => {
    setProductToEdit(product);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductModalOpen(false);
    setProductToEdit(null);
    fetchData();
  };

  const handleOpenDeleteProductModal = (product: IProductsData) => {
    setModalContent(
      `Tem certeza que deseja deletar o produto: ${product?.name} ?`
    );

    setProductForDelete(product);

    setDeleteProductModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteProductModal(false);
  };

  const handleDeleteProduct = async () => {
    if (!productForDelete || !productForDelete.id) {
      toast.error("Id do Produto não encontrado.");
      return;
    }

    try {
      await deleteProduct(productForDelete?.id);
      toast.success(
        <div>
          Produto: <strong>{productForDelete.name}</strong> deletado com
          sucesso!
        </div>
      );
      fetchData();
    } catch (error) {
      toast.error(
        `Erro ao tentar deletar produto: ${productForDelete.name}, contacte o administrador do sistema ${error}`
      );
    } finally {
      setDeleteProductModal(false);
    }
  };

  const renderActionButtons = useCallback(
    (row: any) => (
      <SButtonContainer>
        <CustomButton
          $variant="secondary"
          width="80px"
          onClick={() => handleViewProduct(row)}
        >
          Detalhes
        </CustomButton>
        <CustomButton
          $variant="primary"
          width="60px"
          onClick={() => handleUpdateProduct(row)}
        >
          Editar
        </CustomButton>
        <CustomButton
          $variant="danger"
          width="60px"
          onClick={() => handleOpenDeleteProductModal(row)}
        >
          Deletar
        </CustomButton>
      </SButtonContainer>
    ),
    [handleViewProduct, handleUpdateProduct, handleOpenDeleteProductModal]
  );

  return (
    <>
      <SContainer>
        <STitle>Cadastro de Produtos</STitle>

        <SContainerSearchAndButton>
          <CustomSearch
            width="400px"
            placeholder="Pesquise por sigla, nome do produto."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CustomButton
            $variant={"success"}
            width="180px"
            onClick={handleCreateNewProduct}
          >
            Criar Novo Produto
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
      <ModalProduct
        open={isProductModalOpen}
        onClose={handleCloseProductModal}
        productToEdit={productToEdit}
      />
      <ModalDelete
        open={isDeleteProductModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteProduct}
        content={modalContent}
      />
    </>
  );
}
