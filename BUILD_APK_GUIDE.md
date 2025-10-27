# 📱 How to Build APK for GYMEZ

## 🚀 **Quick Start - Build APK**

### **Method 1: Expo EAS Build (Recommended)**

#### **Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

#### **Step 2: Login to Expo**
```bash
eas login
```

#### **Step 3: Configure EAS**
```bash
eas build:configure
```

#### **Step 4: Build APK**
```bash
# Build APK for Android
eas build --platform android --profile preview

# Or build AAB for Play Store
eas build --platform android --profile production
```

#### **Step 5: Download APK**
- You'll get a link in terminal
- Or check: https://expo.dev/accounts/[your-account]/builds

---

### **Method 2: Local Development Build**

#### **Step 1: Install Android Studio**
- Download from: https://developer.android.com/studio
- Install Android SDK, Platform Tools

#### **Step 2: Create Android Folder**
```bash
npx expo prebuild --platform android
```

#### **Step 3: Build APK**
```bash
# Navigate to android folder
cd android

# Build debug APK
./gradlew assembleDebug

# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk

# Build release APK (unsigned)
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

#### **Step 4: Sign APK (For Release)**
```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore gymez-release-key.keystore -alias gymez -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore gymez-release-key.keystore app-release-unsigned.apk gymez

# Or use Android Studio to sign
```

---

### **Method 3: React Native CLI (Alternative)**

#### **Step 1: Create Native Project**
```bash
# If you don't have android folder
npx expo prebuild --platform android
```

#### **Step 2: Build**
```bash
# From android folder
cd android
./gradlew assembleRelease
```

---

## ⚙️ **Environment Setup**

### **Before Building:**

1. **Install Dependencies**
```bash
npm install
```

2. **Install Android Studio**
- Download: https://developer.android.com/studio
- Install: SDK, Platform Tools, Build Tools

3. **Set Environment Variables**
```bash
# Add to ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

4. **Reload Shell**
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

---

## 📝 **Configuration Files**

### **app.json** (Already Configured)
```json
{
  "expo": {
    "name": "GYMEZ",
    "slug": "gymez",
    "version": "1.0.0",
    "android": {
      "package": "com.gymez.app",
      "versionCode": 1
    }
  }
}
```

### **android/app/build.gradle** (Auto-generated)
- Check for signing configs
- Ensure minSdkVersion >= 23
- Ensure targetSdkVersion >= 33

---

## 🎯 **Step-by-Step: Build APK Now**

### **Fastest Method (5 minutes):**

```bash
# 1. Make sure you're in project root
cd /Users/tushardhananjaypathak/Desktop/GYMEZ

# 2. Install EAS CLI (if not installed)
npm install -g eas-cli

# 3. Login to Expo
eas login

# 4. Build APK
eas build --platform android --profile preview --local

# This will build locally and output APK to: 
# ~/expo-builds/[project-name]/[build-id].apk
```

### **Or Use Expo Online Build:**

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Build (cloud build)
eas build --platform android --profile preview

# 4. Download link will appear in terminal
# Takes ~15-20 minutes
```

---

## 📦 **APK File Locations**

### **After Building:**

#### **Local Build:**
```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

#### **EAS Build:**
```
Check terminal for download link
Or: expo.dev → Your account → Builds
```

---

## 🛠️ **Troubleshooting**

### **Error: "ANDROID_HOME not set"**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### **Error: "JAVA_HOME not set"**
```bash
# Find Java location
/usr/libexec/java_home -V

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home)
```

### **Error: "SDK not found"**
- Open Android Studio
- Go to SDK Manager
- Install: SDK, Build Tools, Platform Tools

### **Error: "Metro bundler issues"**
```bash
# Clear cache
npx expo start -c

# Or reset
npm start -- --reset-cache
```

---

## 📱 **Install APK**

### **On Android Device:**

#### **Method 1: Transfer and Install**
```bash
# Connect device via USB
# Enable Developer Options and USB Debugging

# Transfer APK
adb install app-debug.apk

# Or transfer to device and install manually
```

#### **Method 2: Direct Install**
```bash
# Build and install directly
npx expo run:android

# This builds and installs on connected device
```

---

## 🎯 **Quick Commands**

```bash
# Build debug APK locally
cd android && ./gradlew assembleDebug

# Build release APK
cd android && ./gradlew assembleRelease

# Install on device
adb install app-debug.apk

# Build with EAS
eas build --platform android --profile preview

# Start development server
npm start
```

---

## ✅ **Your APK Will Have:**

- ✅ All 50+ features
- ✅ PR tracking system
- ✅ Social features (5 reactions, stories)
- ✅ Gym community
- ✅ Gamification (streaks, goals)
- ✅ NYC gyms integration
- ✅ Full Supabase support
- ✅ Modern UI

---

## 📝 **Summary**

### **Easiest Way:**
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### **Local Way:**
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

**APK will be ready in ~5-20 minutes!** 🚀

