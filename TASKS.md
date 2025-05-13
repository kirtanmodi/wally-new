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

