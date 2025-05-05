# Publishing Checklist for Wally App

Use this checklist to ensure your app is ready for submission to the App Store and Google Play.

## General Preparation

- [ ] Update app version number in `app.json` and `package.json`
- [ ] Test the app on multiple device sizes and orientations
- [ ] Check for performance issues (memory leaks, slow loading)
- [ ] Ensure all external links work correctly
- [ ] Test offline functionality
- [ ] Run linter to check for code issues (`npm run lint`)
- [ ] Create proper app icons and splash screens

## App Store (iOS) Submission

- [ ] Configure iOS-specific settings in `app.json`:
  - [ ] Verify bundleIdentifier is correct (e.g., `com.yourcompany.wally`)
  - [ ] Update buildNumber
  - [ ] Set correct permissions descriptions
- [ ] Prepare App Store screenshots (6.5" iPhone, 5.5" iPhone, iPad 12.9", iPad 10.5")
- [ ] Write compelling App Store description (4000 characters max)
- [ ] Prepare promotional text (170 characters max)
- [ ] Create keywords list (100 characters max, comma-separated)
- [ ] Have a privacy policy URL ready
- [ ] Set content rating information
- [ ] Configure App Store pricing and availability
- [ ] Run final build: `npm run build:production`
- [ ] Submit to App Store: `npm run submit:ios`

## Google Play (Android) Submission

- [ ] Configure Android-specific settings in `app.json`:
  - [ ] Verify package name is correct (e.g., `com.yourcompany.wally`)
  - [ ] Update versionCode
  - [ ] Configure correct permissions
- [ ] Prepare Google Play screenshots (Phone, 7" tablet, 10" tablet)
- [ ] Create feature graphic (1024 x 500 px)
- [ ] Write compelling app description (short and full versions)
- [ ] Prepare privacy policy URL
- [ ] Configure content rating information
- [ ] Set up pricing and distribution countries
- [ ] Run final build: `npm run build:production`
- [ ] Submit to Google Play: `npm run submit:android`

## App Store Optimization (ASO)

- [ ] Research and use relevant keywords
- [ ] Write clear, benefit-focused descriptions
- [ ] Create high-quality screenshots that highlight key features
- [ ] Design an eye-catching app icon
- [ ] Consider localization for key markets

## Post-Launch Preparation

- [ ] Set up app analytics (Firebase, Amplitude, etc.)
- [ ] Configure crash reporting
- [ ] Prepare marketing materials (website, social media)
- [ ] Create a simple user guide or FAQ
- [ ] Set up a support email or contact form

## EAS Configuration

- [ ] Verify EAS Project ID in `app.json`
- [ ] Configure EAS Update channels in `eas.json`
- [ ] Set up EAS secrets for production builds
- [ ] Test OTA updates with `npm run publish:update`

## Final Verification

- [ ] Test the production build on physical devices
- [ ] Verify all authentication flows work correctly
- [ ] Check that push notifications function properly
- [ ] Confirm external services/APIs work in production mode
- [ ] Verify analytics events are being tracked correctly 