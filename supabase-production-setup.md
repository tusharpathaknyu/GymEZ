# 🚀 GYMEZ Production Database Setup Script

## Step 1: Copy This Complete SQL Schema

**Go to your Supabase project → SQL Editor → New Query**
**Copy and paste this ENTIRE script:**

```sql
-- ============================================
-- GYMEZ PRODUCTION DEPLOYMENT SCRIPT
-- ============================================
-- This sets up your complete GYMEZ database in Supabase Cloud
-- Run this ONCE in your production Supabase project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- CUSTOM TYPES
-- ============================================

DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('gym_member', 'gym_owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE exercise_type AS ENUM ('benchpress', 'squat', 'deadlift', 'pullup', 'pushup', 'dip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE challenge_type AS ENUM ('pr_based', 'consistency', 'total_volume', 'duration');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE badge_type AS ENUM ('pr_milestone', 'consistency', 'challenge_winner', 'social', 'special');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    user_type user_type NOT NULL DEFAULT 'gym_member',
    gym_id UUID,
    username TEXT UNIQUE,
    bio TEXT,
    profile_picture TEXT,
    gym_start_date DATE,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gyms table
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    description TEXT,
    facilities TEXT[],
    membership_cost DECIMAL(10, 2),
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal Records table
CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    exercise_type exercise_type NOT NULL,
    weight DECIMAL(5, 2),
    reps INTEGER,
    one_rep_max DECIMAL(5, 2),
    video_id UUID,
    is_approved BOOLEAN DEFAULT false,
    gym_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'general',
    video_id UUID,
    pr_id UUID,
    gym_id UUID,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Post Comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    duration INTEGER,
    exercise_type exercise_type,
    weight DECIMAL(5, 2),
    reps INTEGER,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    gym_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    muscle_groups TEXT[],
    equipment TEXT[],
    instructions TEXT,
    difficulty difficulty_level DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    challenge_type challenge_type NOT NULL,
    target_value DECIMAL(10, 2),
    target_unit TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    points_reward INTEGER DEFAULT 100,
    badge_reward UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Stats table
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY,
    gym_start_date DATE,
    total_workouts INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    prs_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_gym_id ON profiles(gym_id);
CREATE INDEX IF NOT EXISTS idx_gyms_owner_id ON gyms(owner_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise_type ON personal_records(exercise_type);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_gym_id ON posts(gym_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_is_approved ON videos(is_approved);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Personal Records policies
CREATE POLICY "PRs are viewable by everyone" ON personal_records FOR SELECT USING (true);
CREATE POLICY "Users can create own PRs" ON personal_records FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Videos policies
CREATE POLICY "Approved videos are viewable by everyone" ON videos FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create own videos" ON videos FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample exercises
INSERT INTO exercises (name, category, muscle_groups, equipment, instructions, difficulty) VALUES
('Bench Press', 'chest', ARRAY['chest', 'triceps'], ARRAY['barbell', 'bench'], 'Lie on bench, lower bar to chest, press up', 'intermediate'),
('Squat', 'legs', ARRAY['quadriceps', 'glutes'], ARRAY['barbell', 'squat rack'], 'Stand with bar on shoulders, squat down, stand up', 'intermediate'),
('Deadlift', 'back', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['barbell'], 'Lift bar from floor to hip level', 'advanced'),
('Pull-up', 'back', ARRAY['lats', 'biceps'], ARRAY['pull-up bar'], 'Hang from bar, pull body up until chin over bar', 'intermediate'),
('Push-up', 'chest', ARRAY['chest', 'triceps'], ARRAY['bodyweight'], 'Lower body to floor, push back up', 'beginner'),
('Dip', 'chest', ARRAY['chest', 'triceps'], ARRAY['dip bars'], 'Lower body between bars, push back up', 'intermediate')
ON CONFLICT (name) DO NOTHING;

-- Insert sample challenges
INSERT INTO challenges (name, description, challenge_type, target_value, target_unit, start_date, end_date, points_reward) VALUES
('January PR Challenge', 'Set a new personal record in any exercise', 'pr_based', 1, 'pr', '2025-01-01', '2025-01-31', 500),
('Consistency King', 'Work out 20 days this month', 'consistency', 20, 'workouts', '2025-01-01', '2025-01-31', 300),
('Volume Beast', 'Lift 50,000 lbs total this month', 'total_volume', 50000, 'lbs', '2025-01-01', '2025-01-31', 400)
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR REAL-TIME FEATURES
-- ============================================

-- Function to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update followers count
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_stats SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
        UPDATE user_stats SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_stats SET followers_count = followers_count - 1 WHERE user_id = OLD.following_id;
        UPDATE user_stats SET following_count = following_count - 1 WHERE user_id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_followers_count
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_followers_count();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'GYMEZ database setup complete! 🏋️‍♀️ Ready for production!' as status;
```

## Step 2: Set Up Storage Buckets

**Go to Storage in your Supabase dashboard and create these buckets:**

1. **workout-videos** (for PR videos)
   - Public: false
   - Allowed MIME types: video/mp4, video/quicktime
   - Max file size: 100MB

2. **profile-pictures** (for user avatars)
   - Public: true  
   - Allowed MIME types: image/jpeg, image/png
   - Max file size: 5MB

## Step 3: Configure Authentication

**Go to Authentication → Providers:**

1. **Enable Email provider** ✅
2. **Enable Google provider** ✅
   - Client ID: `895230403778-7a4klalvtmjr7iokdqrj17e7pdirli5p.apps.googleusercontent.com`
   - Client Secret: `[get from Google Console]`

## 🎉 Your production database is now ready!

**Free tier includes:**
- ✅ 50,000 monthly active users
- ✅ 500MB database storage  
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ Real-time subscriptions
- ✅ Row Level Security

**Perfect for launching GYMEZ! 🚀**