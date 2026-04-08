// src/react-ui/hooks/useSortableAndFilterableData.ts

import { useState, useMemo } from 'react';

// Define a generic type for the sort configuration
type SortConfig<T> = {
  key: keyof T;
  direction: 'ascending' | 'descending';
};

// Define the hook's return type for better type inference
interface UseSortableAndFilterableData<T> {
  processedData: T[];
  filterText: string;
  setFilterText: (text: string) => void;
  requestSort: (key: keyof T) => void;
  sortConfig: SortConfig<T> | null;
}

/**
 * A custom hook to manage client-side sorting and filtering for a data array.
 * @param data The raw data array to be processed.
 * @param filterKeys The keys of the data object to be used for filtering.
 * @returns An object containing the processed data and control functions.
 */
export function useSortableAndFilterableData<T extends Record<string, any>>(
  data: T[],
  filterKeys: (keyof T)[]
): UseSortableAndFilterableData<T> {
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const processedData = useMemo(() => {
    let processableItems = [...data];

    // Filtering logic
    if (filterText) {
      const lowercasedFilter = filterText.toLowerCase();
      processableItems = processableItems.filter(item => {
        // Check against all specified filter keys
        return filterKeys.some(key => {
          const value = item[key];
          return value ? String(value).toLowerCase().includes(lowercasedFilter) : false;
        });
      });
    }

    // Sorting logic
    if (sortConfig !== null) {
      processableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null || bValue == null) return 0;
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return processableItems;
  }, [data, filterText, sortConfig, filterKeys]);

  const requestSort = (key: keyof T) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { processedData, filterText, setFilterText, requestSort, sortConfig };
}