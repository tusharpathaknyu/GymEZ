# Google Sign-In Configuration for GYMEZ

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### 2. Create OAuth 2.0 Credentials

#### For Android:
1. Select "Android" as application type
2. Enter package name: `com.gymez` (or your package name)
3. Get SHA-1 certificate fingerprint:
   ```bash
   # Debug certificate (for development)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Release certificate (for production)
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
4. Enter the SHA-1 fingerprint
5. Create the credential

#### For iOS:
1. Select "iOS" as application type
2. Enter bundle identifier: `com.gymez` (or your bundle ID)
3. Create the credential

#### Web Client (Required for React Native):
1. Select "Web application" as application type
2. No restrictions needed for mobile apps
3. Create the credential - **This is your Web Client ID**

### 3. Configure Your App

1. Open `src/services/auth.tsx`
2. Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID_HERE', 
     offlineAccess: true,
   });
   ```

### 4. Platform-Specific Setup

#### Android Configuration:
Add to `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="server_client_id">YOUR_WEB_CLIENT_ID</string>
</resources>
```

#### iOS Configuration:
1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to your iOS project in Xcode
3. Add URL scheme to `ios/gymez/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>googleSignIn</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

### 5. Supabase Configuration

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Providers
3. Enable Google provider
4. Enter your Google OAuth credentials:
   - Client ID (Web)
   - Client Secret
5. Add your app's redirect URLs

### 6. Testing

Test Google Sign-In with different scenarios:
- ✅ New user sign-up via Google
- ✅ Existing user sign-in via Google  
- ✅ Account linking
- ✅ Error handling (cancelled, no internet, etc.)

## Important Notes

- **Web Client ID**: This is the most important credential for React Native
- **Security**: Never commit actual credentials to version control
- **Testing**: Use debug certificates for development
- **Production**: Generate release certificates for app store builds

## Environment Variables

Consider using environment variables for credentials:

```typescript
// .env
GOOGLE_WEB_CLIENT_ID=your_web_client_id_here

// auth.tsx
import Config from 'react-native-config';

GoogleSignin.configure({
  webClientId: Config.GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});
```

## Troubleshooting

**Common Issues:**
- "DEVELOPER_ERROR": Wrong SHA-1 certificate fingerprint
- "SIGN_IN_FAILED": Web Client ID not configured correctly  
- "NETWORK_ERROR": Check internet connection and API enablement
- "PLAY_SERVICES_NOT_AVAILABLE": Update Google Play Services

**Debug Steps:**
1. Verify Web Client ID is correct
2. Check SHA-1 fingerprint matches
3. Ensure Google+ API is enabled
4. Verify Supabase Google provider is configured
5. Check bundle ID / package name matches