/**
 * Currency denomination formatter utility
 * Provides functions to format currency values with appropriate suffixes (k, M, L, Cr)
 */

export type DenominationFormat = "none" | "compact" | "indian" | "international";

interface FormatOptions {
  format?: DenominationFormat;
  decimalPlaces?: number;
  showZeroDecimals?: boolean;
  currencySymbol?: string;
}

/**
 * Formats a number with the appropriate suffix based on the selected format type
 *
 * @param value The number to format
 * @param options Formatting options
 * @returns Formatted string with denomination suffix
 */
export function formatWithDenomination(value: number, options: FormatOptions = {}): string {
  const { format = "none", decimalPlaces = 1, showZeroDecimals = false, currencySymbol = "" } = options;

  if (isNaN(value)) return `${currencySymbol}0`;

  // If format is 'none', just return the formatted number without denomination
  if (format === "none") {
    return `${currencySymbol}${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  // Handle different denomination formats
  if (format === "indian") {
    return formatIndianDenomination(value, currencySymbol, decimalPlaces, showZeroDecimals);
  } else if (format === "compact") {
    return formatCompactDenomination(value, currencySymbol, decimalPlaces, showZeroDecimals);
  } else {
    return formatInternationalDenomination(value, currencySymbol, decimalPlaces, showZeroDecimals);
  }
}

/**
 * Formats a number using Indian denomination system (Lakh, Crore)
 */
function formatIndianDenomination(value: number, currencySymbol: string, decimalPlaces: number, showZeroDecimals: boolean): string {
  const absValue = Math.abs(value);

  // For Crore (10,000,000)
  if (absValue >= 10000000) {
    const formattedValue = (value / 10000000).toFixed(decimalPlaces);
    return formatOutput(formattedValue, "Cr", currencySymbol, showZeroDecimals);
  }

  // For Lakh (100,000)
  if (absValue >= 100000) {
    const formattedValue = (value / 100000).toFixed(decimalPlaces);
    return formatOutput(formattedValue, "L", currencySymbol, showZeroDecimals);
  }

  // For thousand
  if (absValue >= 1000) {
    const formattedValue = (value / 1000).toFixed(decimalPlaces);
    return formatOutput(formattedValue, "k", currencySymbol, showZeroDecimals);
  }

  // Regular formatting for small numbers
  return `${currencySymbol}${value.toFixed(showZeroDecimals ? decimalPlaces : 0)}`;
}

/**
 * Formats a number using international denomination system (K, M, B, T)
 */
function formatInternationalDenomination(value: number, currencySymbol: string, decimalPlaces: number, showZeroDecimals: boolean): string {
  const absValue = Math.abs(value);

  // For Trillion (1,000,000,000,000)
  if (absValue >= 1000000000000) {
    const formattedValue = (value / 1000000000000).toFixed(decimalPlaces);
    return formatOutput(formattedValue, "T", currencySymbol, showZeroDecimals);
  }

  // For Billion (1,000,000,000)
  if (absValue >= 1000000000) {
    const formattedValue = (value / 1000000000).toFixed(decimalPlaces);
    return formatOutput(formattedValue, "B", currencySymbol, showZeroDecimals);
  }

  // For Million (1,000,000)
  if (absValue >= 1000000) {
    const formattedValue = (value / 1000000).toFixed(decimalPlaces);
    return formatOutput(formattedValue, "M", currencySymbol, showZeroDecimals);
  }

  // For Thousand (1,000)
  if (absValue >= 1000) {
    const formattedValue = (value / 1000).toFixed(decimalPlaces);
    return formatOutput(formattedValue, "K", currencySymbol, showZeroDecimals);
  }

  // Regular formatting for small numbers
  return `${currencySymbol}${value.toFixed(showZeroDecimals ? decimalPlaces : 0)}`;
}

/**
 * Compact format with automatic selection of the appropriate suffix
 */
function formatCompactDenomination(value: number, currencySymbol: string, decimalPlaces: number, showZeroDecimals: boolean): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: decimalPlaces,
    minimumFractionDigits: showZeroDecimals ? decimalPlaces : 0,
  }).format(value);
}

/**
 * Helper function to format the output with the symbol and suffix
 */
function formatOutput(formattedValue: string, suffix: string, currencySymbol: string, showZeroDecimals: boolean): string {
  // Remove trailing zeros if needed
  if (!showZeroDecimals && formattedValue.includes(".")) {
    formattedValue = formattedValue.replace(/\.0+$/, "");
  }

  return `${currencySymbol}${formattedValue}${suffix}`;
}

/**
 * Utility function to get a preview of all formatting options for a value
 */
export function getFormatPreviews(value: number, currencySymbol: string = "$"): Record<DenominationFormat, string> {
  return {
    none: formatWithDenomination(value, { format: "none", currencySymbol }),
    compact: formatWithDenomination(value, { format: "compact", currencySymbol }),
    indian: formatWithDenomination(value, { format: "indian", currencySymbol }),
    international: formatWithDenomination(value, { format: "international", currencySymbol }),
  };
}
