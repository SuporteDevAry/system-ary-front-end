import { useState, useCallback } from "react";

interface UseTableSearchProps<T extends Record<string, any>> {
  data: T[];
  searchTerm: string;
  setPage: (page: number) => void;
  searchableFields?: (keyof T)[];
}

function useTableSearch<T extends Record<string, any>>({
  data,
  searchTerm,
  setPage,
  searchableFields = Object.keys(data[0] || {}) as (keyof T)[],
}: UseTableSearchProps<T>) {
  const [filteredData, setFilteredData] = useState<T[]>(data);

  const handleSearch = useCallback(() => {
    // Voltar para a primeira página ao realizar a pesquisa
    setPage(0);

    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const lowercasedSearchTerm = searchTerm.trim().toLowerCase();

      const result = data.filter((item) =>
        searchableFields.some((field) => {
          const value = item[field];
          if (value) {
            const stringValue = value.toString().toLowerCase();

            return (
              stringValue.includes(lowercasedSearchTerm) ||
              stringValue === lowercasedSearchTerm
            );
          }
          return false;
        })
      );

      setFilteredData(result);
    }
  }, [searchTerm, data, searchableFields, setPage]);

  return { filteredData, handleSearch };
}

export default useTableSearch;
