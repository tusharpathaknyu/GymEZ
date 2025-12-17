import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../services/auth';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = true,
  danger = false,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingIcon}>
      <Text style={styles.settingIconText}>{icon}</Text>
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && styles.dangerText]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (showArrow && onPress && (
      <Text style={styles.arrowIcon}>›</Text>
    ))}
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [prNotifications, setPrNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data including workouts, PRs, and progress will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Contact Support',
              'To delete your account, please contact support@gymez.app'
            );
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://gymez.app/privacy');
  };

  const openTerms = () => {
    Linking.openURL('https://gymez.app/terms');
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@gymez.app');
  };

  const handleRateApp = () => {
    Alert.alert('Rate GymEZ', 'Would you like to rate our app on the Play Store?', [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Rate Now', onPress: () => Linking.openURL('market://details?id=com.gymez.app') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="👤"
              title="Edit Profile"
              subtitle="Name, bio, profile picture"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <SettingItem
              icon="🔐"
              title="Change Password"
              onPress={() => Alert.alert('Coming Soon', 'Password change feature is coming soon!')}
            />
            <SettingItem
              icon="📧"
              title="Email"
              subtitle={user?.email}
              showArrow={false}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="🔔"
              title="Push Notifications"
              subtitle="Enable all notifications"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={notifications ? '#10b981' : '#f4f3f4'}
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="💪"
              title="Workout Reminders"
              subtitle="Daily workout reminders"
              rightElement={
                <Switch
                  value={workoutReminders}
                  onValueChange={setWorkoutReminders}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={workoutReminders ? '#10b981' : '#f4f3f4'}
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="🏆"
              title="PR Notifications"
              subtitle="When friends hit new PRs"
              rightElement={
                <Switch
                  value={prNotifications}
                  onValueChange={setPrNotifications}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={prNotifications ? '#10b981' : '#f4f3f4'}
                />
              }
              showArrow={false}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="🌙"
              title="Dark Mode"
              subtitle="Coming soon"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={darkMode ? '#10b981' : '#f4f3f4'}
                  disabled
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="📍"
              title="Location Services"
              subtitle="Required for gym check-ins"
              rightElement={
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={locationEnabled ? '#10b981' : '#f4f3f4'}
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="🏋️"
              title="Units"
              subtitle="Kilograms (kg)"
              onPress={() => Alert.alert('Units', 'Weight unit settings coming soon!')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="❓"
              title="Help & FAQ"
              onPress={() => Alert.alert('Help', 'Help center coming soon!')}
            />
            <SettingItem
              icon="📧"
              title="Contact Support"
              subtitle="support@gymez.app"
              onPress={handleSupport}
            />
            <SettingItem
              icon="⭐"
              title="Rate GymEZ"
              subtitle="Love the app? Rate us!"
              onPress={handleRateApp}
            />
            <SettingItem
              icon="📢"
              title="Send Feedback"
              onPress={() => Alert.alert('Feedback', 'Thanks for wanting to help! Email us at feedback@gymez.app')}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="📜"
              title="Privacy Policy"
              onPress={openPrivacyPolicy}
            />
            <SettingItem
              icon="📋"
              title="Terms of Service"
              onPress={openTerms}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerText]}>Danger Zone</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="🚪"
              title="Sign Out"
              onPress={handleSignOut}
              danger
            />
            <SettingItem
              icon="🗑️"
              title="Delete Account"
              subtitle="Permanently delete all data"
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>GymEZ</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 GymEZ. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIconText: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: '300',
  },
  dangerText: {
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
});

export default SettingsScreen;
