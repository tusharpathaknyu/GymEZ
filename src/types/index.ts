// User role types
export type UserRole = 'gym_owner' | 'gym_member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface GymOwner extends User {
  role: 'gym_owner';
  gymId?: string;
  gymName?: string;
}

export interface GymMember extends User {
  role: 'gym_member';
  memberships?: Membership[];
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  description: string;
  ownerId: string;
  facilities: string[];
  pricing: {
    monthly: number;
    quarterly: number;
    annual: number;
  };
  images?: string[];
  rating?: number;
}

export interface Membership {
  id: string;
  gymId: string;
  gymName: string;
  memberId: string;
  startDate: string;
  endDate: string;
  type: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'expired' | 'cancelled';
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipId: string;
  joinDate: string;
  status: 'active' | 'inactive';
}
