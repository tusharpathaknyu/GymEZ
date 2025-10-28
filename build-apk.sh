#!/bin/bash#!/bin/bash



echo "🚀 Creating GYMEZ APK..."# GYMEZ APK Build Script

echo "🏗️  Building GYMEZ APK..."

# Create a minimal working Android build

cd android# Step 1: Fix package.json versions to avoid conflicts

echo "📦 Fixing dependencies..."

# Clean previous builds

echo "🧹 Cleaning previous builds..."# Create a temporary package.json with compatible versions

./gradlew cleancat > package_backup.json << 'EOF'

{

echo "📦 Building debug APK..."  "name": "gymez",

./gradlew assembleDebug  "version": "0.1.0",

  "private": true,

if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then  "scripts": {

    echo "✅ APK created successfully!"    "android": "expo run:android",

    echo "📱 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"    "ios": "expo run:ios",

    echo "📋 APK Size: $(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)"    "start": "expo start",

        "test": "jest"

    # Copy to easy location  },

    cp app/build/outputs/apk/debug/app-debug.apk ../GYMEZ-debug.apk  "dependencies": {

    echo "📁 Copied to: GYMEZ-debug.apk"    "@react-native-async-storage/async-storage": "1.18.2",

else    "@react-navigation/bottom-tabs": "^6.5.11",

    echo "❌ APK build failed"    "@react-navigation/native": "^6.1.9",

fi    "@react-navigation/stack": "^6.3.20",
    "@supabase/supabase-js": "^2.38.4",
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "react-native-gesture-handler": "~2.12.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "react-native-url-polyfill": "^2.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  }
}
EOF

# Step 2: Create minimal app.json
cat > app_simple.json << 'EOF'
{
  "expo": {
    "name": "GYMEZ",
    "slug": "gymez",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["android"],
    "android": {
      "package": "com.gymez.app",
      "versionCode": 1
    }
  }
}
EOF

echo "✅ Build files created!"
echo "🚀 Next steps:"
echo "1. Run: cp package_backup.json package.json"
echo "2. Run: cp app_simple.json app.json" 
echo "3. Run: npm install --legacy-peer-deps"
echo "4. Run: eas build -p android --profile preview"
echo ""
echo "📱 Alternative: Use Expo Snack for quick APK"
echo "   Go to: https://snack.expo.dev"
echo "   Copy your src/ folder contents"
echo "   Download APK directly"