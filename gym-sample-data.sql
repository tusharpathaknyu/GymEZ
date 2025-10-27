-- ============================================
-- GYMEZ SAMPLE GYM DATA
-- ============================================
-- Run this AFTER setting up the main database schema
-- This will populate your database with sample gyms for testing

-- ============================================
-- SAMPLE GYM DATA WITH DUMMY OWNER
-- ============================================
-- Create a dummy gym owner first (you can delete this later)

-- Step 1: Insert a dummy owner profile (requires manual user ID)
-- You'll need to replace 'YOUR_USER_ID_HERE' with an actual user ID from your Supabase Auth
-- For now, let's use a placeholder that you can update later

DO $$
DECLARE
    dummy_owner_id UUID;
BEGIN
    -- Create a dummy profile (will fail if user doesn't exist in auth.users)
    -- For testing, we'll create a simple UUID that you can replace later
    dummy_owner_id := gen_random_uuid();
    
    -- Try to insert dummy profile (this might fail due to auth constraints)
    INSERT INTO profiles (id, user_type, email, full_name, created_at)
    VALUES (dummy_owner_id, 'gym_owner', 'dummy@example.com', 'Dummy Owner', NOW())
    ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert sample gyms with realistic USA data  
INSERT INTO gyms (name, address, pincode, latitude, longitude, phone, email, description, facilities, membership_cost, owner_id) VALUES 

-- New York City gyms
('FitZone Manhattan', '150 W 56th St, Midtown, New York, NY', '10019', 40.7614, -73.9776, '+1-212-555-0123', 'contact@fitzonemanhattan.com', 'Premium fitness center with state-of-the-art equipment and personal training services', ARRAY['Cardio Equipment', 'Weight Training', 'Personal Training', 'Group Classes', 'Steam Room'], 89, dummy_owner_id),

('PowerHouse Gym Brooklyn', '2500 Flatbush Ave, Brooklyn, NY', '11234', 40.6092, -73.9442, '+1-718-555-0234', 'info@powerhousebrooklyn.com', 'Complete fitness solution with modern facilities and expert trainers', ARRAY['CrossFit', 'Bodybuilding', 'Functional Training', 'Nutrition Counseling', 'Locker Rooms'], 109, dummy_owner_id),

-- Los Angeles gyms
('Muscle Factory Venice', '1800 Ocean Front Walk, Venice, CA', '90291', 34.0195, -118.4912, '+1-310-555-0345', 'hello@musclefactoryvenice.com', 'Hardcore bodybuilding gym with heavy equipment and competitive atmosphere on Venice Beach', ARRAY['Powerlifting', 'Bodybuilding', 'Strongman Training', 'Competition Prep', 'Outdoor Training'], 95, dummy_owner_id),

('Yoga & Fitness Hub Hollywood', '6801 Hollywood Blvd, Hollywood, CA', '90028', 34.1022, -118.3406, '+1-323-555-0456', 'namaste@yogafitnesshub.com', 'Holistic fitness center combining traditional yoga with modern gym facilities', ARRAY['Yoga Classes', 'Pilates', 'Meditation', 'Cardio Zone', 'Spa Services'], 75, dummy_owner_id),

-- Chicago gyms  
('Gold Gym Downtown Chicago', '230 W Monroe St, Chicago, IL', '60606', 41.8802, -87.6347, '+1-312-555-0567', 'chicago@goldsgym.com', 'International chain gym with world-class equipment and celebrity trainers', ARRAY['International Equipment', 'Celebrity Trainers', 'Zumba', 'Spinning', 'Sauna'], 129, dummy_owner_id),

('Fitness First Lincoln Park', '2001 N Lincoln Park W, Chicago, IL', '60614', 41.9178, -87.6369, '+1-773-555-0678', 'lincolnpark@fitnessfirst.com', 'Premium fitness chain with cutting-edge technology and luxury amenities', ARRAY['Virtual Training', 'Swimming Pool', 'Spa', 'Nutrition Bar', 'Childcare'], 119, dummy_owner_id),

-- Miami gyms
('SoulCycle South Beach', '1657 Washington Ave, Miami Beach, FL', '33139', 25.7906, -80.1340, '+1-305-555-0789', 'southbeach@soulcycle.com', 'High-energy cycling studio with Miami beach vibes and motivating instructors', ARRAY['Indoor Cycling', 'HIIT Classes', 'Strength Training', 'Dance Fitness', 'Recovery Zone'], 89, dummy_owner_id),

('Equinox Brickell', '1435 Brickell Ave, Miami, FL', '33131', 25.7617, -80.1918, '+1-305-555-0890', 'brickell@equinox.com', 'Luxury fitness club with cutting-edge facilities and personalized training', ARRAY['Personal Training', 'Group Fitness', 'Spa Services', 'Pilates Studio', 'Juice Bar'], 159, dummy_owner_id),

-- Austin gyms
('CrossFit Austin Central', '1700 S Lamar Blvd, Austin, TX', '78704', 30.2485, -97.7728, '+1-512-555-0901', 'central@crossfitaustin.com', '24/7 CrossFit box with community atmosphere and competitive training programs', ARRAY['24/7 Access', 'CrossFit', 'Olympic Lifting', 'Metabolic Conditioning'], 79, dummy_owner_id),

('Planet Fitness South Austin', '5525 Burnet Rd, Austin, TX', '78756', 30.3077, -97.7419, '+1-512-555-1012', 'south@planetfitness.com', 'Judgment-free fitness zone with affordable memberships and beginner-friendly atmosphere', ARRAY['Cardio Equipment', 'Circuit Training', 'Free Weights', 'HydroMassage', 'Tanning'], 39, dummy_owner_id);

END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly:

-- Check inserted gyms
-- SELECT name, pincode, membership_cost, array_length(facilities, 1) as facility_count FROM gyms ORDER BY pincode;

-- Check gym owners
-- SELECT email, full_name FROM profiles WHERE user_type = 'gym_owner';

-- Count gyms by city (based on pincode)
-- SELECT 
--   CASE 
--     WHEN pincode LIKE '400%' THEN 'Mumbai'
--     WHEN pincode LIKE '110%' OR pincode LIKE '122%' THEN 'Delhi NCR'  
--     WHEN pincode LIKE '560%' THEN 'Bangalore'
--     WHEN pincode LIKE '411%' THEN 'Pune'
--     ELSE 'Other'
--   END as city,
--   COUNT(*) as gym_count
-- FROM gyms 
-- GROUP BY city 
-- ORDER BY gym_count DESC;