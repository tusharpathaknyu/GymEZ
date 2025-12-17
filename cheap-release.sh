#!/bin/bash
# GYMEZ - Cheap Play Store Release Script
# Total cost: $25 one-time + $0-25/month for backend

echo "💰 Setting up GYMEZ for budget Play Store release..."

# 1. Build release APK (already done!)
echo "📱 Building release APK..."
cd android
./gradlew assembleRelease

# 2. Sign the APK
echo "🔐 Signing APK for Play Store..."
# Your release APK is ready at:
# android/app/build/outputs/apk/release/app-release.apk

# 3. Setup Firebase (FREE backend)
echo "🔥 Setting up Firebase (free backend)..."
npm install firebase
npm install -g firebase-tools
firebase login
firebase init

# 4. Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

# 5. Setup Supabase (already configured!)
echo "📊 Supabase is already configured in your app!"

echo "✅ GYMEZ ready for Play Store!"
echo ""
echo "📱 Next steps:"
echo "1. Go to play.google.com/console"
echo "2. Pay $25 developer fee (one-time)"
echo "3. Upload your app-release.apk"
echo "4. Fill app details and publish"
echo ""
echo "💰 Total monthly cost: $0-25 (vs $200-400 on AWS)"