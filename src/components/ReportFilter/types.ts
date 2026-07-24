export type SelectState = {
  seller?: string;
  buyer?: string;
  /** Full date filter in ISO format (YYYY-MM-DD) or display string */
  date?: string;
  date_start?: string;
  date_end?: string;
  charge_date_start?: string;
  charge_date_end?: string;
  year?: string | number;
  month?: string | number;
  product?: string;
  name_product?: string;
  number_contract?: string;
  mesa?: string;
  product_types?: string | string[]; // Agora aceita array de siglas
};

export type ReportFilterField =
  | "seller"
  | "buyer"
  | "product_types" // Usar product_types como campo do filtro
  | "date_start"
  | "date_end"
  | "charge_date_start"
  | "charge_date_end"
  | "month"
  | "year"
  | "product"
  | "name_product"
  | "number_contract"
  | "mesa";

export interface IReportFilterProps {
  open: boolean;
  initialFilters?: SelectState;
  onClose: () => void;
  onConfirm: (filters: SelectState) => void;
  onChange?: (filters: SelectState) => void;
  titleText?: string;
  confirmText?: string;
  cancelText?: string;
  visibleFields?: ReportFilterField[];
  fieldLabels?: Partial<Record<string, string>>;
  defaultMesaName?: string;
  allowEmptyMesa?: boolean;
}
