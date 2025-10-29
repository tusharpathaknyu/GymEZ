# Google Sign-In Setup Guide for GYMEZ

## Overview
This guide explains how to set up Google Sign-In for the GYMEZ fitness app. The app currently includes a demo/mock implementation that works without actual Google configuration.

## Quick Start (Demo Mode)
The app is already configured to work in demo mode with mock Google authentication. No additional setup is required for testing.

## Production Setup (Real Google Sign-In)

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### Step 2: Enable Google Sign-In API
1. Go to the [Google Cloud Console APIs & Services](https://console.cloud.google.com/apis/credentials)
2. Enable the "Google Sign-In API"
3. Enable the "Google+ API" (if required)

### Step 3: Create OAuth 2.0 Credentials
1. Go to Credentials in the Google Cloud Console
2. Create credentials → OAuth 2.0 Client IDs
3. Create two client IDs:
   - **Android Client ID**: Use your app's package name (`com.gymez.app`) and SHA-1 certificate fingerprint
   - **Web Client ID**: For server-side authentication

### Step 4: Get Your SHA-1 Certificate Fingerprint
For debug builds, run:
```bash
cd android
./gradlew signingReport
```

For release builds, use your keystore's fingerprint.

### Step 5: Download google-services.json
1. Download the `google-services.json` file from the Google Cloud Console
2. Replace the template file at `android/app/google-services.json` with your actual file

### Step 6: Update Configuration
1. Update `src/services/GoogleAuthService.ts`:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
     offlineAccess: true,
   });
   ```

### Step 7: Android Configuration
The Android configuration is already set up:
- `android/app/build.gradle` includes Google Services plugin
- `android/build.gradle` includes Google Services classpath
- `AndroidManifest.xml` has required permissions

### Step 8: iOS Setup (if needed)
For iOS support, you'll need:
1. `GoogleService-Info.plist` from Firebase Console
2. URL schemes configuration
3. iOS client ID configuration

## Current Implementation Features

### Demo Mode (Default)
- Mock Google authentication with realistic user data
- No external dependencies or configuration required
- Perfect for development and testing

### Production Mode
- Real Google Sign-In integration
- Proper OAuth 2.0 flow
- Server-side token validation support

## Security Notes
- Never commit real `google-services.json` files to version control
- Use environment-specific configurations for different builds
- Validate tokens server-side for production applications

## Troubleshooting

### Common Issues
1. **"Play Services not available"**: Use an emulator with Google Play Services or a real device
2. **"DEVELOPER_ERROR"**: Check your SHA-1 fingerprint and package name match
3. **"Sign-in cancelled"**: Normal behavior when user cancels the flow

### Fallback Behavior
The app automatically falls back to mock authentication when:
- Google Play Services are not available
- Configuration is invalid
- Network issues occur

This ensures the app always works, even without proper Google Sign-In setup.

## Testing
1. **Demo Mode**: Works immediately, no setup required
2. **Real Google Sign-In**: Requires Google Cloud project and proper configuration
3. **Emulator**: Use an emulator with Google Play Services for real Google Sign-In testing

## Files Modified for Google Sign-In Integration
- `src/services/GoogleAuthService.ts` - Main Google Sign-In service
- `src/screens/AuthScreen.tsx` - UI integration with GoogleSigninButton
- `android/app/google-services.json` - Google Services configuration (template)
- This setup guide

The implementation prioritizes developer experience with automatic fallbacks while supporting production-ready Google Sign-In when properly configured.