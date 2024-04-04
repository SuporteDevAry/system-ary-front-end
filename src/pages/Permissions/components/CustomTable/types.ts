export interface IColumn {
  header: string;
  field: string;
}

export interface ICustomTableProps {
  columns: IColumn[];
  //data: T[];
  data: any[];
  hasPagination?: boolean;
  hasCheckbox?: boolean;
  collapsible?: boolean;
  onRowClick?: (rowData: any) => void;
}
