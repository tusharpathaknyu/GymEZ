import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '💪', text: 'Best exercises for chest?' },
  { icon: '🍗', text: 'How much protein do I need?' },
  { icon: '😴', text: 'How to improve recovery?' },
  { icon: '🔥', text: 'How to break a plateau?' },
  { icon: '🏃', text: 'Cardio or weights first?' },
  { icon: '⏰', text: 'Best time to workout?' },
];

// AI responses for common fitness questions (local fallback)
const AI_RESPONSES: { [key: string]: string } = {
  'chest': `Great question! Here are the **best exercises for chest**:

🏋️ **Compound Movements:**
• Barbell Bench Press - The king of chest exercises
• Incline Dumbbell Press - Upper chest focus
• Dips - Lower chest & triceps

🎯 **Isolation Exercises:**
• Cable Flyes - Constant tension
• Pec Deck Machine - Safe & effective
• Dumbbell Flyes - Great stretch

💡 **Pro Tips:**
• Train chest 2x per week for optimal growth
• Progressive overload is key
• Mind-muscle connection matters!`,

  'protein': `Here's what you need to know about **protein intake**:

📊 **Daily Requirements:**
• Building muscle: 0.8-1g per lb bodyweight
• Maintaining: 0.6-0.8g per lb bodyweight
• Cutting: 1-1.2g per lb (preserve muscle)

🍖 **Best Sources:**
• Chicken breast (31g per 100g)
• Greek yogurt (10g per 100g)
• Eggs (6g per egg)
• Whey protein (25g per scoop)

⏰ **Timing Tips:**
• Spread intake across 4-5 meals
• Post-workout: 25-40g within 2 hours
• Before bed: casein or cottage cheese`,

  'recovery': `Here's how to **optimize your recovery**:

😴 **Sleep (Most Important!):**
• Aim for 7-9 hours per night
• Keep consistent sleep schedule
• Cool, dark room (65-68°F)

🥗 **Nutrition:**
• Adequate protein (see protein guide)
• Carbs replenish glycogen
• Stay hydrated (1oz per lb bodyweight)

🧘 **Active Recovery:**
• Light cardio on rest days
• Stretching & mobility work
• Foam rolling tight muscles

💆 **Other Strategies:**
• Contrast showers (hot/cold)
• Massage or percussion therapy
• Manage stress levels`,

  'plateau': `Let's **break that plateau**! Here's how:

🔄 **Change Your Training:**
• Vary rep ranges (try 5x5, 4x8, 3x12)
• Change exercise order
• Try new exercises
• Increase training frequency

📈 **Progressive Overload:**
• Add 2.5-5lbs when you hit rep targets
• Add an extra set
• Decrease rest times
• Improve form/range of motion

🍽️ **Nutrition Check:**
• Are you eating enough? (especially if bulking)
• Protein intake adequate?
• Consider a diet break if cutting

😴 **Recovery:**
• Getting enough sleep?
• Stress levels managed?
• Taking deload weeks?`,

  'cardio': `**Cardio vs Weights - Which First?**

🎯 **It Depends on Your Goal:**

**If Building Muscle/Strength:**
• Weights FIRST, cardio after
• Lifting when fresh = better performance
• Keep cardio separate if possible

**If Fat Loss is Priority:**
• Either order works
• Some prefer fasted cardio AM, weights PM
• HIIT after weights is effective

**If Endurance Focused:**
• Cardio first or separate days
• Don't skip the weights though!

💡 **Best Practice:**
• Separate them by 6+ hours if possible
• If same session: prioritize your main goal
• Low-intensity cardio is fine anytime`,

  'time': `**Best Time to Workout** - Here's the science:

⏰ **Afternoon/Evening (2-6 PM):**
• Body temperature peaks
• Reaction time best
• Testosterone highest
• Most people are strongest here

🌅 **Morning Benefits:**
• Consistency (fewer schedule conflicts)
• Boosts metabolism all day
• Mental clarity & energy
• Empty gym!

🌙 **Evening Considerations:**
• May affect sleep (finish 2-3hrs before bed)
• Often crowded gyms
• Post-work stress relief

🎯 **The Truth:**
The BEST time is when you'll **actually do it consistently**. Your body adapts to your schedule!`,

  'default': `Great question! Here's what I can help with:

💪 **Training:**
• Exercise recommendations
• Workout programming
• Form tips & technique
• Breaking plateaus

🥗 **Nutrition:**
• Protein requirements
• Meal timing
• Macro calculations
• Supplement advice

😴 **Recovery:**
• Sleep optimization
• Active recovery
• Injury prevention
• Deload strategies

Ask me anything specific and I'll give you detailed guidance!`,
};

const AICoachScreen = ({ navigation }: { navigation: any }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey! 👋 I'm your **AI Fitness Coach**!

I can help you with:
• 💪 Training advice & exercises
• 🥗 Nutrition & meal planning  
• 😴 Recovery optimization
• 🎯 Goal setting & motivation

What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('chest') || lowerQuery.includes('pec')) {
      return AI_RESPONSES['chest'];
    } else if (lowerQuery.includes('protein') || lowerQuery.includes('how much')) {
      return AI_RESPONSES['protein'];
    } else if (lowerQuery.includes('recovery') || lowerQuery.includes('rest') || lowerQuery.includes('sleep')) {
      return AI_RESPONSES['recovery'];
    } else if (lowerQuery.includes('plateau') || lowerQuery.includes('stuck') || lowerQuery.includes('not growing')) {
      return AI_RESPONSES['plateau'];
    } else if (lowerQuery.includes('cardio') || lowerQuery.includes('weights first')) {
      return AI_RESPONSES['cardio'];
    } else if (lowerQuery.includes('time') || lowerQuery.includes('when') || lowerQuery.includes('morning') || lowerQuery.includes('evening')) {
      return AI_RESPONSES['time'];
    } else if (lowerQuery.includes('back') || lowerQuery.includes('lat')) {
      return `**Best Back Exercises:**

🏋️ **Width (Lats):**
• Pull-ups / Lat Pulldowns
• Seated Cable Rows (wide grip)
• Single-arm Dumbbell Rows

💪 **Thickness:**
• Barbell Rows
• T-Bar Rows
• Face Pulls (rear delts too)

Pro tip: Focus on "pulling with elbows" not hands!`;
    } else if (lowerQuery.includes('leg') || lowerQuery.includes('squat')) {
      return `**Best Leg Exercises:**

🦵 **Quads:**
• Barbell Back Squats
• Leg Press
• Bulgarian Split Squats
• Leg Extensions

🍑 **Hamstrings & Glutes:**
• Romanian Deadlifts
• Leg Curls
• Hip Thrusts
• Walking Lunges

Train legs 2x/week for optimal growth!`;
    } else if (lowerQuery.includes('arm') || lowerQuery.includes('bicep') || lowerQuery.includes('tricep')) {
      return `**Best Arm Exercises:**

💪 **Biceps:**
• Barbell Curls
• Incline Dumbbell Curls
• Hammer Curls
• Cable Curls

🔱 **Triceps:**
• Close-grip Bench Press
• Skull Crushers
• Tricep Pushdowns
• Overhead Extensions

Arms recover fast - can train 2-3x/week!`;
    } else if (lowerQuery.includes('shoulder') || lowerQuery.includes('delt')) {
      return `**Best Shoulder Exercises:**

🎯 **Front Delts:**
• Overhead Press (already hit from bench)
• Front Raises (optional)

📐 **Side Delts:**
• Lateral Raises (15-20 reps)
• Cable Lateral Raises
• Upright Rows

🔙 **Rear Delts:**
• Face Pulls
• Reverse Pec Deck
• Rear Delt Flyes

Side delts need high volume for that 3D look!`;
    } else if (lowerQuery.includes('lose') || lowerQuery.includes('fat') || lowerQuery.includes('cut')) {
      return `**Fat Loss Guide:**

📉 **Calorie Deficit:**
• 500 cal deficit = ~1lb/week loss
• Track your food (MyFitnessPal)
• High protein preserves muscle

🏋️ **Training:**
• Keep lifting heavy (maintain strength)
• Add cardio gradually
• HIIT is time-efficient

🍽️ **Nutrition Tips:**
• High protein (1g/lb bodyweight)
• High volume foods (veggies, lean meats)
• Stay hydrated
• Don't crash diet!`;
    } else if (lowerQuery.includes('bulk') || lowerQuery.includes('gain') || lowerQuery.includes('mass')) {
      return `**Muscle Building Guide:**

📈 **Calorie Surplus:**
• 300-500 cal surplus for lean gains
• Track macros, especially protein
• Weigh yourself weekly

🏋️ **Training:**
• Progressive overload is KEY
• Train each muscle 2x/week
• 10-20 sets per muscle group/week
• Focus on compound lifts

🍽️ **Nutrition:**
• 0.8-1g protein per lb bodyweight
• Carbs fuel your workouts
• Don't fear healthy fats`;
    }
    
    return AI_RESPONSES['default'];
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    buttonPress();
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Get AI response
    const aiResponse = getAIResponse(messageText);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
    successHaptic();

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🤖</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>🤖</Text>
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
              <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
              <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
              <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <View style={styles.quickPromptsContainer}>
          <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_PROMPTS.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickPrompt}
                onPress={() => handleSend(prompt.text)}
              >
                <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
                <Text style={styles.quickPromptText}>{prompt.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about fitness..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#10b981',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatar: {
    fontSize: 20,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    maxWidth: width - 100,
  },
  userBubble: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  userMessageText: {
    color: '#fff',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  quickPromptsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 10,
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickPromptIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  quickPromptText: {
    fontSize: 13,
    color: '#374151',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});

export default AICoachScreen;
