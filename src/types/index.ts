
export type UserRole = 'admin' | 'merchandiser';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  monthly_revenue: number;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export type POSMType = 'COC' | 'hangsell' | 'standee';

export interface StorePOSM {
  id: string;
  store_id: string;
  posm_type: POSMType;
  created_at: string;
}

export interface StoreVisit {
  id: string;
  store_id: string;
  merchandiser_id: string;
  scheduled_date: string;
  visit_order: number;
  before_image_url?: string;
  after_image_url?: string;
  completed_at?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  store?: Store;
  store_posms?: StorePOSM[];
  planogram?: Planogram;
}

export interface Planogram {
  id: string;
  store_id: string;
  image_url: string;
  created_at: string;
}

export interface ComplianceScore {
  id: string;
  store_visit_id: string;
  score: number;
  notes?: string;
  created_at: string;
  created_by: string;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}
