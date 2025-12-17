import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reward tiers - profit optimized
export const REWARD_TIERS = [
  { workouts: 8, discount: 3, label: 'Bronze' },
  { workouts: 12, discount: 5, label: 'Silver' },
  { workouts: 16, discount: 8, label: 'Gold' },
  { workouts: 20, discount: 10, label: 'Platinum' },
  { workouts: 24, discount: 12, label: 'Diamond' },
];

// Constants
const GYM_RADIUS_METERS = 100; // Must be within 100m of gym
const MIN_WORKOUT_DURATION_MINUTES = 30;

interface GymLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface CheckInResult {
  success: boolean;
  message: string;
  checkInId?: string;
}

interface CheckOutResult {
  success: boolean;
  message: string;
  duration?: number;
  isVerified?: boolean;
}

interface RewardProgress {
  currentMonth: number;
  currentYear: number;
  verifiedWorkouts: number;
  currentTier: (typeof REWARD_TIERS)[0] | null;
  nextTier: (typeof REWARD_TIERS)[0] | null;
  workoutsToNextTier: number;
  discountPercentage: number;
}

class CheckInService {
  private activeCheckIn: string | null = null;

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Request location permissions
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS permissions are handled via Info.plist
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'GymEZ Location Permission',
            message:
              'GymEZ needs access to your location to verify gym check-ins.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return false;
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.error('Location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  /**
   * Check if user is within gym radius
   */
  isWithinGymRadius(
    userLat: number,
    userLon: number,
    gymLat: number,
    gymLon: number,
  ): boolean {
    const distance = this.calculateDistance(userLat, userLon, gymLat, gymLon);
    console.log(`Distance to gym: ${distance.toFixed(0)}m`);
    return distance <= GYM_RADIUS_METERS;
  }

  /**
   * Check if user has already checked in today
   */
  async hasCheckedInToday(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('gym_checkins')
      .select('id')
      .eq('user_id', userId)
      .gte('check_in_time', today.toISOString())
      .limit(1);

    if (error) {
      console.error("Error checking today's check-ins:", error);
      return false;
    }

    return data && data.length > 0;
  }

  /**
   * Get user's registered gym
   */
  async getUserGym(userId: string): Promise<GymLocation | null> {
    // First try user_gyms table
    const { data, error } = await supabase
      .from('user_gyms')
      .select(
        `
        gym_id,
        gyms (
          id,
          name,
          latitude,
          longitude
        )
      `,
      )
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (!error && data?.gyms) {
      const gym = data.gyms as unknown as GymLocation;
      return gym;
    }

    // Fallback: check profiles table for gym_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('gym_id')
      .eq('id', userId)
      .single();

    if (profile?.gym_id) {
      const { data: gym } = await supabase
        .from('gyms')
        .select('id, name, latitude, longitude')
        .eq('id', profile.gym_id)
        .single();

      if (gym) {
        return gym as GymLocation;
      }
    }

    return null;
  }

  /**
   * Get nearby gyms based on location
   */
  async getNearbyGyms(
    latitude: number,
    longitude: number,
  ): Promise<GymLocation[]> {
    const { data, error } = await supabase
      .from('gyms')
      .select('id, name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error || !data) {
      return [];
    }

    // Filter gyms within 500m and sort by distance
    return data
      .filter((gym: any) => {
        if (!gym.latitude || !gym.longitude) {
          return false;
        }
        const distance = this.calculateDistance(
          latitude,
          longitude,
          gym.latitude,
          gym.longitude,
        );
        return distance <= 500; // 500m radius for nearby gyms
      })
      .sort((a: any, b: any) => {
        const distA = this.calculateDistance(
          latitude,
          longitude,
          a.latitude,
          a.longitude,
        );
        const distB = this.calculateDistance(
          latitude,
          longitude,
          b.latitude,
          b.longitude,
        );
        return distA - distB;
      }) as GymLocation[];
  }

  /**
   * Check in to gym
   */
  async checkIn(userId: string, gymId?: string): Promise<CheckInResult> {
    try {
      // Check if already checked in today
      const alreadyCheckedIn = await this.hasCheckedInToday(userId);
      if (alreadyCheckedIn) {
        return {
          success: false,
          message: "You've already checked in today. Come back tomorrow!",
        };
      }

      // Get current location
      const location = await this.getCurrentLocation();
      if (!location) {
        return {
          success: false,
          message:
            'Could not get your location. Please enable location services.',
        };
      }

      // Get user's gym or use provided gymId
      let gym: GymLocation | null = null;

      if (gymId) {
        const { data } = await supabase
          .from('gyms')
          .select('id, name, latitude, longitude')
          .eq('id', gymId)
          .single();
        gym = data;
      } else {
        gym = await this.getUserGym(userId);
      }

      if (!gym) {
        // Try to find nearby gym
        const nearbyGyms = await this.getNearbyGyms(
          location.latitude,
          location.longitude,
        );
        if (nearbyGyms.length > 0) {
          gym = nearbyGyms[0];
        } else {
          return {
            success: false,
            message: 'No gym found nearby. Please select your gym first.',
          };
        }
      }

      // Verify user is at the gym (if gym has coordinates)
      if (gym.latitude && gym.longitude) {
        const isAtGym = this.isWithinGymRadius(
          location.latitude,
          location.longitude,
          gym.latitude,
          gym.longitude,
        );

        if (!isAtGym) {
          return {
            success: false,
            message: `You need to be at ${gym.name} to check in. Get within 100m of the gym.`,
          };
        }
      }

      // Create check-in record
      const { data, error } = await supabase
        .from('gym_checkins')
        .insert({
          user_id: userId,
          gym_id: gym.id,
          check_in_time: new Date().toISOString(),
          latitude: location.latitude,
          longitude: location.longitude,
          verification_method: 'gps',
          is_verified: false, // Will be verified on checkout
        })
        .select('id')
        .single();

      if (error) {
        console.error('Check-in error:', error);
        return {
          success: false,
          message: 'Failed to check in. Please try again.',
        };
      }

      // Store active check-in locally
      this.activeCheckIn = data.id;
      await AsyncStorage.setItem('activeCheckIn', data.id);
      await AsyncStorage.setItem('activeCheckInGym', gym.name);

      return {
        success: true,
        message: `Checked in at ${gym.name}! Remember to check out when you leave.`,
        checkInId: data.id,
      };
    } catch (error) {
      console.error('Check-in error:', error);
      return {
        success: false,
        message: 'An error occurred during check-in.',
      };
    }
  }

  /**
   * Check out from gym
   */
  async checkOut(userId: string): Promise<CheckOutResult> {
    try {
      // Get active check-in
      const checkInId =
        this.activeCheckIn || (await AsyncStorage.getItem('activeCheckIn'));

      if (!checkInId) {
        return {
          success: false,
          message: 'No active check-in found.',
        };
      }

      // Get check-in record
      const { data: checkIn, error: fetchError } = await supabase
        .from('gym_checkins')
        .select('*')
        .eq('id', checkInId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !checkIn) {
        // Clear stale check-in
        this.activeCheckIn = null;
        await AsyncStorage.removeItem('activeCheckIn');
        await AsyncStorage.removeItem('activeCheckInGym');
        return {
          success: false,
          message: 'Could not find your check-in. It may have expired.',
        };
      }

      // Calculate duration
      const checkInTime = new Date(checkIn.check_in_time);
      const checkOutTime = new Date();
      const durationMinutes = Math.floor(
        (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60),
      );

      // Verify minimum duration for reward eligibility
      const isVerified = durationMinutes >= MIN_WORKOUT_DURATION_MINUTES;

      // Update check-in record
      const { error: updateError } = await supabase
        .from('gym_checkins')
        .update({
          check_out_time: checkOutTime.toISOString(),
          duration_minutes: durationMinutes,
          is_verified: isVerified,
        })
        .eq('id', checkInId);

      if (updateError) {
        console.error('Check-out error:', updateError);
        return {
          success: false,
          message: 'Failed to check out. Please try again.',
        };
      }

      // Clear active check-in
      this.activeCheckIn = null;
      await AsyncStorage.removeItem('activeCheckIn');
      await AsyncStorage.removeItem('activeCheckInGym');

      // Update monthly rewards if verified
      if (isVerified) {
        await this.updateMonthlyRewards(userId);
      }

      const message = isVerified
        ? `Great workout! ${durationMinutes} minutes logged. This counts toward your monthly rewards!`
        : `Checked out after ${durationMinutes} minutes. Workouts need to be ${MIN_WORKOUT_DURATION_MINUTES}+ minutes to count toward rewards.`;

      return {
        success: true,
        message,
        duration: durationMinutes,
        isVerified,
      };
    } catch (error) {
      console.error('Check-out error:', error);
      return {
        success: false,
        message: 'An error occurred during check-out.',
      };
    }
  }

  /**
   * Update monthly rewards count
   */
  async updateMonthlyRewards(userId: string): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Get or create monthly record
    const { data: existing } = await supabase
      .from('monthly_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (existing) {
      // Update existing record
      const newWorkouts = existing.verified_workouts + 1;
      const tier = this.calculateTier(newWorkouts);

      await supabase
        .from('monthly_rewards')
        .update({
          verified_workouts: newWorkouts,
          reward_tier: tier?.label || null,
          discount_percentage: tier?.discount || 0,
        })
        .eq('id', existing.id);
    } else {
      // Create new record
      const tier = this.calculateTier(1);

      await supabase.from('monthly_rewards').insert({
        user_id: userId,
        month,
        year,
        verified_workouts: 1,
        reward_tier: tier?.label || null,
        discount_percentage: tier?.discount || 0,
      });
    }
  }

  /**
   * Calculate reward tier based on workouts
   */
  calculateTier(workouts: number): (typeof REWARD_TIERS)[0] | null {
    let currentTier = null;
    for (const tier of REWARD_TIERS) {
      if (workouts >= tier.workouts) {
        currentTier = tier;
      }
    }
    return currentTier;
  }

  /**
   * Get user's reward progress
   */
  async getRewardProgress(userId: string): Promise<RewardProgress> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { data } = await supabase
      .from('monthly_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .single();

    const verifiedWorkouts = data?.verified_workouts || 0;
    const currentTier = this.calculateTier(verifiedWorkouts);

    // Find next tier
    let nextTier = null;
    for (const tier of REWARD_TIERS) {
      if (tier.workouts > verifiedWorkouts) {
        nextTier = tier;
        break;
      }
    }

    return {
      currentMonth: month,
      currentYear: year,
      verifiedWorkouts,
      currentTier,
      nextTier,
      workoutsToNextTier: nextTier ? nextTier.workouts - verifiedWorkouts : 0,
      discountPercentage: currentTier?.discount || 0,
    };
  }

  /**
   * Get check-in history
   */
  async getCheckInHistory(userId: string, limit = 30): Promise<any[]> {
    const { data, error } = await supabase
      .from('gym_checkins')
      .select(
        `
        *,
        gyms (name)
      `,
      )
      .eq('user_id', userId)
      .order('check_in_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching check-in history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if user has active check-in
   */
  async hasActiveCheckIn(): Promise<boolean> {
    const checkInId =
      this.activeCheckIn || (await AsyncStorage.getItem('activeCheckIn'));
    return !!checkInId;
  }

  /**
   * Get active check-in details
   */
  async getActiveCheckIn(userId: string): Promise<any | null> {
    const checkInId =
      this.activeCheckIn || (await AsyncStorage.getItem('activeCheckIn'));

    if (!checkInId) {
      return null;
    }

    const { data } = await supabase
      .from('gym_checkins')
      .select(
        `
        *,
        gyms (name)
      `,
      )
      .eq('id', checkInId)
      .eq('user_id', userId)
      .is('check_out_time', null)
      .single();

    // If no active check-in found in DB, clear local storage
    if (!data) {
      this.activeCheckIn = null;
      await AsyncStorage.removeItem('activeCheckIn');
      await AsyncStorage.removeItem('activeCheckInGym');
    }

    return data;
  }

  /**
   * Register user's gym
   */
  async registerUserGym(
    userId: string,
    gymId: string,
    isPrimary = true,
  ): Promise<boolean> {
    try {
      // If setting as primary, unset other primaries first
      if (isPrimary) {
        await supabase
          .from('user_gyms')
          .update({ is_primary: false })
          .eq('user_id', userId);
      }

      const { error } = await supabase.from('user_gyms').upsert(
        {
          user_id: userId,
          gym_id: gymId,
          is_primary: isPrimary,
        },
        {
          onConflict: 'user_id,gym_id',
        },
      );

      if (error) {
        console.error('Error registering gym:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error registering gym:', error);
      return false;
    }
  }
}

export const checkInService = new CheckInService();
export default checkInService;
