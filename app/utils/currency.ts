import { AVAILABLE_CURRENCIES, CurrencyInfo } from "../../redux/slices/budgetSlice";

/**
 * Format a number with the given currency
 *
 * @param amount The amount to format
 * @param currency The currency information (or undefined)
 * @param options Formatting options
 * @returns Formatted currency string with symbol
 */
export const formatCurrency = (
  amount: number,
  currency?: CurrencyInfo,
  options: Partial<{
    minimumFractionDigits: number;
    maximumFractionDigits: number;
  }> = {}
): string => {
  // Use default USD if currency is undefined
  const currencyToUse = currency || AVAILABLE_CURRENCIES[0];

  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  });

  return `${currencyToUse.symbol}${formatted}`;
};

/**
 * Get just the currency symbol
 *
 * @param currency The currency information (or undefined)
 * @returns The currency symbol
 */
export const getCurrencySymbol = (currency?: CurrencyInfo): string => {
  return currency?.symbol || AVAILABLE_CURRENCIES[0].symbol;
};
