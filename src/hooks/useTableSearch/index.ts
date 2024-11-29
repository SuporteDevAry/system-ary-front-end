import { useState, useCallback, useEffect } from "react";
import { useDebouncedValue } from "../useDebouncedValue";

interface UseTableSearchProps<T extends Record<string, any>> {
  data: T[];
  searchTerm: string;
  searchableFields?: (keyof T)[];
  debounceDelay?: number;
}

function useTableSearch<T extends Record<string, any>>({
  data,
  searchTerm,
  searchableFields = Object.keys(data[0] || {}) as (keyof T)[],
  debounceDelay = 300,
}: UseTableSearchProps<T>) {
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceDelay);
  const [filteredData, setFilteredData] = useState<T[]>(data);

  const handleSearch = useCallback(() => {
    if (debouncedSearchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const lowercasedSearchTerm = debouncedSearchTerm.trim().toLowerCase();

      const result = data.filter((item) =>
        searchableFields.some((field) => {
          const value = item[field];

          if (value === null || value === undefined) {
            return false;
          }
          if (typeof value === "object") {
            return JSON.stringify(value)
              .toLowerCase()
              .includes(lowercasedSearchTerm);
          }

          const stringValue = value.toString().toLowerCase();
          return stringValue.includes(lowercasedSearchTerm);
        })
      );

      setFilteredData(result);
    }
  }, [debouncedSearchTerm, data, searchableFields]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return { filteredData, handleSearch };
}

export default useTableSearch;
