# GYMEZ Backend - Railway Deployment
# Ultra-cheap hosting solution ($0-5/month)

## 🚀 Quick Railway Deployment

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Step 2: Create backend structure
```bash
mkdir gymez-backend
cd gymez-backend
npm init -y
npm install express cors dotenv pg bcryptjs jsonwebtoken
```

### Step 3: Create simple Express server
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'GYMEZ Backend Running!', timestamp: new Date() });
});

// Auth endpoints
app.post('/api/login', (req, res) => {
  // Your login logic here
  res.json({ success: true, token: 'mock-token' });
});

app.post('/api/register', (req, res) => {
  // Your registration logic here  
  res.json({ success: true, message: 'User created' });
});

// Gym endpoints
app.get('/api/gyms', (req, res) => {
  // Your gym data logic here
  res.json({ gyms: [] });
});

// PR endpoints  
app.get('/api/personal-records', (req, res) => {
  // Your PR logic here
  res.json({ records: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GYMEZ Backend running on port ${PORT}`);
});
```

### Step 4: Deploy to Railway
```bash
# In your backend folder
railway init
railway add postgresql  # Free PostgreSQL database
railway up              # Deploy instantly!
```

### Step 5: Get your backend URL
```bash
railway domain          # Get your backend URL
# Example: https://gymez-backend.up.railway.app
```

## 💰 **Pricing Comparison:**

| Service | Free Tier | Paid | Database |
|---------|-----------|------|----------|
| **Railway** | 500hrs/month | $5/month | ✅ PostgreSQL |
| **Render** | Always free* | $7/month | ✅ PostgreSQL |
| **Fly.io** | 3 VMs free | $5/month | ✅ PostgreSQL |
| **Vercel** | Unlimited | $20/month | ❌ Need separate |

*Sleeps after 15min inactivity

## 🎯 **Recommended: Railway**
- ✅ Easiest setup (2 minutes)
- ✅ Free PostgreSQL included
- ✅ No sleep mode issues
- ✅ Built-in monitoring
- ✅ Auto-deploy from GitHub

## 📱 **Update React Native App**
```javascript
// In your React Native app
const API_BASE_URL = 'https://your-app.up.railway.app';

// Update your services to use the Railway backend
fetch(`${API_BASE_URL}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```