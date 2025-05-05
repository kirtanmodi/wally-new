# Wally - Personal Finance Assistant

Wally is a mobile app that helps users track their expenses, set budgets, and manage their finances with ease.

## Features

- 💰 **Expense Tracking**: Log and categorize your expenses
- 📊 **Budget Management**: Create and monitor spending limits
- 📈 **Financial Analytics**: View spending patterns and trends
- 👤 **User Profiles**: Customize your experience
- 🔔 **Notifications**: Get alerts for budget limits and financial goals
- 🔒 **Privacy Settings**: Control your data security preferences
- 🔐 **Authentication**: Login with email or Google account

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

### Google Authentication

To set up Google authentication:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the OAuth consent screen
3. Create OAuth 2.0 Client IDs for iOS, Android, and Web
4. Update the client IDs in `app/services/AuthService.ts`

For detailed instructions, see [Google Authentication Setup](app/services/GoogleAuthREADME.md).

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
  - `(tabs)/` - Main tab screens
  - `(modals)/` - Modal screens
  - `(details)/` - Detail screens
  - `services/` - Application services
- `redux/` - State management
- `assets/` - Images and other static assets
- `components/` - Reusable UI components

## Technologies Used

- React Native
- Expo
- Redux Toolkit
- Expo Router
- TypeScript
