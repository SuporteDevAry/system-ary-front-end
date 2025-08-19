import { ITableProductsData } from "../../../../contexts/TablesProducts/types";

export interface ModalTableProductProps {
  open: boolean;
  onClose: () => void;
  tableProductToEdit?: ITableProductsData | null;
}
