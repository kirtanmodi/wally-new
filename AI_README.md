# Wally - Personal Budget Management App

## Project Overview

Wally is a comprehensive mobile budget management application built with React Native and Expo. The app helps users track their finances according to the 50/30/20 budgeting rule (Needs, Savings, Wants), manage expenses, set savings goals, and visualize their financial progress.

## Technology Stack

- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: Expo Router
- **Authentication**: Google Auth and Email/Password
- **UI Components**: Custom React Native components
- **Storage**: AsyncStorage for persistent data
- **Styling**: StyleSheet API with responsive design

## Project Structure

```
wally/
├── app/                  # Main application routes and shared utilities
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/           # Main tab navigation screens
│   ├── (modals)/         # Modal screens (add expense, notifications)
│   ├── (details)/        # Detail screens
│   ├── assets/           # App-specific assets
│   ├── constants/        # App constants
│   ├── hooks/            # Custom hooks
│   ├── services/         # External services (Auth)
│   ├── types/            # Type definitions
│   ├── utils/            # Utility functions
│   ├── _layout.tsx       # Root layout component
│   └── index.tsx         # Root screen
├── components/           # UI components
├── redux/                # State management
│   ├── slices/           # Redux slices
│   ├── store.ts          # Redux store config
│   └── types.ts          # Store types
├── assets/               # Global assets
└── node_modules/         # Dependencies
```

## Authentication

The app supports two authentication methods:
- Email/Password (simulated)
- Google Authentication (not configured yet)

Authentication is managed through the `AuthService.ts` in `app/services` and authenticated state is stored in Redux.

### Authentication Flow

1. Users enter the app through the root layout (`app/_layout.tsx`)
2. The AuthContextProvider checks if the user is authenticated
3. If not authenticated, the user is redirected to the login screen
4. After successful login, the user is redirected to the main app
5. Auth state persists across app restarts via Redux Persist

## State Management (Redux)

The app uses Redux Toolkit for state management, with the following slices:

### 1. User Slice (`userSlice.ts`)

**State**:
- Authentication status
- User profile information
- Authentication provider (email/Google)

**Key Actions**:
- `login`: Authenticate with email/password
- `googleLogin`: Authenticate with Google
- `logout`: Sign out the user
- `updateProfile`: Update user profile information

### 2. Budget Slice (`budgetSlice.ts`)

**State**:
- Monthly income
- Budget rule (50/30/20 percentages)
- Expense categories
- Currency settings
- Savings goals

**Key Actions**:
- `setMonthlyIncome`: Update user's monthly income
- `updateBudgetRule`: Modify the 50/30/20 rule percentages
- `addCategory`, `updateCategory`, `deleteCategory`: Manage expense categories
- `setSavingsGoal`, `updateSavingsGoal`, `deleteSavingsGoal`: Manage savings goals
- `setCurrency`: Change currency settings

### 3. Expense Slice (`expenseSlice.ts`)

**State**:
- Expenses list
- Onboarding status

**Key Actions**:
- `addExpense`: Add a new expense
- `updateExpense`: Modify an existing expense
- `deleteExpense`: Remove an expense
- `setUserOnboarded`: Mark user onboarding as complete

### 4. App Slice (`appSlice.ts`)

**State**:
- App-wide settings
- UI preferences
- Active month/year for viewing expenses

**Key Selectors**:
Each slice contains selectors for retrieving state in components. The most commonly used selectors include:
- `selectIsAuthenticated`: Check if user is logged in
- `selectCategories`: Get all expense categories
- `selectExpenses`: Get all expenses
- `selectBudgetRule`: Get the current budget rule

## Screens and Navigation

### Main Screens:

1. **Welcome Screen**: First-time user onboarding
2. **Authentication Screens**:
   - Login
   - Register
   - Forgot Password

3. **Main Tab Screens**:
   - Home: Dashboard with budget overview
   - Expenses: Expense tracking and management
   - Budget: Budget settings and analysis
   - Profile: User profile and settings

4. **Modal Screens**:
   - Add Expense: Form to add new expenses
   - Edit Expense: Form to edit existing expenses
   - Notifications: App notifications
   - Privacy: Privacy settings

5. **Detail Screens**:
   - Needs Detail: Detailed view of "Needs" expenses
   - Wants Detail: Detailed view of "Wants" expenses
   - Savings Detail: Detailed view of "Savings" and goals

## Core Components

### 1. BudgetOverview.tsx
Displays a summary of the user's budget, showing the distribution of expenses across Needs, Wants, and Savings categories. Includes progress bars and percentage calculations to visualize budget usage.

### 2. AddExpense.tsx
A form component that allows users to add or edit expenses. It includes fields for:
- Amount
- Description
- Budget category (Needs, Wants, Savings)
- Expense category (subcategory)
- Date

### 3. BudgetSettings.tsx
Allows users to configure their budget settings, including:
- Monthly income
- Budget rule percentages
- Currency settings
- Adding/editing expense categories

### 4. SavingsDetailScreen.tsx
Displays detailed information about savings categories and goals. Users can set savings targets with target dates and track progress.

### 5. NeedsDetailScreen.tsx & WantsDetailScreen.tsx
Shows detailed breakdowns of expenses in the Needs and Wants categories, including category-specific visualizations and statistics.

## Data Flow

1. **User Input**: Through UI components like forms and settings screens
2. **Redux Actions**: Component dispatches actions when user interacts
3. **State Updates**: Redux reducers update the central store
4. **Re-render**: Components connected to Redux re-render with updated data
5. **Persistence**: Redux Persist saves state to AsyncStorage for app restarts

## Budget Management Features

### 1. 50/30/20 Rule
The app implements the popular budgeting rule:
- 50% for Needs (essentials)
- 30% for Savings (future)
- 20% for Wants (discretionary)

These percentages are customizable in the settings.

### 2. Expense Tracking
Users can add, edit, and delete expenses, categorizing them into Needs, Wants, or Savings. Each expense includes:
- Amount
- Description
- Category
- Subcategory
- Date
- Icon

### 3. Expense Categories
The app comes with default categories, but users can add, edit, or remove categories. Each category has:
- Name
- Icon
- Budget type (Needs, Wants, Savings)

### 4. Savings Goals
Users can set savings goals for specific categories, with:
- Target amount
- Target date
- Notes

### 5. Budget Analysis
The app provides visualizations and statistics to help users analyze their spending habits and budget adherence.

## Responsive Design

The app uses a responsive design approach, with utility functions in `app/utils/responsive.js` that scale UI elements based on screen size:
- `responsivePadding`: Adjusts padding based on screen size
- `responsiveMargin`: Adjusts margins based on screen size
- `scaleFontSize`: Makes font sizes responsive

## Currency Support

The app supports multiple currencies:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- INR (Indian Rupee)
- CNY (Chinese Yuan)

Currency formatting is handled by the `formatCurrency` utility function.

## Development Workflow

### Running the App

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Run on specific platforms:
   ```
   npm run ios
   npm run android
   npm run web
   ```

### Building for Production

The app uses EAS (Expo Application Services) for builds:

```
# Preview build
npm run build:preview

# Production build
npm run build:production
```

### Submitting to App Stores

```
# iOS
npm run submit:ios

# Android
npm run submit:android
```

## Authentication Setup

To enable Google Authentication:
1. Create a project in Google Cloud Console
2. Configure OAuth 2.0 client IDs for Android, iOS, and Web
3. Update client IDs in `app/services/AuthService.ts`

## Future Development Roadmap

1. **Backend Integration**: Connect to a real backend for user authentication and data storage
2. **Data Sync**: Implement cloud sync functionality
3. **Reports**: Add detailed financial reports and data export
4. **Recurring Expenses**: Support for recurring bills and payments
5. **Financial Insights**: AI-powered financial insights and recommendations
6. **Multi-device Sync**: Synchronize data across multiple devices
7. **Dark Mode**: Implement light/dark theme support
