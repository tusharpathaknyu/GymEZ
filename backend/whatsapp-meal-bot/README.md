# 📱 GymEZ WhatsApp Meal Bot

Analyze your meals instantly by sending photos on WhatsApp! This bot uses AI to identify food items and calculate nutritional information.

## 🌟 Features

- 📸 **Photo Analysis** - Send a meal photo, get instant nutrition breakdown
- 🤖 **AI-Powered** - Uses GPT-4 Vision for accurate food recognition
- 📊 **Macro Tracking** - Calories, protein, carbs, and fats
- 🏆 **Health Score** - Get a 1-10 rating for your meal
- 💡 **Smart Tips** - Personalized improvement suggestions
- 📱 **Auto-Logging** - Meals are saved to your GymEZ account

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend/whatsapp-meal-bot
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Choose WhatsApp Provider

#### Option A: Twilio (Recommended for Testing)

1. Create account at [Twilio](https://www.twilio.com)
2. Go to **Messaging > Try it out > Send a WhatsApp message**
3. Follow sandbox setup instructions
4. Get your Account SID and Auth Token from Dashboard
5. Set webhook URL to: `https://your-server.com/webhook/twilio`

#### Option B: Meta WhatsApp Business API (For Production)

1. Create app at [Meta Developers](https://developers.facebook.com)
2. Add WhatsApp product to your app
3. Set up a phone number
4. Get access token from App Dashboard
5. Set webhook URL to: `https://your-server.com/webhook/meta`
6. Subscribe to `messages` webhook field

### 4. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Make sure you have GPT-4 Vision access

### 5. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📲 How Users Use It

1. **Save the WhatsApp Number** - Add the bot's number to contacts
2. **Send "help"** - See available commands
3. **Snap a Photo** - Take a picture of your meal
4. **Send it** - Bot analyzes and responds with nutrition info
5. **Track Progress** - Meals auto-sync to GymEZ app

## 💬 Bot Commands

| Command | Description |
|---------|-------------|
| `help` | Show menu and instructions |
| `today` | See today's meal summary |
| `goals` | View your macro goals |
| `tip` | Get a random nutrition tip |
| 📸 Photo | Analyze meal nutrition |

## 📝 Example Response

```
🍽️ GymEZ Meal Analysis

📋 Foods Detected:
1. Grilled Chicken Breast (150g)
   248 cal | P: 46g | C: 0g | F: 5g
2. Brown Rice (200g)
   260 cal | P: 5g | C: 56g | F: 2g
3. Steamed Broccoli (100g)
   34 cal | P: 3g | C: 7g | F: 0g

📊 Total Macros:
🔥 Calories: 542
💪 Protein: 54g
🍞 Carbs: 63g
🥑 Fats: 7g

🟢 Health Score: 9/10

💡 Tip: Great balanced meal! Consider adding healthy fats like olive oil or avocado.

Powered by GymEZ AI 🏋️
```

## 🏗️ Architecture

```
User's WhatsApp
      ↓
WhatsApp API (Twilio/Meta)
      ↓
Express Server (/webhook)
      ↓
OpenAI Vision API
      ↓
Format Response + Save to Supabase
      ↓
Send back to WhatsApp
```

## 🚢 Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to Render

1. Connect GitHub repo
2. Set environment variables
3. Deploy from dashboard

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

## 🔒 Security Notes

- Never commit `.env` file
- Use webhook signature verification in production
- Rate limit API endpoints
- Validate phone numbers against your user database

## 🧪 Testing

```bash
# Test the analysis endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/food.jpg"}'
```

## 📊 Database Schema

Add this to your Supabase:

```sql
CREATE TABLE meal_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  foods JSONB,
  total_calories INTEGER,
  total_protein FLOAT,
  total_carbs FLOAT,
  total_fats FLOAT,
  health_score INTEGER,
  source VARCHAR(50) DEFAULT 'app',
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_logged_at ON meal_logs(logged_at);
```

## 🤝 Integration with GymEZ App

The WhatsApp bot automatically syncs with the GymEZ app:

1. Meals logged via WhatsApp appear in the Nutrition screen
2. Daily totals update in real-time
3. Progress charts include WhatsApp-logged meals

## 📞 Support

Having issues? Check:
- Webhook URL is accessible (not localhost in production)
- API keys are valid and have required permissions
- Phone number format includes country code

---

Made with 💪 by GymEZ Team
