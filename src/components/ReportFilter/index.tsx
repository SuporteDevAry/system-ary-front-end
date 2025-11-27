import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { SFormContainer, STextField } from "./styles";
import { IReportFilterProps, SelectState } from "./types";

export const ReportFilter: React.FC<IReportFilterProps> = ({
  open,
  initialFilters,
  onClose,
  onConfirm,
  onChange,
  titleText = "Filtrar Contratos",
  confirmText = "OK",
  cancelText = "Fechar",
}) => {
  const [filters, setFilters] = useState<SelectState>(initialFilters || {});

  useEffect(() => {
    if (initialFilters) {
      const norm: any = { ...initialFilters };
      ["seller", "buyer", "product", "name_product"].forEach((k) => {
        const v = (norm as any)[k];
        if (typeof v === "string") {
          (norm as any)[k] = v.toUpperCase();
        }
      });
      // normalize date: accept dd/mm/yyyy and convert to ISO yyyy-mm-dd for the date input
      if (norm.date && typeof norm.date === "string") {
        const d = norm.date as string;
        if (d.includes("/")) {
          const parts = d.split("/");
          if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            norm.date = `${yyyy.padStart(4, "0")}-${mm.padStart(
              2,
              "0"
            )}-${dd.padStart(2, "0")}`;
          }
        }
      }
      setFilters(norm);
    } else {
      setFilters({});
    }
  }, [initialFilters]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let val: any = value;

    if (name === "month") {
      if (value === "") {
        val = "";
      } else {
        const n = parseInt(value, 10);
        if (!Number.isNaN(n)) {
          // Limitando mês entre 1 e 12
          val = Math.min(12, Math.max(1, n));
        } else {
          val = value;
        }
      }
    }

    if (
      ["seller", "buyer", "product", "name_product"].includes(name) &&
      typeof val === "string" &&
      val !== ""
    ) {
      val = val.toUpperCase();
    }

    const next = { ...filters, [name]: val };
    setFilters(next);
    onChange && onChange(next);
  };

  const handleConfirm = () => {
    // Tratando campos numéricos
    const out: SelectState = { ...filters };
    if (
      out.year !== undefined &&
      out.year !== "" &&
      typeof out.year === "string"
    ) {
      const n = parseInt(out.year as string, 10);
      out.year = Number.isNaN(n) ? out.year : n;
    }
    if (
      out.month !== undefined &&
      out.month !== "" &&
      typeof out.month === "string"
    ) {
      const n = parseInt(out.month as string, 10);
      out.month = Number.isNaN(n) ? out.month : n;
    }

    if (out.date && typeof out.date === "string") {
      const dstr = out.date as string;
      let yyyy: string | undefined;
      let mm: string | undefined;
      if (dstr.includes("/")) {
        const parts = dstr.split("/");
        if (parts.length === 3) {
          // dd/mm/yyyy
          yyyy = parts[2];
          mm = parts[1];
        }
      } else if (dstr.includes("-")) {
        const parts = dstr.split("-");
        if (parts.length === 3) {
          // yyyy-mm-dd
          yyyy = parts[0];
          mm = parts[1];
        }
      }

      if (yyyy) {
        const yn = parseInt(yyyy, 10);
        if (!Number.isNaN(yn)) {
          out.year = yn;
        }
      }
      if (mm) {
        const mn = parseInt(mm, 10);
        if (!Number.isNaN(mn)) {
          out.month = mn;
        }
      }
      // normalize date to ISO (yyyy-mm-dd)
      if (yyyy && mm) {
        const dd = dstr.includes("/")
          ? dstr.split("/")[0].padStart(2, "0")
          : dstr.split("-")[2].padStart(2, "0");
        (out as any).date = `${String(yyyy).padStart(4, "0")}-${String(
          mm
        ).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      }
    }

    ["seller", "buyer", "product", "name_product"].forEach((k) => {
      const v = (out as any)[k];
      if (typeof v === "string" && v !== "") {
        (out as any)[k] = v.toUpperCase();
      }
    });

    onConfirm(out);
  };

  return (
    <Modal
      titleText={titleText}
      open={open}
      confirmButton={confirmText}
      cancelButton={cancelText}
      onClose={onClose}
      onHandleConfirm={handleConfirm}
      variantCancel="primary"
      variantConfirm="success"
    >
      <SFormContainer>
        <STextField
          label="Vendedor (separe por ,)"
          type="text"
          variant="outlined"
          size="small"
          name="seller"
          value={filters.seller ?? ""}
          onChange={handleChange}
          sx={{ width: "100%" }}
        />

        <STextField
          label="Comprador (separe por ,)"
          type="text"
          variant="outlined"
          size="small"
          name="buyer"
          value={filters.buyer ?? ""}
          onChange={handleChange}
          sx={{ width: "100%" }}
        />

        <STextField
          type="date"
          variant="outlined"
          size="small"
          name="date"
          value={filters.date ?? ""}
          onChange={handleChange}
          sx={{ width: "100%" }}
        />

        <STextField
          label="Mês (1-12)"
          type="number"
          variant="outlined"
          size="small"
          name="month"
          value={filters.month ?? ""}
          onChange={handleChange}
          sx={{ width: "100%" }}
          inputProps={{ min: 1, max: 12, step: 1 }}
        />

        <STextField
          label="Ano (YYYY)"
          type="number"
          variant="outlined"
          size="small"
          name="year"
          value={filters.year ?? ""}
          onChange={handleChange}
          sx={{ width: "100%" }}
        />

        <STextField
          label="Sigla"
          type="text"
          variant="outlined"
          size="small"
          name="product"
          value={filters.product ?? ""}
          onChange={handleChange}
          sx={{ width: "100%" }}
        />

        <STextField
          label="Produto"
          type="text"
          variant="outlined"
          size="small"
          name="name_product"
          value={filters.name_product ?? ""}
          onChange={handleChange}
          sx={{ width: "100%" }}
        />
      </SFormContainer>
    </Modal>
  );
};

export default ReportFilter;
