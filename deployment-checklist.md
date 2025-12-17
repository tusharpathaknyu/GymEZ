# ✅ GYMEZ Supabase Production Deployment Checklist

## 🎯 Pre-Deployment (5 minutes)

1. **Create Supabase Project**
   - [ ] Go to supabase.com → Create new project
   - [ ] Name: `GYMEZ-Production`
   - [ ] Choose region: `US East (N. Virginia)`
   - [ ] Set database password (save it!)

2. **Get Credentials**
   - [ ] Go to Settings → API
   - [ ] Copy Project URL: `https://[project-id].supabase.co`
   - [ ] Copy anon public key
   - [ ] Copy service_role key (keep private!)

## 🗄️ Database Setup (10 minutes)

3. **Run Database Script**
   - [ ] Open Supabase dashboard → SQL Editor
   - [ ] Copy entire script from `supabase-production-setup.md`
   - [ ] Run the script (creates all tables, indexes, policies)
   - [ ] Verify: Check Tables tab - should see ~12 tables

## 🔐 Authentication Setup (5 minutes)

4. **Configure Auth Providers**
   - [ ] Go to Authentication → Providers
   - [ ] Enable Email ✅
   - [ ] Enable Google ✅
     - Client ID: `895230403778-7a4klalvtmjr7iokdqrj17e7pdirli5p.apps.googleusercontent.com`
     - Client Secret: [Get from Google Console]

## 📁 Storage Setup (3 minutes)

5. **Create Storage Buckets**
   - [ ] Go to Storage → Create bucket
   - [ ] Create `workout-videos` (private)
   - [ ] Create `profile-pictures` (public)
   - [ ] Set file size limits and MIME types

## 📱 App Configuration (2 minutes)

6. **Update React Native App**
   - [ ] Replace `src/services/supabase.ts` with production config
   - [ ] Update supabaseUrl with your project URL
   - [ ] Update supabaseAnonKey with your anon key
   - [ ] Test authentication works

## 🚀 Build & Deploy (10 minutes)

7. **Build Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   - [ ] APK created successfully
   - [ ] Test app on device/emulator
   - [ ] Verify data syncs to Supabase cloud

8. **Upload to Play Store**
   - [ ] Go to Google Play Console
   - [ ] Upload APK to Internal Testing first
   - [ ] Test with real users
   - [ ] Promote to Production when ready

## 💰 Cost Monitoring

9. **Set Up Billing Alerts**
   - [ ] Go to Supabase → Settings → Billing
   - [ ] Set usage alerts at 80% of free tier
   - [ ] Monitor database size and bandwidth

## ✅ Post-Deployment Verification

10. **Test Core Features**
    - [ ] User registration/login works
    - [ ] Google Sign-In works
    - [ ] Posts/social feed updates
    - [ ] Video upload works
    - [ ] Real-time features work
    - [ ] Data persists correctly

## 📊 Free Tier Limits (Monitor These)

- **Database**: 500MB (handles ~10K users)
- **Storage**: 1GB (for videos/images)
- **Bandwidth**: 2GB/month
- **Auth users**: 50,000/month
- **Realtime**: Unlimited connections

## 🎉 You're Live!

**Total Time**: ~30 minutes  
**Total Cost**: $0/month (free tier)  
**Supports**: 10,000+ users easily  

**Your GYMEZ fitness app is now running on production Supabase! 🏋️‍♂️**

---

**Need help?** Check these resources:
- 📖 [Supabase Docs](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)

**Ready for scale?** Upgrade to Pro ($25/month) when you hit:
- 500MB database limit
- 1GB storage limit  
- 50K monthly active users