# GymEZ Verification & Rewards System Options

## Verification Methods Considered

### Option 1: GPS + Manual Logging ✅ (SELECTED)
**How it works:**
- User logs workout manually in app
- App captures GPS location at check-in
- Validates user is within 50-100m of registered gym
- Requires minimum 30-minute duration for valid workout

**Pros:**
- Simple to implement
- No hardware required
- Works at any gym
- Low cost

**Cons:**
- Can be spoofed with GPS apps (low risk for discount-only rewards)
- Requires location permissions

**Implementation Complexity:** Low

---

### Option 2: WiFi Network Detection
**How it works:**
- Gym registers their WiFi network name (SSID)
- App detects when user is connected to gym's WiFi
- Auto check-in when connected, auto check-out when disconnected

**Pros:**
- More accurate than GPS indoors
- Harder to spoof
- Automatic tracking

**Cons:**
- Requires gym WiFi info
- User must connect to gym WiFi
- Some gyms have poor/no WiFi

**Implementation Complexity:** Medium

---

### Option 3: QR Code Check-in
**How it works:**
- Gym displays unique QR code (rotates daily/hourly)
- User scans QR code when entering gym
- QR code validates gym identity

**Pros:**
- Very hard to fake
- Creates gym partnership opportunity
- Low tech requirement

**Cons:**
- Requires gym cooperation
- User must remember to scan
- QR code could be shared

**Implementation Complexity:** Medium (requires gym onboarding)

---

### Option 4: Bluetooth Beacon
**How it works:**
- Install Bluetooth beacons at partner gyms
- App auto-detects when user is near beacon
- Silent background check-in

**Pros:**
- Automatic and accurate
- Works indoors perfectly
- Hard to spoof

**Cons:**
- Requires hardware at each gym ($20-50/beacon)
- Requires gym partnership
- Battery replacement needed

**Implementation Complexity:** High (hardware + partnerships)

---

### Option 5: Smartwatch/Wearable Integration
**How it works:**
- Connect Apple Watch, Fitbit, Garmin, etc.
- Pull workout data (heart rate, calories, duration)
- Validate workout intensity meets threshold

**Pros:**
- Verifies actual exercise occurred
- Hard to fake elevated heart rate
- Premium feel

**Cons:**
- Not everyone has smartwatch
- Complex API integrations
- Privacy concerns with health data

**Implementation Complexity:** High

---

### Option 6: Hybrid Approach
**How it works:**
- Combine multiple methods (GPS + workout logging + optional wearable)
- Higher verification = higher reward tier
- Flexible for different user situations

**Pros:**
- Most accurate
- Accommodates all users
- Scalable rewards

**Cons:**
- Most complex to build
- Confusing for users initially

**Implementation Complexity:** Very High

---

## Selected Approach: Option 1 (GPS + Manual Logging)

### Why This Choice:
1. **Quick to market** - Can launch MVP fast
2. **No dependencies** - No gym partnerships needed initially
3. **Low fraud risk** - Rewards are discounts, not cash
4. **Scalable** - Can add more verification later

### Future Roadmap:
- Phase 1: GPS + Manual (NOW)
- Phase 2: Add QR codes for partner gyms
- Phase 3: Smartwatch integration for bonus rewards

---

## Reward Tiers (Profit-Optimized)

### Monthly Workout Targets → Protein Discount

| Workouts/Month | Discount | Notes |
|----------------|----------|-------|
| 8 workouts | 3% | Entry tier - minimal reward |
| 12 workouts | 5% | Baseline consistent |
| 16 workouts | 8% | Dedicated user |
| 20 workouts | 10% | Very active |
| 24+ workouts | 12% | Max reward (still profitable) |

### Business Logic:
- **Minimum reward (3%)**: Encourages participation without hurting margins
- **Maximum reward (12%)**: Still leaves healthy profit margin on protein sales
- **Sweet spot (8-10%)**: Where most engaged users will land
- **Reset monthly**: Encourages sustained engagement

### Profit Analysis (Example):
- Protein product cost: $25
- Our purchase cost: ~$15 (40% margin)
- At 12% max discount: Sell for $22 → Still $7 profit
- At 3% min discount: Sell for $24.25 → $9.25 profit

### Anti-Gaming Rules:
1. Max 1 check-in per day
2. Minimum 30 minutes at gym
3. Must be within 100m of registered gym
4. Workouts must be on different days (no double-dipping)

---

## Database Schema Additions Needed

```sql
-- Gym check-ins table
CREATE TABLE gym_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id),
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  verification_method TEXT DEFAULT 'gps',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly reward tracking
CREATE TABLE monthly_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  verified_workouts INTEGER DEFAULT 0,
  reward_tier TEXT,
  discount_percentage DECIMAL(4, 2),
  redeemed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- User's registered gyms
CREATE TABLE user_gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gym_id)
);
```

---

## Implementation Checklist

- [ ] Create database tables (gym_checkins, monthly_rewards, user_gyms)
- [ ] Build GPS check-in service
- [ ] Create check-in UI component
- [ ] Build reward progress tracker
- [ ] Create reward display component
- [ ] Add location permissions handling
- [ ] Build monthly reset logic
- [ ] Create discount code generation (for protein store)
- [ ] Add check-in history view

---

*Document created: December 16, 2025*
*Selected approach: GPS + Manual Logging with profit-optimized reward tiers*
