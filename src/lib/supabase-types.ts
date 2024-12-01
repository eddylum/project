export interface Property {
  id: string;
  name: string;
  address: string;
  image_url: string;
  user_id: string;
  created_at: string;
  contact_phone?: string;
  contact_guide_url?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  property_id: string;
  user_id?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  property_id: string;
  services: Service[];
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  created_at: string;
  stripe_session_id?: string;
  guest_email: string;
  guest_name: string;
  arrival_date: string;
}