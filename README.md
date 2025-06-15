# Wally - Personal Finance Assistant

Wally is a mobile app that helps users track their expenses, set budgets, and manage their finances with ease.

## Features

- 🎯 **Smart Onboarding**: Guided 5-step setup for new users with progressive disclosure
- 💰 **Expense Tracking**: Log and categorize your expenses
- 📊 **Budget Management**: Create and monitor spending limits with 50/30/20 rule
- 🎛️ **Base Budget Mode**: Alternative budgeting approach with individual category limits for Needs
- 💸 **Savings Goals**: Set financial goals with automatic contribution calculation
- 📈 **Financial Analytics**: View spending patterns and trends
- 👤 **User Profiles**: Customize your experience with comprehensive theme system
- 🎨 **Theme System**: Light/dark/system theme support with automatic switching
- 🌍 **Multi-Currency**: Support for multiple currencies with smart denomination formatting
- 🔔 **Notifications**: Get alerts for budget limits and financial goals
- 🔒 **Privacy Settings**: Control your data security preferences
- 🔐 **OAuth Authentication**: Secure login with Clerk and Google OAuth

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Run on iOS simulator:
   ```
   npm run ios
   ```

4. Run on Android emulator:
   ```
   npm run android
   ```

## Authentication Setup

The app uses Clerk for authentication with OAuth support.

### Clerk Configuration

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Set up your Clerk application
3. Configure OAuth providers (Google) in the Clerk dashboard
4. Add Clerk publishable key to your environment

### Google OAuth Setup

Google OAuth is integrated through Clerk:
1. Configure Google OAuth in your Clerk dashboard
2. Clerk handles all OAuth flows and token management
3. Users can sign in with Google through the simplified login screen

## Environment Configuration

The app supports three environments:

- **Development**: For local development with hot reloading
- **Preview**: For internal testing before release
- **Production**: For app store releases

## Publishing the App

### Build Configuration

This app uses Expo Application Services (EAS) for building and publishing. The configuration is defined in `eas.json`.

### Building a Preview

```
npm run build:preview
```

This creates a build for internal testing distributed through EAS.

### Building for Production

```
npm run build:production
```

This creates a production-ready build for App Store and Google Play submission.

### Submitting to App Stores

For iOS:
```
npm run submit:ios
```

For Android:
```
npm run submit:android
```

### Over-the-Air Updates

After making changes, you can push updates without requiring a new store submission:

```
npm run publish:update
```

## Project Structure

- `app/` - Main application code
  - `(auth)/` - Authentication screens
  - `(onboarding)/` - 5-step user onboarding flow
  - `(tabs)/` - Main tab screens
  - `(modals)/` - Modal screens
  - `(details)/` - Detail screens
  - `services/` - Application services
- `redux/` - State management
- `assets/` - Images and other static assets
- `components/` - Reusable UI components

## User Experience

### First-Time User Flow

1. **Authentication**: Secure login with Google OAuth via Clerk
2. **Onboarding Flow**: 5-step guided setup process
   - Welcome & app overview with 50/30/20 rule explanation
   - Monthly income setup with currency selection
   - Interactive budget allocation customization
   - Category personalization (add/remove/customize)
   - Setup completion with summary and next steps
3. **Main App**: Access to full feature set after onboarding

### Returning User Flow

- Automatic login with saved credentials
- Direct access to main app interface
- All preferences and data restored from local storage

## Technologies Used

- React Native with Expo
- Redux Toolkit with Redux Persist
- Expo Router for navigation
- Clerk for authentication
- Firebase integration
- TypeScript
- React Native SVG for custom graphics
- Expo Linear Gradient for UI enhancements
