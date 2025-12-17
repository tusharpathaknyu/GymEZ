# 🚀 GYMEZ Supabase Cloud Deployment Guide

## Step 1: Create Production Supabase Project

1. **Go to supabase.com and create account/login**
2. **Click "New Project"**
   - Name: `GYMEZ-Production`
   - Database Password: `[generate strong password]`
   - Region: `US East (N. Virginia)` (closest to users)

## Step 2: Get Your Production Credentials

After project is created, go to **Settings → API**:

```bash
# Copy these values:
Project URL: https://[your-project-id].supabase.co
Project API Key (anon): [your-anon-key]
Project API Key (service_role): [your-service-role-key]
```

## Step 3: Update Your App Configuration

Replace in `src/services/supabase.ts`:

```typescript
// OLD (local development)
const supabaseUrl = 'https://rdnvcapwgfmwngkxmqnc.supabase.co';
const supabaseAnonKey = 'your-current-key';

// NEW (production)
const supabaseUrl = 'https://[your-new-project-id].supabase.co';
const supabaseAnonKey = '[your-new-anon-key]';
```

## Step 4: Set Up Database Schema

In Supabase Dashboard → **SQL Editor**, run this to create your tables:

```sql
-- Copy your complete database schema here
-- (I'll generate this from your existing setup)
```

## Step 5: Configure Authentication

In Supabase Dashboard → **Authentication → Providers**:
- ✅ Enable Email provider
- ✅ Enable Google provider 
  - Add your Google OAuth credentials
  - Client ID: `895230403778-7a4klalvtmjr7iokdqrj17e7pdirli5p.apps.googleusercontent.com`

## Step 6: Set Up Storage

In Supabase Dashboard → **Storage**:
- Create bucket: `workout-videos`
- Create bucket: `profile-pictures`
- Configure public access for necessary files

## Step 7: Deploy & Test

1. Update your React Native app with new credentials
2. Build and test the app
3. Deploy to Play Store

## 💰 Cost: $0/month (Free tier handles 50,000 users!)

---

**Ready to start? I'll help you with each step!**