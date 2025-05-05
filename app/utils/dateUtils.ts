/**
 * Helper functions for working with dates in the expense app
 */

/**
 * Format a date to a readable month and year string
 * @param date - Date object or string
 * @returns Formatted month and year (e.g., "May 2025")
 */
export const formatMonthYear = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/**
 * Get an array of available months from a list of expenses
 * @param expenses - The expenses array
 * @returns Array of available months with key and display string
 */
export const getAvailableMonths = (expenses: any[]): { key: string; display: string }[] => {
  if (!expenses || expenses.length === 0) {
    // Default to current month if no expenses
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}`;
    return [{ key, display: formatMonthYear(now) }];
  }

  const months = new Set<string>();

  // Get unique year-month combinations from expenses
  expenses.forEach((expense) => {
    try {
      const expenseDate = typeof expense.date === "string" ? new Date(expense.date) : expense.date;
      // Make sure the date is valid
      if (isNaN(expenseDate.getTime())) {
        return; // Skip this expense
      }
      const key = `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}`;
      months.add(key);
    } catch (error) {
      // Skip invalid dates
    }
  });

  // Add the current month if it's not in the list
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  months.add(currentMonthKey);

  // Convert to array and sort chronologically (newest first)
  return Array.from(months)
    .map((key) => {
      const [year, month] = key.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      return { key, display: formatMonthYear(date) };
    })
    .sort((a, b) => {
      const [yearA, monthA] = a.key.split("-").map(Number);
      const [yearB, monthB] = b.key.split("-").map(Number);

      // Sort by year, then by month (descending)
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
};

/**
 * Filter expenses by month and year
 * @param expenses - The full expenses array
 * @param monthYearKey - The month-year key to filter by (format: "YYYY-M")
 * @returns Filtered expenses for the specified month
 */
export const filterExpensesByMonth = (expenses: any[], monthYearKey: string): any[] => {
  if (!expenses || !Array.isArray(expenses)) return [];
  if (!monthYearKey) return expenses;

  console.log(`Filtering expenses by month: ${monthYearKey}, total expenses: ${expenses.length}`);

  try {
    const [year, month] = monthYearKey.split("-").map(Number);

    if (isNaN(year) || isNaN(month)) {
      console.warn(`Invalid month-year key: ${monthYearKey}`);
      return expenses;
    }

    const filtered = expenses.filter((expense) => {
      if (!expense || !expense.date) return false;

      try {
        const expenseDate = typeof expense.date === "string" ? new Date(expense.date) : expense.date;

        // Check if the date is valid
        if (isNaN(expenseDate.getTime())) {
          console.warn(`Invalid expense date: ${expense.date}`);
          return false;
        }

        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth() + 1;

        const matches = expenseYear === year && expenseMonth === month;
        return matches;
      } catch (error) {
        console.error(`Error processing expense date: ${error}`);
        return false;
      }
    });

    console.log(`Found ${filtered.length} expenses for month ${monthYearKey}`);
    return filtered;
  } catch (error) {
    console.error(`Error in filterExpensesByMonth: ${error}`);
    return expenses;
  }
};

/**
 * Get the current month-year key
 * @returns The current month-year key (format: "YYYY-M")
 */
export const getCurrentMonthYearKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
};

/**
 * Generate a display name for a date range filter
 * @param range - The range type ('day', 'week', 'month', 'year', 'all')
 * @param date - The reference date
 * @returns A display string for the filter
 */
export const getDateRangeDisplay = (range: "day" | "week" | "month" | "year" | "all", date: Date = new Date()): string => {
  switch (range) {
    case "day":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    case "week":
      // Get start of week
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      // Get end of week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Format as "Jan 1 - Jan 7, 2025"
      return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    case "month":
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "year":
      return date.toLocaleDateString("en-US", { year: "numeric" });
    case "all":
      return "All Time";
    default:
      return "Custom Range";
  }
};
