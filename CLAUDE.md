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
- `budgetSlice`: Budget configuration (50/30/20 percentages), categories, currency settings
- `expenseSlice`: All expense data and management
- `appSlice`: App-wide settings, comprehensive theme system, notifications

### Navigation Structure
Uses Expo Router with file-based routing:
- `(auth)`: Login/signup screens (shown when not authenticated)
- `(tabs)`: Main app tabs (overview, analytics, profile, settings)
- `(modals)`: Modal screens (add-expense, edit-expense, notifications, privacy, theme-demo)
- `(details)`: Detail screens for budget categories (needs, savings, wants)

### Key Features Implementation

**Budget Management:**
- Implements customizable 50/30/20 budgeting rule
- Categories: Needs (essentials), Savings, Wants (lifestyle)
- Each category has customizable subcategories
- Income-based budget recommendations with progressive scaling

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

### Component Architecture

**Key Components:**
- `AnimatedCategoryCircle`: SVG-based circular progress indicator for budget visualization
- `BudgetCategoryBox`: Interactive category display with progress bars
- `ExpenseItem`: Individual expense display with swipe-to-delete
- `SavingsGoalCard`: Goal progress visualization
- `AddExpenseModal`: Main expense entry interface

**Theme System Components:**
- `ThemeProvider`: Context provider for theme management with status bar integration
- `ThemeSettings`: Complete theme settings UI with light/dark/system options
- `ThemeToggle`: Toggle component with compact variant for theme switching
- `ThemedComponents`: Comprehensive themed component library (Text, View, Card, TextInput, Button, Separator)

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
   - Add new screens in appropriate directory (tabs/modals/details)
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

**Authentication:**
- Clerk authentication service integration with OAuth support
- Google OAuth fully implemented and configured
- Simplified login flow with OAuth-only authentication
- Auth state managed in userSlice with provider tracking
- Protected routes handled by Expo Router with ClerkProvider
- Token management and secure storage via Clerk

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

Refer to TASKS.md for current development priorities:
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