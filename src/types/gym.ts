export interface Gym {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  rating: number;
  price_range: 1 | 2 | 3 | 4 | 5;
  amenities: string[];
  hours: {
    [key: string]: {
      open: string;
      close: string;
    } | null;
  };
  photos: string[];
  description: string;
  membership_types: {
    name: string;
    price_monthly: number;
    benefits: string[];
  }[];
}

export interface GymReview {
  id: string;
  gym_id: string;
  user_name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string;
  helpful_votes: number;
}

export interface SavedGym {
  gym_id: string;
  user_id: string;
  saved_at: string;
  notes?: string;
  favorite: boolean;
}
