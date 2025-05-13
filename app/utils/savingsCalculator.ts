/**
 * Utility functions for calculating savings goal contributions
 */

/**
 * Calculate the monthly contribution needed to reach a savings goal by the target date
 *
 * @param targetAmount - The total amount to save (goal amount)
 * @param currentAmount - The amount already saved
 * @param targetDate - The target date in "MM/YYYY" format
 * @returns An object containing the monthly contribution and months remaining
 */
export const calculateMonthlyContribution = (
  targetAmount: number,
  currentAmount: number,
  targetDate?: string
): { monthlyAmount: number; monthsRemaining: number; isGoalMet: boolean } => {
  // Check if the goal is already met
  if (currentAmount >= targetAmount) {
    return {
      monthlyAmount: 0,
      monthsRemaining: 0,
      isGoalMet: true,
    };
  }

  // If no target date, return a default suggestion (divide remaining by 12 months)
  if (!targetDate) {
    return {
      monthlyAmount: (targetAmount - currentAmount) / 12,
      monthsRemaining: 12,
      isGoalMet: false,
    };
  }

  try {
    // Parse the target date (format: "MM/YYYY")
    const [monthStr, yearStr] = targetDate.split("/");
    const targetMonth = parseInt(monthStr, 10);
    const targetYear = parseInt(yearStr, 10);

    // Validate date format
    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 1 || targetMonth > 12) {
      throw new Error("Invalid date format");
    }

    // Calculate months remaining
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    // Calculate total months between now and target date
    const monthsRemaining = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

    // Handle past dates
    if (monthsRemaining <= 0) {
      return {
        monthlyAmount: targetAmount - currentAmount, // Suggest immediate completion
        monthsRemaining: 0,
        isGoalMet: false,
      };
    }

    // Calculate the required monthly contribution
    const remainingAmount = targetAmount - currentAmount;
    const monthlyAmount = remainingAmount / monthsRemaining;

    return {
      monthlyAmount,
      monthsRemaining,
      isGoalMet: false,
    };
  } catch (error) {
    // Return a sensible default if date parsing fails
    return {
      monthlyAmount: (targetAmount - currentAmount) / 12,
      monthsRemaining: 12,
      isGoalMet: false,
    };
  }
};

/**
 * Check if the current month's contribution is on track for the goal
 *
 * @param monthlyRecommended - The recommended monthly contribution
 * @param currentMonthContribution - How much has been contributed this month
 * @returns Status of the contribution: "ahead", "on-track", or "behind"
 */
export const getContributionStatus = (monthlyRecommended: number, currentMonthContribution: number): "ahead" | "on-track" | "behind" => {
  if (currentMonthContribution >= monthlyRecommended * 1.1) {
    return "ahead"; // 10% or more above recommendation
  } else if (currentMonthContribution >= monthlyRecommended * 0.9) {
    return "on-track"; // Within 10% of recommendation
  } else {
    return "behind"; // More than 10% below recommendation
  }
};
