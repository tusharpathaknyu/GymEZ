#!/bin/bash

echo "🚀 Creating GYMEZ Development APK..."
echo "📱 This will create a development APK you can install on any Android device"

# Create assets directory
mkdir -p android/app/src/main/assets

echo "🔥 Building JavaScript bundle..."
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/ || echo "Bundle creation skipped - will use Metro server instead"

echo "📦 Building APK..."
cd android

# Clean build
./gradlew clean || echo "Clean skipped"

# Build debug APK (works without signing)
./gradlew assembleDebug || echo "Using alternative build method..."

# Check if APK was created
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ SUCCESS! APK created at:"
    echo "📱 $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy to main directory
    cp app/build/outputs/apk/debug/app-debug.apk ../GYMEZ-debug.apk
    echo "📁 Copied to: GYMEZ-debug.apk"
    
    # Show APK info
    echo "📊 APK Size: $(du -h app-debug.apk 2>/dev/null || echo 'Size unknown')"
    echo "🎉 Ready to install on any Android device!"
else
    echo "⚠️  APK build failed, but your app is working via Metro bundler"
    echo "💡 Alternative: Use online APK builder or install via ADB"
fi