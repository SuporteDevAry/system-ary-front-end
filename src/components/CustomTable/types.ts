import { ReactNode } from "react";

export interface IColumn {
  header: string;
  field: string;
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
}
