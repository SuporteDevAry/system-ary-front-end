export type SelectState = {
  seller?: string;
  buyer?: string;
  /** Full date filter in ISO format (YYYY-MM-DD) or display string */
  date?: string;
  year?: string | number;
  month?: string | number;
  product?: string;
  name_product?: string;
};

export interface IReportFilterProps {
  open: boolean;
  initialFilters?: SelectState;
  onClose: () => void;
  onConfirm: (filters: SelectState) => void;
  onChange?: (filters: SelectState) => void;
  titleText?: string;
  confirmText?: string;
  cancelText?: string;
}
