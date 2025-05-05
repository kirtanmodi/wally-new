# Google Authentication Setup

This README file describes how to properly set up Google Authentication for your Wally app.

## Prerequisites

1. A Google Developer account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down the Project ID

## Step 2: Configure OAuth Consent Screen

1. In your Google Cloud project, navigate to "APIs & Services" > "OAuth consent screen"
2. Select the appropriate user type (External or Internal)
3. Fill in the required application information:
   - App name: Wally
   - User support email
   - Developer contact information
4. Add the following scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
5. Add any test users if using External user type
6. Complete the registration

## Step 3: Create OAuth 2.0 Client IDs

### For iOS:

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "iOS" as the application type
4. Provide a name (e.g., "Wally iOS Client")
5. Enter your iOS Bundle ID (must match the `bundleIdentifier` in app.json)
6. Save and note the Client ID

### For Android:

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Android" as the application type
4. Provide a name (e.g., "Wally Android Client")
5. Enter your Android Package Name (must match the `package` in app.json)
6. Generate and provide a SHA-1 certificate fingerprint
   - You can generate this using: `keytool -list -v -keystore path_to_keystore -alias upload_key`
7. Save and note the Client ID

### For Web (also used for Expo development):

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Provide a name (e.g., "Wally Web Client")
5. Add authorized JavaScript origins:
   - `https://auth.expo.io`
   - (Add your production domains if applicable)
6. Add authorized redirect URIs:
   - `https://auth.expo.io/@your-expo-username/wally`
   - (Add your production redirect URIs if applicable)
7. Save and note the Client ID

## Step 4: Update the AuthService.ts File

Replace the placeholder values in the `AuthService.ts` file with your actual Client IDs:

```typescript
const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_WEB = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
```

## Step 5: Create Google Icon

Place a Google logo image file named `google.png` in the `assets/images` folder to be used for the sign-in buttons.

## Step 6: Testing Authentication

1. Run your application in development mode
2. Test the Google sign-in functionality on both the login and signup screens
3. Verify that the authentication flow works correctly and user information is properly stored in Redux

## Step 7: Production Considerations

Before publishing your app:

1. Verify that your OAuth configuration is set to production (not just for testing)
2. Add your production domains and redirect URIs to the Google Cloud Console
3. Test the authentication flow on actual devices
4. Implement proper error handling and user feedback

## Troubleshooting

If you encounter authentication issues:

1. Check that the bundle ID/package name in your app matches what's in the Google Cloud Console
2. Verify that you've added the correct redirect URIs
3. Make sure the OAuth consent screen is properly configured
4. Check Expo logs for any authentication-related errors 