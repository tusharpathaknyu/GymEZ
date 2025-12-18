# GymEZ Affiliate Program Setup Guide 💰

This guide explains how to set up affiliate partnerships to monetize your app immediately - without needing existing users!

## Why Affiliate Programs?

**The Chicken-and-Egg Problem:**
- Can't get brand deals without users
- Can't attract users without deals

**The Solution:**
- Affiliate programs require ZERO existing users to join
- You get instant "deals" to offer in your app
- Start earning commission from day one

## Recommended Affiliate Programs

### 🥤 Protein & Supplements

| Brand | Commission | Sign Up Link | Notes |
|-------|-----------|--------------|-------|
| **MyProtein** | 8-10% | [myprotein.com/affiliates](https://www.myprotein.com/affiliate-program.list) | Excellent fitness brand recognition |
| **Bodybuilding.com** | 5-15% | [bodybuilding.com/affiliates](https://www.bodybuilding.com/store/affiliates.html) | Huge product selection |
| **iHerb** | 5-10% | [iherb.com/affiliates](https://www.iherb.com/info/affiliate) | International, ships globally |
| **Transparent Labs** | 10% | [transparentlabs.com/affiliates](https://www.transparentlabs.com/pages/affiliates) | Clean, science-backed |
| **Ghost Lifestyle** | ~10% | [ghostlifestyle.com](https://www.ghostlifestyle.com) | Trendy, great branding |
| **Optimum Nutrition** | Varies | Through ShareASale | Gold Standard brand |

### 👕 Fitness Apparel

| Brand | Commission | Sign Up Link | Notes |
|-------|-----------|--------------|-------|
| **Gymshark** | 5-10% | [gymshark.com/pages/affiliates](https://www.gymshark.com/pages/affiliates) | Most popular gym brand |
| **Lululemon** | 5-7% | Through affiliate networks | Premium athletic wear |
| **Alphalete** | ~10% | [alphaleteathletics.com](https://alphaleteathletics.com) | Gym influencer favorite |

### 🏋️ Equipment

| Brand | Commission | Sign Up Link | Notes |
|-------|-----------|--------------|-------|
| **Amazon** | 1-4% | [affiliate-program.amazon.com](https://affiliate-program.amazon.com) | Huge selection |
| **Rogue Fitness** | 3-5% | [roguefitness.com](https://www.roguefitness.com) | Premium equipment |
| **REP Fitness** | ~5% | Direct partnership | Budget-friendly racks |

## How to Set Up

### Step 1: Sign Up for Affiliate Programs

1. **Start with Amazon Associates** (easiest approval)
   - Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
   - Create account with your GymEZ info
   - Get approved (usually instant)
   - Generate your affiliate links

2. **Apply to MyProtein** (best for fitness)
   - Visit their affiliate page
   - Fill out application
   - Wait for approval (usually 1-3 days)
   - Get your unique discount codes

3. **Join ShareASale/CJ Affiliate** (access to many brands)
   - One signup = access to hundreds of brands
   - Apply to individual brand programs within the network

### Step 2: Update Your App

Once approved, update `src/screens/RewardsScreen.tsx`:

```typescript
// Find the PARTNER_DEALS array and update with your affiliate links:

const PARTNER_DEALS = [
  {
    id: 'myprotein',
    brand: 'MyProtein',
    logo: '🥤',
    discount: '35% OFF',
    description: 'Premium protein & supplements',
    code: 'YOUR_UNIQUE_CODE', // Your affiliate code
    url: 'https://www.myprotein.com/?affil=YOUR_AFFILIATE_ID', // Your affiliate link
    color: '#00A0DC',
    featured: true,
    category: 'protein',
  },
  // ... more deals
];
```

### Step 3: Track Performance

Most affiliate programs provide dashboards showing:
- Clicks
- Conversions
- Commission earned
- Popular products

## Revenue Projections

Conservative estimates based on typical conversion rates:

| Users | Monthly Clicks | Conversions (2%) | Avg Order | Commission (8%) | Monthly Revenue |
|-------|---------------|------------------|-----------|-----------------|-----------------|
| 100 | 200 | 4 | $50 | $4 | **$16** |
| 1,000 | 2,000 | 40 | $50 | $4 | **$160** |
| 10,000 | 20,000 | 400 | $50 | $4 | **$1,600** |
| 100,000 | 200,000 | 4,000 | $50 | $4 | **$16,000** |

## Best Practices

### 1. Provide Value, Not Spam
- Only recommend products you'd actually use
- Be transparent about affiliate relationships
- Focus on products that help users achieve goals

### 2. Use Strategic Timing
- Show protein deals after workout completion
- Recommend equipment when users hit PRs
- Offer apparel deals during onboarding

### 3. Track What Works
- Monitor which brands convert best
- A/B test different placements
- Remove underperforming partners

### 4. Build Trust First
- Let users experience app value before pushing deals
- Don't make the app feel like an ad platform
- Tie rewards to actual fitness progress

## Legal Requirements

### FTC Disclosure
You MUST disclose affiliate relationships. Add this to your app:
- "We may earn a commission when you purchase through our links"
- Add this text to your app's terms or near deal sections

### Privacy Policy
Update your privacy policy to mention:
- You use affiliate links
- Third parties may track purchases
- How commission data is handled

## Upgrading to Direct Partnerships

Once you have:
- **5,000+ active users**: Reach out to smaller brands
- **25,000+ users**: Negotiate better rates with mid-tier brands
- **100,000+ users**: Pursue exclusive partnerships with major brands

### Pitch Template for Direct Partnerships

```
Subject: Partnership Opportunity - GymEZ Fitness App

Hi [Brand] Team,

I'm the founder of GymEZ, a fitness app with [X] active users focused on gym check-ins and workout tracking.

Our users are highly engaged fitness enthusiasts who:
- Work out 4+ times per week
- Actively purchase supplements and fitness gear
- Trust our reward recommendations

I'd love to discuss a partnership where we can offer your products to our community in exchange for:
- Exclusive discount codes for our users
- Improved commission rates
- Co-marketing opportunities

Our current affiliate stats:
- [X] monthly clicks to fitness brands
- [X]% conversion rate
- Average order value: $[X]

Would you be open to a quick call to explore this?

Best,
[Your Name]
GymEZ Founder
```

## Next Steps

1. ✅ Sign up for Amazon Associates today
2. ✅ Apply to MyProtein affiliate program
3. ✅ Update RewardsScreen.tsx with your links
4. ✅ Add FTC disclosure to your app
5. ✅ Launch and start earning!

---

**Questions?** The affiliate model is tried and tested - companies like MyFitnessPal, Strava, and Nike Training Club all use similar approaches to monetize their free apps.

Good luck! 💪
