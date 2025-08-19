import { ApiResponse } from "../../services/api";

export interface IProductsProvider {
  children: JSX.Element;
}

export interface IProductsData {
  id?: string;
  product_type: string;
  name: string;
  commission_seller?: string;
  type_commission_seller?: string;
  quality: string;
  observation: string;
}

export interface IProductContext {
  listProducts: () => Promise<any>;
  getProductById: (productId: string) => Promise<ApiResponse<IProductsData>>;
  createProduct: (productData: IProductsData) => Promise<any>;
  updateProduct: (
    productId: string,
    productData: IProductsData
  ) => Promise<any>;
  deleteProduct: (productId: string) => Promise<any>;
}
