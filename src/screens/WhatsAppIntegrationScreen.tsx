import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
  Image,
  Clipboard,
} from 'react-native';
import { buttonPress, successHaptic } from '../utils/haptics';

// WhatsApp bot phone number (update this with your actual number)
const WHATSAPP_BOT_NUMBER = '+1234567890'; // Replace with your Twilio/Meta number
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_BOT_NUMBER.replace('+', '')}?text=help`;

const WhatsAppIntegrationScreen = ({ navigation }: { navigation: any }) => {
  const [isConnected, setIsConnected] = useState(false);

  const openWhatsApp = async () => {
    buttonPress();
    try {
      const supported = await Linking.canOpenURL(WHATSAPP_LINK);
      if (supported) {
        await Linking.openURL(WHATSAPP_LINK);
      } else {
        Alert.alert(
          'WhatsApp Not Found',
          'Please install WhatsApp to use this feature'
        );
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  };

  const copyNumber = () => {
    buttonPress();
    Clipboard.setString(WHATSAPP_BOT_NUMBER);
    successHaptic();
    Alert.alert('Copied!', 'Phone number copied to clipboard');
  };

  const shareWithFriends = async () => {
    buttonPress();
    try {
      await Share.share({
        message: `🏋️ Check out GymEZ's WhatsApp Meal Tracker!\n\nJust send food photos on WhatsApp and get instant nutrition analysis!\n\n📱 Add this number: ${WHATSAPP_BOT_NUMBER}\n\nDownload GymEZ: https://gymez.app`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const features = [
    {
      icon: '📸',
      title: 'Snap Your Meal',
      description: 'Take a photo of any meal or snack',
    },
    {
      icon: '📤',
      title: 'Send on WhatsApp',
      description: 'Send the photo to our bot number',
    },
    {
      icon: '🤖',
      title: 'AI Analysis',
      description: 'Get instant nutrition breakdown',
    },
    {
      icon: '📊',
      title: 'Auto-Logged',
      description: 'Meal syncs to your GymEZ app',
    },
  ];

  const commands = [
    { cmd: 'help', desc: 'Show all commands' },
    { cmd: 'today', desc: 'See today\'s meals' },
    { cmd: 'goals', desc: 'View macro goals' },
    { cmd: 'tip', desc: 'Get nutrition tip' },
    { cmd: '📸 Photo', desc: 'Analyze meal' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WhatsApp Meal Tracker</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.whatsappIcon}>
            <Text style={styles.whatsappEmoji}>💬</Text>
          </View>
          <Text style={styles.heroTitle}>Track Meals on WhatsApp</Text>
          <Text style={styles.heroSubtitle}>
            Send food photos on WhatsApp and get instant AI-powered nutrition analysis!
          </Text>
        </View>

        {/* Quick Connect Button */}
        <TouchableOpacity style={styles.connectButton} onPress={openWhatsApp}>
          <View style={styles.connectIconContainer}>
            <Text style={styles.connectIcon}>📱</Text>
          </View>
          <View style={styles.connectContent}>
            <Text style={styles.connectTitle}>Open WhatsApp</Text>
            <Text style={styles.connectSubtitle}>Start tracking your meals now</Text>
          </View>
          <Text style={styles.connectArrow}>→</Text>
        </TouchableOpacity>

        {/* Phone Number Card */}
        <View style={styles.phoneCard}>
          <Text style={styles.phoneLabel}>Bot Number</Text>
          <Text style={styles.phoneNumber}>{WHATSAPP_BOT_NUMBER}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyNumber}>
            <Text style={styles.copyText}>📋 Copy Number</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{feature.title}</Text>
                  <Text style={styles.stepDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Commands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bot Commands</Text>
          <View style={styles.commandsCard}>
            {commands.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.commandRow,
                  index < commands.length - 1 && styles.commandBorder,
                ]}
              >
                <View style={styles.commandBadge}>
                  <Text style={styles.commandText}>{item.cmd}</Text>
                </View>
                <Text style={styles.commandDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Example Response */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example Response</Text>
          <View style={styles.exampleCard}>
            <View style={styles.messageContainer}>
              <View style={styles.userMessage}>
                <Text style={styles.userMessageText}>📸 [Food Photo]</Text>
              </View>
              <View style={styles.botMessage}>
                <Text style={styles.botMessageText}>
                  🍽️ <Text style={styles.bold}>GymEZ Meal Analysis</Text>{'\n\n'}
                  📋 <Text style={styles.bold}>Foods Detected:</Text>{'\n'}
                  1. Grilled Chicken (150g){'\n'}
                  2. Brown Rice (200g){'\n'}
                  3. Broccoli (100g){'\n\n'}
                  📊 <Text style={styles.bold}>Total Macros:</Text>{'\n'}
                  🔥 Calories: 542{'\n'}
                  💪 Protein: 54g{'\n'}
                  🍞 Carbs: 63g{'\n'}
                  🥑 Fats: 7g{'\n\n'}
                  🟢 <Text style={styles.bold}>Health Score:</Text> 9/10{'\n\n'}
                  💡 Great balanced meal!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>✨ Benefits</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Faster than opening the app</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🔄</Text>
            <Text style={styles.benefitText}>Auto-syncs with your GymEZ account</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🤖</Text>
            <Text style={styles.benefitText}>AI-powered accurate analysis</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📱</Text>
            <Text style={styles.benefitText}>Works anywhere, anytime</Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={shareWithFriends}>
          <Text style={styles.shareButtonText}>📤 Share with Friends</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#25D366', // WhatsApp green
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#25D366',
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  whatsappIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  whatsappEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  connectButton: {
    marginHorizontal: 20,
    marginTop: -25,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  connectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  connectIcon: {
    fontSize: 24,
  },
  connectContent: {
    flex: 1,
  },
  connectTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  connectSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  connectArrow: {
    fontSize: 22,
    color: '#25D366',
    fontWeight: '600',
  },
  phoneCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  phoneLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIcon: {
    fontSize: 22,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  stepDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  commandsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  commandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  commandBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commandBadge: {
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  commandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  commandDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  exampleCard: {
    backgroundColor: '#075E54', // WhatsApp chat background
    borderRadius: 14,
    padding: 16,
  },
  messageContainer: {
    gap: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 12,
    borderRadius: 12,
    borderTopRightRadius: 4,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: 14,
    color: '#111827',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    maxWidth: '90%',
  },
  botMessageText: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
  benefitsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#166534',
  },
  shareButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#25D366',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WhatsAppIntegrationScreen;
