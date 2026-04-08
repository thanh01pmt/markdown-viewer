// src/utils/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes a string to be used as a standardized code.
 * - Removes diacritics (e.g., 'á' -> 'a').
 * - Converts to uppercase.
 * - Replaces whitespace with underscores.
 * - Removes all other non-alphanumeric characters (except underscore).
 * @param input The string to sanitize.
 * @returns The sanitized, uppercase code string.
 */
export function sanitizeCode(input: string): string {
  if (!input) return '';
  return input
    .normalize("NFD") // Decompose accented characters into base characters and combining marks
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .toUpperCase() // Convert to uppercase
    .replace(/\s+/g, '_') // Replace one or more whitespace characters with a single underscore
    .replace(/[^A-Z0-9_]/g, ''); // Remove all characters that are not uppercase letters, numbers, or underscore
}

/**
 * Exports an array of objects to a TSV file and triggers a download.
 * @param data The array of data to export.
 * @param filename The desired name for the downloaded file (without extension).
 */
export function exportToTSV<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn("Export called with no data.");
    return;
  }

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Convert data to TSV format
  const tsvContent = [
    headers.join('\t'), // Header row
    ...data.map(row => 
      headers.map(header => {
        let value = row[header];
        // Handle null/undefined and stringify objects/arrays
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        // Escape tabs, newlines, and quotes within a value
        return String(value)
          .replace(/"/g, '""') // Escape double quotes
          .replace(/\t/g, ' ')   // Replace tabs with spaces
          .replace(/\n/g, ' ');  // Replace newlines with spaces
      }).join('\t')
    )
  ].join('\n');

  // Create a Blob and trigger download
  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.tsv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * NEW FUNCTION: Converts an array of objects to a JSON string and triggers a download.
 * @param data The array of objects to convert.
 * @param filename The desired name of the downloaded file (without extension).
 */
export function exportToJSON<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn("Export to JSON aborted: No data provided.");
    return;
  }
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, `${filename}.json`);
}


// Private helper function to trigger the download
function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}