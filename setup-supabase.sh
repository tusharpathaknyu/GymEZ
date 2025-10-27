#!/bin/bash

# GYMEZ Supabase Setup Script
# This script helps set up your Supabase project for GYMEZ

echo "🏋️‍♀️ GYMEZ Supabase Setup Assistant"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    touch .env
    echo "SUPABASE_URL=" >> .env
    echo "SUPABASE_ANON_KEY=" >> .env
    echo ""
    echo "⚠️  Please add your Supabase credentials to the .env file:"
    echo "   1. Go to your Supabase project settings"
    echo "   2. Navigate to API section"  
    echo "   3. Copy Project URL and anon public key"
    echo "   4. Update the .env file with your credentials"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo ""
    echo "📦 Supabase CLI not found. Installing..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo "❌ Homebrew not found. Please install Supabase CLI manually:"
            echo "   https://supabase.com/docs/guides/cli"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -L https://github.com/supabase/cli/releases/download/v1.100.1/supabase_1.100.1_linux_amd64.deb -o supabase.deb
        sudo dpkg -i supabase.deb
        rm supabase.deb
    else
        echo "❌ Unsupported OS. Please install Supabase CLI manually:"
        echo "   https://supabase.com/docs/guides/cli"
        exit 1
    fi
else
    echo "✅ Supabase CLI is installed"
fi

echo ""
echo "🗄️ Database Setup Instructions:"
echo "==============================="
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run the following files in order:"
echo "   a) Copy the complete database schema from README.md (Section 3)"
echo "   b) Run gym-sample-data.sql (optional, for sample gyms)"
echo ""
echo "🎯 Next Steps:"
echo "============="
echo "1. Update src/services/supabase.ts with your project credentials"
echo "2. Test the app with 'npm run android' or 'npm run ios'"
echo "3. Create test accounts (gym owner and gym member)"
echo "4. Try the gym selection onboarding flow"
echo ""
echo "📱 Testing Features:"
echo "=================="
echo "• Sign up as gym member → gym selection flow"
echo "• Record videos with PR submission"
echo "• Track personal records across exercises"
echo "• Follow other users and interact with posts"
echo "• Gym owner approval workflow"
echo ""
echo "🚀 Setup complete! Happy coding!"