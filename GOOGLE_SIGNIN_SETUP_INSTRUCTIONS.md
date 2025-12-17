# Google Sign-In Setup Instructions

## ✅ What Was Fixed

1. **Disabled Demo Mode**: Changed `USE_DEMO_GOOGLE_SIGNIN` to `false`
2. **Added Google Services Plugin**: Configured Google Services in Android build files
3. **Improved Error Handling**: Added better logging and error messages

## 📋 Required Steps to Enable Real Google Sign-In

### Step 1: Register SHA-1 Fingerprint in Google Cloud Console

Your app's SHA-1 fingerprint is:
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**To register it:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Android** as the application type
6. Enter:
   - **Package name**: `com.gymez.app`
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
7. Click **Create**

### Step 2: Verify Web Client ID

The current Web Client ID in the code is:
```
895230403778-7a4klalvtmjr7iokdqrj17e7pdirli5p.apps.googleusercontent.com
```

**To verify/find your Web Client ID:**

1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Find or create an **OAuth 2.0 Client ID** of type **Web application**
3. Copy the **Client ID** (it should end with `.apps.googleusercontent.com`)
4. Update it in:
   - `src/services/auth.tsx` (line 14)
   - `src/services/GoogleAuthService.ts` (line 32)

### Step 3: Enable Google Sign-In API

1. Go to **APIs & Services** > **Library**
2. Search for **Google Sign-In API**
3. Click **Enable** (if not already enabled)

### Step 4: Update google-services.json

Make sure your `android/app/google-services.json` file has:
- Correct project number
- Correct package name (`com.gymez.app`)
- Valid OAuth client configurations

If you need to regenerate it:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Your apps**
4. Add/select Android app
5. Download `google-services.json`
6. Replace the file in `android/app/google-services.json`

### Step 5: Rebuild the App

After making changes, rebuild:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 🔍 Troubleshooting

### Error: "DEVELOPER_ERROR"
- **Cause**: SHA-1 fingerprint mismatch
- **Fix**: Verify SHA-1 is correctly registered in Google Cloud Console

### Error: "10" or "SIGN_IN_FAILED"
- **Cause**: Invalid or missing Web Client ID
- **Fix**: Verify Web Client ID matches the one in Google Cloud Console

### Error: "PLAY_SERVICES_NOT_AVAILABLE"
- **Cause**: Google Play Services not installed/updated on emulator
- **Fix**: Use an emulator with Google Play Services, or test on a physical device

### Check Current SHA-1

To verify your current SHA-1:
```bash
cd android
./gradlew signingReport
```

Look for the SHA1 value under the "debug" variant.

## 📱 Testing

1. Make sure the app is rebuilt with the new configuration
2. Tap the Google Sign-In button
3. You should see the Google Sign-In popup (not the demo alert)
4. Select your Google account
5. Grant permissions
6. You should be signed in successfully

## 🔐 Important Notes

- **SHA-1 for Release**: When building a release APK, you'll need to register the release keystore's SHA-1 fingerprint separately
- **Production**: Make sure to use production Google Cloud Console credentials, not test/demo ones
- **Security**: Never commit sensitive credentials to version control

