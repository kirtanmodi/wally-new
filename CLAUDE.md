# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wally is a React Native personal finance app built with Expo that helps users track expenses, manage budgets using the 50/30/20 rule, and achieve financial goals. The app uses Redux Toolkit for state management, Expo Router for navigation, and Clerk for authentication with OAuth support.

## Essential Development Commands

### Development
```bash
npm start              # Start Expo development server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run in web browser
```

### Code Quality
```bash
npm run lint          # Run ESLint with Expo configuration
```

### Building & Deployment
```bash
npm run build:preview      # Build for internal testing (all platforms)
npm run build:production   # Build for app store release (all platforms)
npm run submit:ios         # Submit to App Store
npm run submit:android     # Submit to Google Play
npm run publish:update     # Push OTA updates via EAS
```

## Architecture Overview

### State Management
The app uses Redux Toolkit with Redux Persist for state management. All state is persisted to AsyncStorage.

**Redux Slices:**
- `userSlice`: Authentication state, user profile, OAuth provider tracking, and preferences
- `budgetSlice`: Budget configuration (50/30/20 percentages), categories, currency settings, base budget mode, category limits
- `expenseSlice`: All expense data and management
- `appSlice`: App-wide settings, comprehensive theme system, notifications

### Navigation Structure
Uses Expo Router with file-based routing:
- `(auth)`: Login/signup screens (shown when not authenticated)
- `(onboarding)`: 5-step user onboarding flow for new users
- `(tabs)`: Main app tabs (overview, analytics, profile, settings)
- `(modals)`: Modal screens (add-expense, edit-expense, notifications, privacy, theme-demo)
- `(details)`: Detail screens for budget categories (needs, savings, wants)

### Key Features Implementation

**Budget Management:**
- Implements customizable 50/30/20 budgeting rule
- Categories: Needs (essentials), Savings, Wants (lifestyle)
- Each category has customizable subcategories
- Income-based budget recommendations with progressive scaling
- **Base Budget Mode**: Alternative to percentage-based budgeting for Needs category
  - Toggle between percentage allocation and manual category limits
  - Set individual spending limits for each needs subcategory
  - Visual indicators show when base budget mode is active
  - Progress tracking against individual category limits with over-limit alerts

**Expense Tracking:**
- Add expenses with amount, category, description, date
- Filter and sort expenses by category/date
- Visual analytics with spending patterns
- Currency denomination formatting (e.g., 10K, 1.5M)

**Savings Goals:**
- Create goals with target amount and deadline
- Monthly contribution calculator
- Progress tracking with visual indicators
- Multiple concurrent goals support

**User Onboarding:**
- Comprehensive 5-step onboarding flow for new users
- Progressive disclosure with guided setup
- Income setup with currency selection and validation
- Interactive budget allocation with 50/30/20 customization
- Category personalization with add/remove functionality
- Setup completion with summary and next steps guidance

### Component Architecture

**Key Components:**
- `AnimatedCategoryCircle`: SVG-based circular progress indicator for budget visualization with base budget mode indicators
- `BudgetCategoryBox`: Interactive category display with progress bars
- `ExpenseItem`: Individual expense display with swipe-to-delete
- `SavingsGoalCard`: Goal progress visualization
- `AddExpenseModal`: Main expense entry interface
- `CategoryLimitModal`: Modal for setting individual category budget limits in base budget mode

**Onboarding Components:**
- `OnboardingStep`: Reusable wrapper component with progress indicators and navigation
- Onboarding screens (`step1-step5`): Welcome, income setup, budget allocation, category customization, completion
- Form validation and error handling for user inputs
- Interactive budget sliders with real-time calculation updates

**Theme System Components:**
- `ThemeProvider`: Context provider for theme management with status bar integration
- `ThemeSettings`: Complete theme settings UI with light/dark/system options
- `ThemeToggle`: Toggle component with compact variant for theme switching
- `ThemedComponents`: Comprehensive themed component library (Text, View, Card, TextInput, Button, Separator)

**Base Budget Mode Components:**
- `NeedsDetailScreen`: Enhanced with base budget toggle and category limit management
- `CategoryLimitModal`: Modal interface for setting individual category spending limits
- `BudgetOverview`: Updated to show base budget mode indicators in needs section
- `AnimatedCategoryCircle`: Visual badges and indicators for base budget mode

**Styling Approach:**
- Uses React Native StyleSheet with comprehensive theme support
- Responsive design using react-native-responsive-screen
- Advanced light/dark/system theme support via Redux state and Context API
- Consistent color scheme defined in constants/Colors.ts with theme-aware colors
- Automatic theme switching based on system preferences

### Development Workflow

1. **Adding New Features:**
   - Create feature branch from master
   - Update relevant Redux slice if state changes needed
   - Add new screens in appropriate directory (tabs/modals/details/onboarding)
   - Update navigation if new routes added
   - Test on both iOS and Android

2. **State Updates:**
   - All state mutations go through Redux actions
   - Use Redux Toolkit's createSlice for type safety
   - Persist configuration is in redux/store.ts
   - State shape is fully typed in types/

3. **Component Development:**
   - Keep components in app/components/ for reusability
   - Use TypeScript for all components
   - Follow existing patterns for styling and props
   - Implement responsive design using provided utilities
   - Use themed components from ThemedComponents.tsx for consistent styling
   - Implement theme awareness using useTheme hook

### Important Technical Details

**Authentication & User Flow:**
- Clerk authentication service integration with OAuth support
- Google OAuth fully implemented and configured
- Simplified login flow with OAuth-only authentication
- Auth state managed in userSlice with provider tracking
- Protected routes handled by Expo Router with ClerkProvider
- Token management and secure storage via Clerk
- Smart routing: new users → onboarding → main app
- Onboarding completion tracking in expenseSlice

**Data Persistence:**
- All app data stored locally via Redux Persist
- Uses AsyncStorage as storage engine
- Firebase integration configured for future backend features
- Secure token storage via Expo SecureStore and Clerk
- Data migrations handled in Redux Persist config

**Currency Support:**
- Multiple currencies supported (USD, EUR, GBP, INR, JPY, CNY, AUD, CAD)
- Custom formatting with denomination support (K, M, B)
- Currency symbol positioning based on locale

**Base Budget Mode Implementation:**
- `useBaseBudget`: Boolean flag in budgetSlice controlling budget calculation mode
- `categoryLimits`: Object mapping category IDs to individual spending limits
- **Budget Calculation Logic**: Switches between percentage-based (income * 50%) and limit-based (sum of category limits)
- **State Management**: Category limits are automatically cleared when switching back to percentage mode
- **Visual Indicators**: Gold coin badges (💰) and "Base Budget Mode" text shown when active
- **Progress Tracking**: Individual category progress bars calculated against their specific limits
- **Over-Limit Alerts**: Red progress bars and warning text when spending exceeds category limits

**Performance Considerations:**
- Use React.memo for expensive components
- Animations use react-native-reanimated with expo-linear-gradient
- Images optimized with expo-image
- Lazy loading for modals and detail screens
- Theme switching optimized with context and reduced re-renders
- UI blur effects using expo-blur for enhanced visual performance

### Key Dependencies

**Authentication & Services:**
- `@clerk/clerk-expo`: Authentication service with OAuth support
- `firebase`: Backend integration and analytics
- `expo-secure-store`: Secure token storage

**UI & Theming:**
- `expo-linear-gradient`: Enhanced gradient support for UI elements
- `expo-blur`: UI blur effects for visual enhancements
- `react-native-svg`: SVG support for custom graphics and icons

**Navigation & State:**
- `@react-navigation/*`: Enhanced navigation with bottom tabs and elements
- `@reduxjs/toolkit`: State management with Redux Persist integration

### Active Development Areas

Recent completions:
- **Base Budget Mode for Needs Category**: Implemented alternative budgeting approach with individual category limits
- Category limit setting and management functionality
- Visual indicators for base budget mode across all relevant components

Current development priorities:
- Currency denomination formatting (testing phase)
- Categories modal improvements
- Savings category management
- Theme system enhancements and customization
- Premium features implementation (see PREMIUM_FEATURES_ROADMAP.md)
- Firebase backend integration planning

### Testing Approach

Currently no automated tests are configured. When implementing tests:
- Use Jest with React Native Testing Library
- Focus on Redux logic and utility functions
- Test critical user flows (add expense, budget calculations)
- Ensure responsive utilities work across device sizes