/**
 * GymEZ WhatsApp Meal Analyzer Bot
 * 
 * This server handles incoming WhatsApp messages via Twilio/Meta API
 * Users can send food photos and get instant nutritional analysis
 */

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const PORT = process.env.PORT || 3000;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize clients
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Food database for common items (fallback)
const FOOD_DATABASE = {
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: '100g' },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: '100g' },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: '100g' },
  'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13, serving: '100g' },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: '100g (2 eggs)' },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: '1 medium' },
  'oatmeal': { calories: 389, protein: 17, carbs: 66, fats: 7, serving: '100g dry' },
  'greek yogurt': { calories: 100, protein: 17, carbs: 6, fats: 0.7, serving: '170g' },
  'avocado': { calories: 160, protein: 2, carbs: 9, fats: 15, serving: '100g' },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: '100g' },
};

/**
 * Analyze food image using OpenAI Vision API
 */
async function analyzeImageWithAI(imageUrl) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition expert AI. Analyze food images and provide accurate nutritional estimates.
            
            For each food item you identify, provide:
            1. Food name
            2. Estimated portion size
            3. Calories
            4. Protein (g)
            5. Carbs (g)
            6. Fats (g)
            
            Also provide:
            - Total meal macros
            - Health score (1-10)
            - Brief tip for improvement
            
            Respond in this exact JSON format:
            {
              "foods": [{"name": "...", "portion": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0}],
              "totals": {"calories": 0, "protein": 0, "carbs": 0, "fats": 0},
              "healthScore": 8,
              "tip": "..."
            }`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this meal and provide nutritional information:' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    return null;
  }
}

/**
 * Format nutrition response for WhatsApp
 */
function formatNutritionMessage(analysis) {
  if (!analysis) {
    return `❌ Sorry, I couldn't analyze that image. Please try again with a clearer photo of your food.`;
  }

  let message = `🍽️ *GymEZ Meal Analysis*\n\n`;
  
  // List foods
  message += `📋 *Foods Detected:*\n`;
  analysis.foods.forEach((food, idx) => {
    message += `${idx + 1}. ${food.name} (${food.portion})\n`;
    message += `   ${food.calories} cal | P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fats}g\n`;
  });

  // Totals
  message += `\n📊 *Total Macros:*\n`;
  message += `🔥 Calories: ${analysis.totals.calories}\n`;
  message += `💪 Protein: ${analysis.totals.protein}g\n`;
  message += `🍞 Carbs: ${analysis.totals.carbs}g\n`;
  message += `🥑 Fats: ${analysis.totals.fats}g\n`;

  // Health score
  const scoreEmoji = analysis.healthScore >= 7 ? '🟢' : analysis.healthScore >= 5 ? '🟡' : '🔴';
  message += `\n${scoreEmoji} *Health Score:* ${analysis.healthScore}/10\n`;

  // Tip
  message += `\n💡 *Tip:* ${analysis.tip}`;

  // Footer
  message += `\n\n_Powered by GymEZ AI 🏋️_`;

  return message;
}

/**
 * Save meal log to Supabase
 */
async function saveMealLog(phoneNumber, analysis) {
  try {
    // Find user by phone number
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phoneNumber)
      .single();

    if (user) {
      await supabase.from('meal_logs').insert({
        user_id: user.id,
        foods: analysis.foods,
        total_calories: analysis.totals.calories,
        total_protein: analysis.totals.protein,
        total_carbs: analysis.totals.carbs,
        total_fats: analysis.totals.fats,
        health_score: analysis.healthScore,
        source: 'whatsapp',
        logged_at: new Date().toISOString(),
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving meal log:', error);
    return false;
  }
}

/**
 * Handle text commands
 */
function handleTextCommand(text) {
  const lowerText = text.toLowerCase().trim();

  if (lowerText === 'help' || lowerText === 'menu') {
    return `🏋️ *GymEZ WhatsApp Meal Bot*\n\n` +
      `📸 *Send a food photo* - Get instant nutrition analysis\n\n` +
      `📝 *Commands:*\n` +
      `• "help" - Show this menu\n` +
      `• "today" - See today's meal summary\n` +
      `• "goals" - Check your macro goals\n` +
      `• "tip" - Get a nutrition tip\n\n` +
      `_Just snap a pic of your meal and send it!_ 📲`;
  }

  if (lowerText === 'tip') {
    const tips = [
      '💧 Drink water before meals to help control portions',
      '🥗 Fill half your plate with vegetables',
      '🍗 Aim for protein with every meal',
      '🕐 Try to eat at consistent times each day',
      '🥜 Keep healthy snacks nearby to avoid junk food',
      '🍎 Eat the rainbow - variety ensures nutrient balance',
      '⏰ Don\'t skip breakfast - it kickstarts your metabolism',
      '🥄 Slow down! It takes 20 min to feel full',
    ];
    return `💡 *Nutrition Tip:*\n\n${tips[Math.floor(Math.random() * tips.length)]}`;
  }

  if (lowerText === 'goals') {
    return `🎯 *Your Daily Macro Goals:*\n\n` +
      `🔥 Calories: 2,200\n` +
      `💪 Protein: 180g\n` +
      `🍞 Carbs: 220g\n` +
      `🥑 Fats: 70g\n\n` +
      `_Update your goals in the GymEZ app!_`;
  }

  return null; // Not a command
}

/**
 * WhatsApp Webhook - Twilio
 */
app.post('/webhook/twilio', async (req, res) => {
  try {
    const { Body, From, MediaUrl0, NumMedia } = req.body;
    const phoneNumber = From.replace('whatsapp:', '');

    console.log(`📱 Message from ${phoneNumber}: ${Body || '[Image]'}`);

    let responseMessage;

    // Check if it's a text command
    if (Body && !MediaUrl0) {
      const commandResponse = handleTextCommand(Body);
      if (commandResponse) {
        responseMessage = commandResponse;
      } else {
        responseMessage = `👋 Hi! Send me a photo of your meal and I'll analyze the nutrition!\n\nType "help" for more options.`;
      }
    }
    // Handle image
    else if (NumMedia && parseInt(NumMedia) > 0 && MediaUrl0) {
      // Send "analyzing" message
      await twilioClient.messages.create({
        body: '🔍 Analyzing your meal... This might take a few seconds!',
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        to: From,
      });

      // Analyze the image
      const analysis = await analyzeImageWithAI(MediaUrl0);
      responseMessage = formatNutritionMessage(analysis);

      // Save to database if analysis successful
      if (analysis) {
        const saved = await saveMealLog(phoneNumber, analysis);
        if (saved) {
          responseMessage += '\n\n✅ _Logged to your GymEZ account!_';
        }
      }
    }
    else {
      responseMessage = `👋 Welcome to GymEZ Meal Bot!\n\n📸 Send a food photo to get instant nutrition analysis.\n\nType "help" for more options.`;
    }

    // Send response via Twilio
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(responseMessage);

    res.type('text/xml').send(twiml.toString());

  } catch (error) {
    console.error('Webhook Error:', error);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('❌ Something went wrong. Please try again later.');
    res.type('text/xml').send(twiml.toString());
  }
});

/**
 * WhatsApp Webhook - Meta (Facebook) Business API
 */
app.post('/webhook/meta', async (req, res) => {
  try {
    const { entry } = req.body;

    if (entry && entry[0]?.changes) {
      const change = entry[0].changes[0];
      const message = change.value?.messages?.[0];

      if (message) {
        const phoneNumber = message.from;
        const messageType = message.type;

        let responseMessage;

        if (messageType === 'text') {
          const commandResponse = handleTextCommand(message.text.body);
          responseMessage = commandResponse || `👋 Send me a photo of your meal and I'll analyze it!`;
        }
        else if (messageType === 'image') {
          // Get image URL from Meta
          const imageId = message.image.id;
          const imageUrl = await getMetaImageUrl(imageId);

          if (imageUrl) {
            const analysis = await analyzeImageWithAI(imageUrl);
            responseMessage = formatNutritionMessage(analysis);

            if (analysis) {
              await saveMealLog(phoneNumber, analysis);
            }
          } else {
            responseMessage = '❌ Could not process the image. Please try again.';
          }
        }

        // Send response via Meta API
        await sendMetaMessage(phoneNumber, responseMessage);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('Meta Webhook Error:', error);
    res.sendStatus(500);
  }
});

/**
 * Meta API webhook verification
 */
app.get('/webhook/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('✅ Meta webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * Get image URL from Meta Graph API
 */
async function getMetaImageUrl(imageId) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${imageId}`,
      {
        headers: { Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}` }
      }
    );
    return response.data.url;
  } catch (error) {
    console.error('Error getting Meta image:', error);
    return null;
  }
}

/**
 * Send message via Meta WhatsApp Business API
 */
async function sendMetaMessage(to, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error sending Meta message:', error);
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GymEZ WhatsApp Meal Bot',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API endpoint for manual analysis (for testing)
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const analysis = await analyzeImageWithAI(imageUrl);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🏋️ GymEZ WhatsApp Meal Bot is running!
  
  📡 Port: ${PORT}
  🔗 Twilio Webhook: /webhook/twilio
  🔗 Meta Webhook: /webhook/meta
  ❤️  Health Check: /health
  
  Ready to analyze meals! 🍽️
  `);
});

module.exports = app;
