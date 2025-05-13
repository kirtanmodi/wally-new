# Mobile App Development Tasks

## Phase 1: Redux + Persist Setup
- [x] Install required packages
  ```bash
  npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage
  ```
- [x] Create app/redux directory structure
- [x] Setup store configuration
  - [x] Create app/redux/store.ts with root reducer and persist config
  - [x] Configure storage persistence
- [x] Create Redux slices
  - [x] Create app/redux/slices/userSlice.ts (user authentication state)
  - [x] Create app/redux/slices/appSlice.ts (app-wide settings)
- [x] Update App.tsx
  - [x] Wrap with Provider and PersistGate
- [x] Implement test counter functionality
  - [x] Add counter to appSlice.ts 
  - [x] Create a simple component to test persistence

## Phase 2: Responsive Utilities
- [x] Install responsive screen package
  ```bash
  npm install react-native-responsive-screen
  ```
- [x] Create responsive utilities
  - [x] Create app/utils/responsive.ts
  - [x] Export widthPercentage (wp) and heightPercentage (hp) functions
- [x] Implement responsive design
  - [x] Update existing components to use wp/hp
  - [x] Test responsive scaling across devices
- [ ] Validate across devices
  - [ ] Test on iPhone (different sizes)
  - [ ] Test on iPad
  - [ ] Test on Android devices via Expo

## Phase 3: Monthly Contribution Calculator for Savings Goals
- [x] Create utility function for monthly contribution calculation
  - [x] Create app/utils/savingsCalculator.ts
  - [x] Implement calculateMonthlyContribution function that takes target amount, current amount, and target date
  - [x] Add validation and error handling for invalid dates or amounts
- [x] Update Redux store
  - [x] Update SavingsGoal interface in budgetSlice.ts to include monthly contribution field
  - [x] Create action to update the monthly contribution value
- [x] Update SavingsDetailScreen component
  - [x] Add calculation logic to determine monthly contribution needed
  - [x] Handle edge cases (goal already met, no target date set, etc.)
  - [x] Calculate and display months remaining to reach goal
- [x] UI Implementation
  - [x] Add a new section in the goal details to show the monthly contribution
  - [x] Create visual indicator for monthly contribution status (on track, behind, ahead)
  - [x] Add a tooltip or info button to explain the calculation
  - [x] Make contribution section collapsible to save screen space
- [x] Update GoalSettingModal
  - [x] Show the projected monthly contribution while setting up a goal
  - [x] Allow users to adjust either the target date or target amount to see how it affects the required contribution
- [x] Add visual progress indicator
  - [x] Implement visual indicator showing this month's contribution toward the monthly recommended amount
  - [x] Add color-coding based on progress (red if behind, green if on target)
- [ ] Testing
  - [ ] Test with various goal amounts and dates
  - [ ] Verify calculations are correct across different scenarios
  - [ ] Test edge cases (past dates, already achieved goals)

## Phase 4: Currency Denomination Formatting
- [x] Create currency utilities
  - [x] Create app/utils/denominationFormatter.ts
  - [x] Implement formatWithDenomination function with support for suffixes (k, M, L, Cr)
  - [x] Add internationalization support for different region-specific denominations
- [x] Update Redux store
  - [x] Add denominationFormat preference to budgetSlice.ts or userSlice.ts
  - [x] Create action to update the denomination format preference
  - [x] Define denomination format types (none, compact, indian, international)
- [x] Update Settings screen
  - [x] Add denomination format selection in settings
  - [x] Create radio button or dropdown selector for format options
  - [x] Add preview examples for each format
- [x] Update components to use denomination formatting
  - [x] Update formatCurrency utility to use the new formatting
  - [x] Modify SavingsDetailScreen to use denomination formatting
  - [x] Modify NeedsDetailScreen to use denomination formatting
  - [x] Modify WantsDetailScreen to use denomination formatting
  - [x] Modify ExpensesList components to use denomination formatting
  - [x] Modify Profile screen to use denomination formatting
- [ ] Testing
  - [ ] Test with various currency amounts
  - [ ] Verify formatting is consistent across the app
  - [ ] Test edge cases (very large and small amounts)

## Phase 5: Income-Based Budget Recommendations
- [x] Add "Recommended Split" button to Budget Settings
  - [x] Create UI for the recommendation button
  - [x] Position button in the Budget Allocation section header
- [x] Implement recommendation logic based on income levels
  - [x] For high income (>=10000): Adjust to 40% needs, 40% savings, 20% wants
  - [x] For low income (<2000): Adjust to 60% needs, 20% savings, 20% wants
  - [x] For medium income: Keep standard 50% needs, 20% savings, 30% wants
- [x] Enhance recommendation functionality
  - [x] Add animation when transitioning between allocation percentages
  - [x] Implement more granular income brackets for better recommendations
  - [x] Adjust recommendations based on currency
  - [ ] Consider user's financial goals and existing debts in recommendations
- [x] User education
  - [x] Add tooltip explaining income-based recommendations
  - [x] Create brief guidance text about why recommendations change based on income
  - [x] Add option to learn more about budgeting strategies
  - [x] Add currency adjustment explanation to learn more section
- [ ] Testing
  - [ ] Test recommendation logic with various income levels
  - [ ] Test recommendation logic with different currencies
  - [ ] Ensure UI updates correctly when recommendation is applied
  - [ ] Verify budget rule is properly persisted after recommendation

## Phase 6: Categories Modal & Sorting
- [x] Create Category List Modal
  - [x] Design a new modal component to display all categories
  - [x] Add "View Categories" button in the Expense Categories section
  - [x] Replace inline category list with modal trigger button
  - [x] Move existing category list UI to the new modal
  - [x] Add close button and header to the modal
- [x] Implement Category Sorting
  - [x] Add sort options in modal header (by name, by type, by recently added)
  - [x] Create sort functionality in component state
  - [x] Add visual indicators for current sort method
  - [x] Persist sort preference between sessions
  - [x] Add animations for sort transitions
- [x] Enhance Category Management in Modal
  - [x] Improve category card design in the modal view
  - [x] Add category search/filter functionality
  - [ ] Add multi-select option for batch delete
  - [ ] Add drag and drop for manual reordering
  - [ ] Add statistics about category distribution
- [x] Performance Optimization
  - [x] Implement virtualized list for better performance with many categories
  - [ ] Add pagination if category list grows too large
  - [x] Optimize animations for smooth scrolling experience
  - [x] Ensure modals unmount properly to prevent memory leaks
- [ ] Testing
  - [ ] Test modal with various screen sizes
  - [ ] Test sort functionality with different category sets
  - [ ] Verify category management functions work properly in modal
  - [ ] Test performance with a large number of categories

## Phase 7: Add Savings Category Button in SavingsDetailScreen
- [x] Create "Add Savings Category" button in SavingsDetailScreen
  - [x] Add button near the "Savings Categories" section header
  - [x] Style the button to match the app's design system
  - [x] Use LinearGradient with the savings color theme
- [x] Implement Add Category Modal functionality
  - [x] Create reusable modal component or reuse existing from BudgetSettings
  - [x] Simplify the modal to only allow "Savings" as the category type
  - [x] Pre-fill the category type as "Savings" and hide the type selector
  - [x] Ensure new categories are properly added to the Redux store
- [x] Update Redux integration
  - [x] Ensure the addCategory action from budgetSlice is properly imported
  - [x] Dispatch action when a new savings category is added
  - [x] Update the UI immediately after adding a new category
- [x] Handle UI feedback
  - [x] Add success message after category creation
  - [x] Add validation to prevent empty category names
  - [ ] Add loading indicator during category creation process
  - [ ] Show appropriate error messages for validation failures
- [ ] Optimize performance
  - [ ] Ensure modal animations are smooth
  - [ ] Add proper keyboard handling for form inputs
  - [ ] Make sure modal unmounts properly to prevent memory leaks
- [ ] Testing
  - [ ] Test adding new savings categories
  - [ ] Verify new categories appear in the list immediately
  - [ ] Test validation logic for edge cases
  - [ ] Ensure responsive design works on different screen sizes

