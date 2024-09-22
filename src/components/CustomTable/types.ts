import { Dispatch, ReactNode, SetStateAction } from "react";

export interface IColumn {
  header: string;
  field: string;
  width?: string;
  sortable?: boolean;
}

export interface TableDataProps {
  [key: string]: any;
}

export interface ICustomTableProps {
  //data: T[];
  columns: IColumn[];
  data: any[];
  hasPagination?: boolean;
  hasCheckbox?: boolean;
  collapsible?: boolean;
  isLoading?: boolean;
  dateFields?: string[];
  renderChildren?: (row: TableDataProps) => ReactNode;
  onRowClick?: (row: TableDataProps) => void;
  actionButtons?: (row: TableDataProps) => ReactNode;
  maxChars?: number;
  page?: number;
  setPage?: Dispatch<SetStateAction<number>>;
  order: "asc" | "desc";
  orderBy: string;
  setOrder: Dispatch<SetStateAction<"asc" | "desc">>;
  setOrderBy: Dispatch<SetStateAction<string>>;
}
