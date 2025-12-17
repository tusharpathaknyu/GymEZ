-- GymEZ Check-in & Rewards System Tables
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. GYM CHECK-INS TABLE
-- Tracks individual gym visits with GPS verification
-- =====================================================
CREATE TABLE IF NOT EXISTS gym_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  verification_method TEXT DEFAULT 'gps',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_gym_checkins_user_id ON gym_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_check_in_time ON gym_checkins(check_in_time);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_user_date ON gym_checkins(user_id, check_in_time);

-- =====================================================
-- 2. MONTHLY REWARDS TABLE
-- Tracks monthly workout count and earned discounts
-- =====================================================
CREATE TABLE IF NOT EXISTS monthly_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  verified_workouts INTEGER DEFAULT 0,
  reward_tier TEXT,
  discount_percentage DECIMAL(4, 2) DEFAULT 0,
  redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMPTZ,
  discount_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_monthly_rewards_user_id ON monthly_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_rewards_period ON monthly_rewards(year, month);

-- =====================================================
-- 3. USER GYMS TABLE
-- Links users to their registered gyms
-- =====================================================
CREATE TABLE IF NOT EXISTS user_gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gym_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_gyms_user_id ON user_gyms(user_id);

-- =====================================================
-- 4. ADD GPS COORDINATES TO GYMS TABLE (if not exists)
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gyms' AND column_name = 'latitude') THEN
    ALTER TABLE gyms ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gyms' AND column_name = 'longitude') THEN
    ALTER TABLE gyms ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
END $$;

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE gym_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gyms ENABLE ROW LEVEL SECURITY;

-- Gym Check-ins Policies
DROP POLICY IF EXISTS "Users can view their own check-ins" ON gym_checkins;
CREATE POLICY "Users can view their own check-ins" ON gym_checkins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own check-ins" ON gym_checkins;
CREATE POLICY "Users can insert their own check-ins" ON gym_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own check-ins" ON gym_checkins;
CREATE POLICY "Users can update their own check-ins" ON gym_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- Monthly Rewards Policies
DROP POLICY IF EXISTS "Users can view their own rewards" ON monthly_rewards;
CREATE POLICY "Users can view their own rewards" ON monthly_rewards
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own rewards" ON monthly_rewards;
CREATE POLICY "Users can insert their own rewards" ON monthly_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rewards" ON monthly_rewards;
CREATE POLICY "Users can update their own rewards" ON monthly_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- User Gyms Policies
DROP POLICY IF EXISTS "Users can view their own gym memberships" ON user_gyms;
CREATE POLICY "Users can view their own gym memberships" ON user_gyms
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own gym memberships" ON user_gyms;
CREATE POLICY "Users can manage their own gym memberships" ON user_gyms
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. SAMPLE NYC GYM DATA WITH COORDINATES
-- =====================================================
-- First, add rating and is_verified columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gyms' AND column_name = 'rating') THEN
    ALTER TABLE gyms ADD COLUMN rating DECIMAL(2, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gyms' AND column_name = 'is_verified') THEN
    ALTER TABLE gyms ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing gyms with coordinates instead of inserting new ones
-- (Skip sample data insert - use your existing gyms)

-- =====================================================
-- 7. HELPER FUNCTION: Get user's monthly workout count
-- =====================================================
CREATE OR REPLACE FUNCTION get_monthly_workout_count(
  p_user_id UUID,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
) RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM gym_checkins
    WHERE user_id = p_user_id
      AND is_verified = true
      AND EXTRACT(MONTH FROM check_in_time) = p_month
      AND EXTRACT(YEAR FROM check_in_time) = p_year
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Done! Tables created successfully.
-- =====================================================
