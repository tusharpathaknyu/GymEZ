import { supabase } from './supabase';
import { Gym } from '../types';

// Enhanced Gym Service with mock data and real functionality
export class GymService {
  // Mock gym data for NYC area
  static getMockNearbyGyms(): Gym[] {
    return [
      {
        id: 'gym_1',
        name: 'Equinox Tribeca',
        address: '101 Avenue of the Americas',
        city: 'New York',
        state: 'NY',
        zip_code: '10013',
        phone: '(212) 334-4900',
        latitude: 40.7238,
        longitude: -74.0054,
        rating: 4.5,
        price_range: 5,
        amenities: [
          'Swimming Pool',
          'Sauna',
          'Steam Room',
          'Personal Training',
          'Group Classes',
          'Locker Rooms',
          'Towel Service',
          'Parking',
        ],
        hours: {
          Monday: { open: '05:00', close: '23:00' },
          Tuesday: { open: '05:00', close: '23:00' },
          Wednesday: { open: '05:00', close: '23:00' },
          Thursday: { open: '05:00', close: '23:00' },
          Friday: { open: '05:00', close: '22:00' },
          Saturday: { open: '07:00', close: '21:00' },
          Sunday: { open: '07:00', close: '21:00' },
        },
        photos: ['gym1_1.jpg'],
        description: 'Premium fitness club with state-of-the-art equipment',
        membership_types: [
          {
            name: 'All Access',
            price_monthly: 185,
            benefits: [
              'Access to all locations',
              'Group classes',
              'Pool access',
            ],
          },
        ],
      },
      {
        id: 'gym_2',
        name: 'Planet Fitness - Manhattan',
        address: '538 9th Avenue',
        city: 'New York',
        state: 'NY',
        zip_code: '10018',
        phone: '(212) 564-4653',
        latitude: 40.7569,
        longitude: -73.9873,
        rating: 3.8,
        price_range: 1,
        amenities: [
          'Cardio Equipment',
          'Weight Training',
          'Locker Rooms',
          'HydroMassage',
          'Massage Chairs',
          'Free Fitness Training',
        ],
        hours: {
          Monday: { open: '04:00', close: '00:00' },
          Tuesday: { open: '04:00', close: '00:00' },
          Wednesday: { open: '04:00', close: '00:00' },
          Thursday: { open: '04:00', close: '00:00' },
          Friday: { open: '04:00', close: '22:00' },
          Saturday: { open: '06:00', close: '22:00' },
          Sunday: { open: '06:00', close: '22:00' },
        },
        photos: ['gym2_1.jpg'],
        description: 'Affordable gym with judgment-free environment',
        membership_types: [
          {
            name: 'Classic',
            price_monthly: 10,
            benefits: ['Access to home club', 'Free fitness training'],
          },
        ],
      },
    ];
  }

  /**
   * Get gyms near a pincode (simplified - in production you'd use geocoding API)
   */
  static async getNearbyGyms(
    userPincode: string,
    limit: number = 10,
  ): Promise<Gym[]> {
    try {
      // Return mock data for now
      return this.getMockNearbyGyms().slice(0, limit);
      // TODO: In production, implement real gym search:
      // const { data, error } = await supabase
      //   .from('gyms')
      //   .select('*')
      //   .order('created_at', { ascending: false })
      //   .limit(limit);
      // if (error) throw new Error(`Failed to fetch gyms: ${error.message}`);
      // return data;
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
      throw error;
    }
  }

  /**
   * Search gyms by name or location
   */
  static async searchGyms(query: string, limit: number = 20): Promise<Gym[]> {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .or(
          `name.ilike.%${query}%,address.ilike.%${query}%,pincode.ilike.%${query}%`,
        )
        .limit(limit);

      if (error) {
        throw new Error(`Failed to search gyms: ${error.message}`);
      }

      return data as Gym[];
    } catch (error) {
      console.error('Error searching gyms:', error);
      throw error;
    }
  }

  /**
   * Get all gyms (for gym owners/admin)
   */
  static async getAllGyms(): Promise<Gym[]> {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch gyms: ${error.message}`);
      }

      return data as Gym[];
    } catch (error) {
      console.error('Error fetching all gyms:', error);
      throw error;
    }
  }

  /**
   * Get gym by ID
   */
  static async getGymById(gymId: string): Promise<Gym | null> {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', gymId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Gym not found
        }
        throw new Error(`Failed to fetch gym: ${error.message}`);
      }

      return data as Gym;
    } catch (error) {
      console.error('Error fetching gym:', error);
      throw error;
    }
  }

  /**
   * Join a gym (update user's gym_id)
   */
  static async joinGym(userId: string, gymId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gym_id: gymId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to join gym: ${error.message}`);
      }
    } catch (error) {
      console.error('Error joining gym:', error);
      throw error;
    }
  }

  /**
   * Create a new gym (for gym owners)
   */
  static async createGym(gymData: {
    name: string;
    address: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;
    description?: string;
    facilities?: string[];
    membership_cost?: number;
    owner_id: string;
  }): Promise<Gym> {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .insert(gymData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create gym: ${error.message}`);
      }

      return data as Gym;
    } catch (error) {
      console.error('Error creating gym:', error);
      throw error;
    }
  }

  /**
   * Get gym members count
   */
  static async getGymMemberCount(gymId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('gym_id', gymId)
        .eq('user_type', 'gym_member');

      if (error) {
        throw new Error(`Failed to get member count: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting member count:', error);
      return 0;
    }
  }

  /**
   * Simple pincode distance calculation
   * In production, use proper geocoding and haversine formula
   */
  private static calculatePincodeDistance(
    pincode1: string,
    pincode2: string,
  ): number {
    // Simple numeric difference for demo purposes
    const num1 = parseInt(pincode1) || 0;
    const num2 = parseInt(pincode2) || 0;
    return Math.abs(num1 - num2);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateRealDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private static toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
