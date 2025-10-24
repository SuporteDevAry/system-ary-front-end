import { StepProps } from "../../types";
import { SContainer, SText, STextArea } from "./styles";
import { CustomSelect } from "../../../../../../components/CustomSelect";
//import { ProductType, productInfo } from "./types"; será removido junto com arquivo 01/09/25.
import { useEffect, useMemo, useState } from "react";
import { generateCropYears } from "./helpers";
import { CustomInput } from "../../../../../../components/CustomInput";
import { TableProductContext } from "../../../../../../contexts/TablesProducts";
import { ProductContext } from "../../../../../../contexts/Products";
import { ITableProductsData } from "../../../../../../contexts/TablesProducts/types";
import { IProductsData } from "../../../../../../contexts/Products/types";
import { toast } from "react-toastify";

export const Step2: React.FC<StepProps> = ({
  id,
  handleChange,
  formData,
  updateFormData,
  //isEditMode,
}) => {
  const cropYearOptions = useMemo(generateCropYears, []);

  const tableProductContext = TableProductContext();
  const productContext = ProductContext();

  const [tables, setTables] = useState<ITableProductsData[]>([]);
  const [products, setProducts] = useState<IProductsData[]>([]);
  const [selectedTable, setSelectedTable] = useState<ITableProductsData | null>(
    null
  );

  //TODO: Validar se essa lógica de deconversão do preço não deveria estar aqui também.
  // const deconvertedRef = useRef<boolean>(false);

  // //[x]: Regra para deconverter o preço quando em modo de edição e a moeda for Dólar.
  // // Isso evita que o preço seja salvo incorretamente após a conversão.
  // // Se o preço já foi deconvertido, não faz nada.
  // useEffect(() => {
  //   deconvertedRef.current = false;
  // }, [id]);

  // useEffect(() => {
  //   if (deconvertedRef.current) return;

  //   if (
  //     isEditMode &&
  //     formData.type_currency === "Dólar" &&
  //     formData.day_exchange_rate
  //   ) {
  //     const exchange = Number(
  //       String(formData.day_exchange_rate).replace(",", ".")
  //     );
  //     const storedPrice = Number(String(formData.price).replace(",", "."));

  //     if (!exchange || !Number.isFinite(storedPrice)) {
  //       deconvertedRef.current = true;
  //       return;
  //     }

  //     const priceToDollar = (storedPrice / exchange).toFixed(2);
  //     deconvertedRef.current = true;

  //     if (Number(priceToDollar) !== Number(formData.price)) {
  //       updateFormData?.({ ...formData, price: priceToDollar.toString() });
  //     }
  //   }
  // }, [
  //   isEditMode,
  //   formData.type_currency,
  //   formData.day_exchange_rate,
  //   updateFormData,
  //   id,
  //   formData.price,
  //   formData,
  // ]);

  useEffect(() => {
    const fetchTablesAndProducts = async () => {
      try {
        const tablesResponse = await tableProductContext.listTableProducts();
        setTables(tablesResponse.data);

        const productsResponse = await productContext.listProducts();
        setProducts(productsResponse.data);
      } catch (error) {
        toast.error("Erro ao carregar dados. Tente novamente.");
      }
    };

    fetchTablesAndProducts();
  }, []);

  useEffect(() => {
    if (formData.table_id) {
      const table = tables.find((t) => t.id === formData.table_id);
      if (table) {
        setSelectedTable(table);
      }
    } else {
      setSelectedTable(null); // Reseta se não houver table_id no formulário
    }
  }, [formData.table_id, tables]);

  const filteredProducts = useMemo(() => {
    if (!selectedTable) {
      return [];
    }
    const productTypesInTable = selectedTable.product_types;

    // Filtra os produtos com base nas siglas da mesa selecionada
    return products.filter((product) =>
      productTypesInTable.includes(product.product_type)
    );
  }, [selectedTable, products]);

  const handleFieldChange = (field: string, value: string) => {
    if (field === "table") {
      const table = tables.find((t) => t.id === value);
      setSelectedTable(table || null);

      updateFormData?.({
        ...formData,
        table_id: value,
        product: "",
        quality: "",
        observation: "",
        name_product: "",
        commission_seller: "",
        type_commission_seller: "",
      });
      return;
    }

    if (field === "product") {
      const productInfo = filteredProducts.find(
        (p) => p.product_type === value
      );
      if (productInfo) {
        updateFormData?.({
          ...formData,
          product: value,
          quality: productInfo.quality,
          observation: productInfo.observation,
          name_product: productInfo.name,
          commission_seller: productInfo.commission_seller,
          type_commission_seller: productInfo.type_commission_seller,
        });
      }
      return;
    }

    if (field === "destination") {
      updateFormData?.({
        ...formData,
        destination: value,
      });
      return;
    }

    if (field === "complement_destination") {
      updateFormData?.({
        ...formData,
        complement_destination: value,
      });
      return;
    }

    if (field === "crop") {
      updateFormData?.({
        ...formData,
        crop: value,
      });
      return;
    }
  };

  const tableOptions = useMemo(() => {
    return tables
      .filter((table) => table.id !== undefined)
      .map((table) => ({
        value: table.id!,
        label: table.name,
      }));
  }, [tables]);

  return (
    <SContainer id={id}>
      <CustomSelect
        name="table"
        label="Mesa:"
        $labelPosition="top"
        selectOptions={tableOptions}
        onSelectChange={(value) => handleFieldChange("table", value)}
        value={formData.table_id ?? ""}
      />

      <CustomSelect
        name="product"
        label="Mercadoria: "
        $labelPosition="top"
        selectOptions={filteredProducts.map((product) => ({
          value: product.product_type,
          label: product.name,
        }))}
        onSelectChange={(value) => handleFieldChange("product", value)}
        value={formData.product}
        disabled={!selectedTable}
      />

      <CustomSelect
        name="crop"
        label="Safra: "
        $labelPosition="top"
        selectOptions={cropYearOptions}
        onSelectChange={(value) => handleFieldChange("crop", value)}
        value={formData.crop}
      />
      <CustomSelect
        name="destination"
        label="Destinação: "
        $labelPosition="top"
        selectOptions={[
          { value: "+D.U.E", label: "+D.U.E" },
          {
            value: "+D.U.E - Livre de FETHAB",
            label: "+D.U.E - Livre de FETHAB",
          },
          { value: "Comercialização", label: "Comercialização" },
          {
            value: "Industrialização",
            label: "Industrialização",
          },
          {
            value: "Industrialização Ração Animal - Suspenso de Pis/Cofins",
            label: "Industrialização Ração Animal - Suspenso de Pis/Cofins",
          },
          { value: "Nenhum", label: "Nenhum" },
        ]}
        onSelectChange={(value) => handleFieldChange("destination", value)}
        value={formData.destination}
      />

      <CustomInput
        type="text"
        name="complement_destination"
        label="Complemento Destinação:"
        $labelPosition="top"
        value={formData.complement_destination || ""}
        onChange={(e) =>
          handleFieldChange("complement_destination", e.target.value)
        }
      />
      <SText>Qualidade:</SText>
      <STextArea
        name="quality"
        onChange={handleChange}
        value={formData.quality}
      />
    </SContainer>
  );
};
