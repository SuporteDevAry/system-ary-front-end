import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { SFormContainer, STextField } from "./styles";
import { IReportFilterProps, ReportFilterField, SelectState } from "./types";

const DEFAULT_VISIBLE_FIELDS: ReportFilterField[] = [
  "seller",
  "buyer",
  "product_types", // Usar product_types como campo do filtro
  "date_start",
  "date_end",
  "month",
  "year",
  "product",
  "name_product",
];
import { TableProductContext } from "../../contexts/TablesProducts";
import { ITableProductsData } from "../../contexts/TablesProducts/types";

export const ReportFilter: React.FC<IReportFilterProps> = ({
  open,
  initialFilters,
  onClose,
  onConfirm,
  onChange,
  titleText = "Filtrar Contratos",
  confirmText = "OK",
  cancelText = "Fechar",
  visibleFields,
}) => {
  const [filters, setFilters] = useState<SelectState>(initialFilters || {});
  // Estado auxiliar para mesa selecionada (table_id)
  const [selectedMesaId, setSelectedMesaId] = useState<string>("");
  const [mesas, setMesas] = useState<ITableProductsData[]>([]);
  const tableProductContext = TableProductContext();

  // Buscar mesas dinamicamente ao montar
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tablesResponse = await tableProductContext.listTableProducts();
        setMesas(tablesResponse.data);
      } catch (error) {
        // ignore error, pode exibir toast se quiser
      }
    };
    fetchTables();
  }, []);
  const [dateStartFocused, setDateStartFocused] = useState(false);
  const [dateEndFocused, setDateEndFocused] = useState(false);
  const enabledFields = new Set(visibleFields ?? DEFAULT_VISIBLE_FIELDS);

  const normalizeDateToIso = (dateValue?: string) => {
    if (!dateValue || typeof dateValue !== "string") {
      return "";
    }

    if (dateValue.includes("/")) {
      const parts = dateValue.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
          2,
          "0",
        )}`;
      }
    }

    return dateValue;
  };

  useEffect(() => {
    if (initialFilters) {
      const norm: any = { ...initialFilters };
      ["seller", "buyer", "product", "name_product"].forEach((k) => {
        const v = (norm as any)[k];
        if (typeof v === "string") {
          (norm as any)[k] = v.toUpperCase();
        }
      });
      norm.date = normalizeDateToIso(norm.date);
      norm.date_start = normalizeDateToIso(norm.date_start || norm.date);
      norm.date_end = normalizeDateToIso(norm.date_end);

      if (norm.date_start && norm.date_end && norm.date_end < norm.date_start) {
        norm.date_end = norm.date_start;
      }

      setFilters(norm);
      if (!norm.product_types) {
        setSelectedMesaId("");
      }
    } else {
      setFilters({});
      setSelectedMesaId("");
    }
  }, [initialFilters]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    if (name === "date_start") {
      const next = {
        ...filters,
        date_start: val,
        date:
          typeof val === "string" && val !== ""
            ? val
            : (filters.date as string) || "",
      };

      if (
        next.date_start &&
        typeof next.date_start === "string" &&
        next.date_end &&
        typeof next.date_end === "string" &&
        next.date_end < next.date_start
      ) {
        next.date_end = next.date_start;
      }

      setFilters(next);
      onChange && onChange(next);
      return;
    }

    if (name === "product_types") {
      setSelectedMesaId(val);
      // Não atualiza filters.product_types diretamente, só no confirm
      const next = { ...filters, product_types: val };
      setFilters(next);
      onChange && onChange(next);
      return;
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

    const hasDateRange =
      (typeof out.date_start === "string" && out.date_start !== "") ||
      (typeof out.date_end === "string" && out.date_end !== "");

    const referenceDate =
      (typeof out.date_start === "string" && out.date_start) ||
      (typeof out.date_end === "string" && out.date_end) ||
      (typeof out.date === "string" && out.date) ||
      "";

    if (referenceDate && !hasDateRange) {
      const dstr = referenceDate;
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

      if (yyyy && mm) {
        const dd = dstr.includes("/")
          ? dstr.split("/")[0].padStart(2, "0")
          : dstr.split("-")[2].padStart(2, "0");
        out.date = `${String(yyyy).padStart(4, "0")}-${String(mm).padStart(
          2,
          "0",
        )}-${String(dd).padStart(2, "0")}`;
      }
    }

    if (typeof out.date_start === "string") {
      out.date_start = normalizeDateToIso(out.date_start);
    }

    if (typeof out.date_end === "string") {
      out.date_end = normalizeDateToIso(out.date_end);
    }

    if (
      out.date_start &&
      out.date_end &&
      typeof out.date_start === "string" &&
      typeof out.date_end === "string" &&
      out.date_end < out.date_start
    ) {
      out.date_end = out.date_start;
    }

    if (out.date_start) {
      out.date = out.date_start;
    }

    if (hasDateRange) {
      if (!filters.month) {
        out.month = "";
      }
      if (!filters.year) {
        out.year = "";
      }
    }

    ["seller", "buyer", "product", "name_product"].forEach((k) => {
      const v = (out as any)[k];
      if (typeof v === "string" && v !== "") {
        (out as any)[k] = v.toUpperCase();
      }
    });

    // Se mesa selecionada, sobrescreve product_types como array de siglas da mesa
    if (selectedMesaId) {
      const mesa = mesas.find((m) => m.id === selectedMesaId);
      if (mesa) {
        out.product_types = mesa.product_types;
      }
    }

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
        {enabledFields.has("seller") && (
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
        )}

        {enabledFields.has("buyer") && (
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
        )}

        {enabledFields.has("date_start") && (
          <STextField
            label="Data início"
            type={dateStartFocused || !!filters.date_start ? "date" : "text"}
            variant="outlined"
            size="small"
            name="date_start"
            value={filters.date_start ?? ""}
            onChange={handleChange}
            onFocus={() => setDateStartFocused(true)}
            onBlur={() => setDateStartFocused(false)}
            placeholder="Data Início"
            sx={{ width: "100%" }}
            InputLabelProps={{
              shrink: dateStartFocused || !!filters.date_start,
            }}
          />
        )}

        {enabledFields.has("date_end") && (
          <STextField
            label="Data fim"
            type={dateEndFocused || !!filters.date_end ? "date" : "text"}
            variant="outlined"
            size="small"
            name="date_end"
            value={filters.date_end ?? ""}
            onChange={handleChange}
            onFocus={() => setDateEndFocused(true)}
            onBlur={() => setDateEndFocused(false)}
            placeholder="Data Fim"
            sx={{ width: "100%" }}
            InputLabelProps={{ shrink: dateEndFocused || !!filters.date_end }}
            inputProps={{ min: filters.date_start || undefined }}
          />
        )}

        {enabledFields.has("month") && (
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
        )}

        {enabledFields.has("year") && (
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
        )}

        {enabledFields.has("product_types") && (
          <STextField
            select
            label="Mesa"
            variant="outlined"
            size="small"
            name="product_types"
            value={selectedMesaId || filters.product_types || ""}
            onChange={handleChange}
            sx={{ width: "100%" }}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {mesas.map((mesa) => (
              <option key={mesa.id} value={mesa.id}>
                {mesa.name}
              </option>
            ))}
          </STextField>
        )}

        {enabledFields.has("product") && (
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
        )}

        {enabledFields.has("name_product") && (
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
        )}
      </SFormContainer>
    </Modal>
  );
};

export default ReportFilter;
