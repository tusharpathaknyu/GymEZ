-- ============================================
-- GYMEZ - ADDITIONAL TABLES FOR NEW FEATURES
-- ============================================
-- Run this in Supabase SQL Editor to add support for new features
-- Run ONLY if you haven't added these tables yet
-- ============================================

-- ============================================
-- NEW TABLES
-- ============================================

-- Stories Table (for 24-hour stories feature)
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    caption TEXT,
    workout_log_id UUID,
    gym_id UUID REFERENCES gyms(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    views_count INTEGER DEFAULT 0
);

-- Progress Photos Table
CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    weight_kg DECIMAL(5, 2),
    date_taken DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PR Goals Table (for goal setting feature)
CREATE TABLE IF NOT EXISTS user_pr_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('benchpress', 'squat', 'deadlift', 'pullup', 'pushup', 'dip')),
    target_value DECIMAL(8, 2) NOT NULL,
    target_unit TEXT NOT NULL CHECK (target_unit IN ('kg', 'reps', 'time', 'distance')),
    current_value DECIMAL(8, 2) DEFAULT 0,
    target_date DATE,
    is_completed BOOLEAN DEFAULT false,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, exercise_type)
);

-- Story Views Table (track who viewed which stories)
CREATE TABLE IF NOT EXISTS story_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES profiles(id) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(story_id, viewer_id)
);

-- Reaction Types (update post_likes to support multiple reaction types)
-- First, add reaction_type column to existing post_likes table
ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS reaction_type TEXT DEFAULT 'like' 
CHECK (reaction_type IN ('like', 'fire', 'clap', 'strong', 'trophy'));

-- ============================================
-- INDEXES FOR NEW TABLES
-- ============================================

-- Stories indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_gym_id ON stories(gym_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Progress Photos indexes
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_date_taken ON progress_photos(date_taken DESC);

-- PR Goals indexes
CREATE INDEX IF NOT EXISTS idx_pr_goals_user_id ON user_pr_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_pr_goals_exercise_type ON user_pr_goals(exercise_type);
CREATE INDEX IF NOT EXISTS idx_pr_goals_is_completed ON user_pr_goals(is_completed) WHERE is_completed = false;

-- Story Views indexes
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);

-- Post Likes indexes (for reaction types)
CREATE INDEX IF NOT EXISTS idx_post_likes_reaction_type ON post_likes(reaction_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- ============================================

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pr_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Stories Policies
CREATE POLICY "Users can view stories from their gym and followed users"
    ON stories FOR SELECT
    USING (
        user_id = auth.uid() OR
        user_id IN (SELECT following_id FROM follows WHERE follower_id = auth.uid()) OR
        gym_id IN (SELECT gym_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert their own stories"
    ON stories FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own stories"
    ON stories FOR DELETE
    USING (user_id = auth.uid());

-- Progress Photos Policies
CREATE POLICY "Users can view their own photos and photos from gym mates"
    ON progress_photos FOR SELECT
    USING (
        user_id = auth.uid() OR
        user_id IN (SELECT id FROM profiles WHERE gym_id IN (
            SELECT gym_id FROM profiles WHERE id = auth.uid()
        ))
    );

CREATE POLICY "Users can insert their own photos"
    ON progress_photos FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own photos"
    ON progress_photos FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own photos"
    ON progress_photos FOR DELETE
    USING (user_id = auth.uid());

-- PR Goals Policies
CREATE POLICY "Users can view their own goals"
    ON user_pr_goals FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own goals"
    ON user_pr_goals FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals"
    ON user_pr_goals FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals"
    ON user_pr_goals FOR DELETE
    USING (user_id = auth.uid());

-- Story Views Policies
CREATE POLICY "Users can view who viewed stories"
    ON story_views FOR SELECT
    USING (
        story_id IN (SELECT id FROM stories WHERE user_id = auth.uid()) OR
        viewer_id = auth.uid()
    );

CREATE POLICY "Users can insert story views"
    ON story_views FOR INSERT
    WITH CHECK (viewer_id = auth.uid());

-- Update existing post_likes to support reaction types
CREATE POLICY "Users can view all reactions on visible posts"
    ON post_likes FOR SELECT
    USING (
        post_id IN (SELECT id FROM posts)
    );

CREATE POLICY "Users can manage their own reactions"
    ON post_likes FOR ALL
    USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to clean up expired stories (auto-delete after 24 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
    DELETE FROM stories WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to update story views count
CREATE OR REPLACE FUNCTION update_story_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stories 
    SET views_count = (
        SELECT COUNT(*) 
        FROM story_views 
        WHERE story_id = NEW.story_id
    )
    WHERE id = NEW.story_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update views count
CREATE TRIGGER update_story_views_trigger
    AFTER INSERT ON story_views
    FOR EACH ROW
    EXECUTE FUNCTION update_story_views_count();

-- Function to update progress photo timestamp
CREATE OR REPLACE FUNCTION update_progress_photo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for progress photos
CREATE TRIGGER update_progress_photo_updated_at_trigger
    BEFORE UPDATE ON progress_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_progress_photo_updated_at();

-- Function to update PR goal progress
CREATE OR REPLACE FUNCTION update_pr_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- When a PR is logged, update relevant goals
    UPDATE user_pr_goals
    SET current_value = NEW.one_rep_max,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
    AND exercise_type = NEW.exercise
    AND is_completed = false
    AND NEW.one_rep_max >= target_value;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update goals when PR is logged
CREATE TRIGGER update_pr_goal_on_new_pr_trigger
    AFTER INSERT ON personal_records
    FOR EACH ROW
    EXECUTE FUNCTION update_pr_goal_progress();

-- ============================================
-- UPDATE EXISTING POSTS TABLE
-- ============================================
-- Add missing 'id' column to posts if not exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Make id PRIMARY KEY if not already
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_pkey'
    ) THEN
        ALTER TABLE posts ADD PRIMARY KEY (id);
    END IF;
END $$;

-- ============================================
-- UPDATE PERSONAL_RECORDS TABLE
-- ============================================
-- Add achieved_at column for better tracking
ALTER TABLE personal_records ADD COLUMN IF NOT EXISTS achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to use current date if achieved_at is null
UPDATE personal_records 
SET achieved_at = COALESCE(created_at, NOW())
WHERE achieved_at IS NULL;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Uncomment to add sample NYC gyms (if not already added)
/*
INSERT INTO gyms (id, name, address, pincode, latitude, longitude, description, facilities, membership_cost, owner_id)
VALUES
('gym-001', 'Equinox Flatiron', '175 5th Ave, New York, NY 10010', '10010', 40.7406, -73.9903, 'Premium fitness club in the heart of Flatiron District', ARRAY['Swimming Pool', 'Sauna', 'Steam Room', 'Personal Training'], 250.00, 'gym-owner-1'),
('gym-002', 'Planet Fitness Times Square', '234 W 42nd St, New York, NY 10036', '10036', 40.7559, -73.9847, '24/7 gym with affordable memberships in Times Square', ARRAY['24/7 Access', 'Free Weights', 'Cardio Equipment'], 10.00, 'gym-owner-2')
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- COMPLETE! 
-- ============================================
-- You now have support for:
-- ✅ Stories (24-hour content)
-- ✅ Progress Photos
-- ✅ PR Goals with tracking
-- ✅ Multiple reaction types (like, fire, clap, strong, trophy)
-- ✅ Automatic goal progress updates
-- ✅ Story view tracking
-- ✅ All RLS policies
-- ✅ Performance indexes
-- ============================================

