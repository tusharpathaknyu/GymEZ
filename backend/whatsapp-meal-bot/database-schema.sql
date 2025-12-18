-- GymEZ WhatsApp Meal Bot - Database Schema
-- Run this in your Supabase SQL Editor

-- Create meal_logs table for storing WhatsApp meal analysis
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Food items detected (JSON array)
  foods JSONB NOT NULL DEFAULT '[]',
  
  -- Nutritional totals
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein FLOAT NOT NULL DEFAULT 0,
  total_carbs FLOAT NOT NULL DEFAULT 0,
  total_fats FLOAT NOT NULL DEFAULT 0,
  
  -- AI health score (1-10)
  health_score INTEGER CHECK (health_score >= 1 AND health_score <= 10),
  
  -- Source of the log (app, whatsapp)
  source VARCHAR(50) DEFAULT 'app',
  
  -- Optional image URL
  image_url TEXT,
  
  -- Meal type (breakfast, lunch, dinner, snack)
  meal_type VARCHAR(50),
  
  -- AI-generated tip
  ai_tip TEXT,
  
  -- Timestamps
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at ON meal_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_meal_logs_source ON meal_logs(source);

-- Enable Row Level Security
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own meal logs
CREATE POLICY "Users can view own meal logs" ON meal_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own meal logs
CREATE POLICY "Users can insert own meal logs" ON meal_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own meal logs
CREATE POLICY "Users can update own meal logs" ON meal_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own meal logs
CREATE POLICY "Users can delete own meal logs" ON meal_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Service role can insert meal logs (for WhatsApp bot)
CREATE POLICY "Service role can insert meal logs" ON meal_logs
  FOR INSERT WITH CHECK (true);

-- Add phone number column to users table if it doesn't exist
-- This is needed to link WhatsApp messages to user accounts
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Function to get daily nutrition totals
CREATE OR REPLACE FUNCTION get_daily_nutrition(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_calories BIGINT,
  total_protein FLOAT,
  total_carbs FLOAT,
  total_fats FLOAT,
  meal_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ml.total_calories), 0)::BIGINT as total_calories,
    COALESCE(SUM(ml.total_protein), 0)::FLOAT as total_protein,
    COALESCE(SUM(ml.total_carbs), 0)::FLOAT as total_carbs,
    COALESCE(SUM(ml.total_fats), 0)::FLOAT as total_fats,
    COUNT(*)::BIGINT as meal_count
  FROM meal_logs ml
  WHERE ml.user_id = p_user_id
    AND DATE(ml.logged_at) = p_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly nutrition summary
CREATE OR REPLACE FUNCTION get_weekly_nutrition(
  p_user_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '6 days')::DATE
)
RETURNS TABLE (
  log_date DATE,
  total_calories BIGINT,
  total_protein FLOAT,
  total_carbs FLOAT,
  total_fats FLOAT,
  meal_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(ml.logged_at) as log_date,
    COALESCE(SUM(ml.total_calories), 0)::BIGINT as total_calories,
    COALESCE(SUM(ml.total_protein), 0)::FLOAT as total_protein,
    COALESCE(SUM(ml.total_carbs), 0)::FLOAT as total_carbs,
    COALESCE(SUM(ml.total_fats), 0)::FLOAT as total_fats,
    COUNT(*)::BIGINT as meal_count
  FROM meal_logs ml
  WHERE ml.user_id = p_user_id
    AND DATE(ml.logged_at) >= p_start_date
    AND DATE(ml.logged_at) <= CURRENT_DATE
  GROUP BY DATE(ml.logged_at)
  ORDER BY log_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meal_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_meal_logs_updated_at
  BEFORE UPDATE ON meal_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_logs_updated_at();

-- Sample query to test
-- SELECT * FROM get_daily_nutrition('your-user-id-here');
-- SELECT * FROM get_weekly_nutrition('your-user-id-here');

COMMENT ON TABLE meal_logs IS 'Stores meal logs from app and WhatsApp integration';
COMMENT ON COLUMN meal_logs.foods IS 'JSON array of detected food items with nutrition info';
COMMENT ON COLUMN meal_logs.source IS 'Where the log came from: app or whatsapp';
