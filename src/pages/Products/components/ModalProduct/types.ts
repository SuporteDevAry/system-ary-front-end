import { IProductsData } from "../../../../contexts/Products/types";

export interface ModalProductProps {
  open: boolean;
  onClose: () => void;
  productToEdit?: IProductsData | null;
}
