import { AVAILABLE_CURRENCIES, CurrencyInfo } from "../../redux/slices/budgetSlice";
import { DenominationFormat, formatWithDenomination } from "./denominationFormatter";

/**
 * Formats a number as currency with the given currency info
 *
 * @param amount The amount to format
 * @param currency The currency information
 * @param denominationFormat Optional denomination format to use
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: CurrencyInfo, denominationFormat: DenominationFormat = "none"): string {
  return formatWithDenomination(amount, {
    format: denominationFormat,
    currencySymbol: currency.symbol,
    decimalPlaces: 1,
    showZeroDecimals: false,
  });
}

/**
 * Get just the currency symbol
 *
 * @param currency The currency information (or undefined)
 * @returns The currency symbol
 */
export const getCurrencySymbol = (currency?: CurrencyInfo): string => {
  return currency?.symbol || AVAILABLE_CURRENCIES[0].symbol;
};
