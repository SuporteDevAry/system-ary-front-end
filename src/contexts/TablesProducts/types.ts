import { ApiResponse } from "../../services/api";

export interface ITableProductsProvider {
  children: JSX.Element;
}

export interface ITableProductsData {
  id?: string;
  product_types: string[];
  name: string;
}

export interface ITableProductsContext {
  listTableProducts: () => Promise<any>;
  getTableProductById: (
    tableProductId: string
  ) => Promise<ApiResponse<ITableProductsData>>;
  createTableProduct: (tableproductData: ITableProductsData) => Promise<any>;
  updateTableProduct: (
    tableProductId: string,
    tableProductData: ITableProductsData
  ) => Promise<any>;
  deleteTableProduct: (productId: string) => Promise<any>;
}
