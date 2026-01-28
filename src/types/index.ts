export type PlaceStatus = 'pending' | 'verified' | 'rejected';
export type Conservation = 'poor' | 'ok' | 'good';
export type ReportType =
  | 'broken_toy'
  | 'risk'
  | 'no_maintenance'
  | 'dirty'
  | 'bad_lighting'
  | 'other';

export type Place = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  lat: number;
  lng: number;
  address_approx?: string | null;
  neighborhood?: string | null;
  age_range?: '0-2' | '3-5' | '6-8' | '9-12' | 'mixed' | string;
  accessibility?: boolean | null;

  infra_bathroom?: boolean | null;
  infra_changing_table?: boolean | null;
  infra_shade?: boolean | null;
  infra_water_fountain?: boolean | null;
  infra_fenced?: boolean | null;
  infra_toys?: boolean | null;

  safety_lighting?: boolean | null;
  safety_movement?: boolean | null;
  safety_conservation?: Conservation | string | null;

  status?: PlaceStatus | string | null;

  // opcionais (pode vir de view no futuro)
  avg_safety?: number | null;
  avg_infra?: number | null;
  reviews_count?: number | null;

  created_at?: string;
  updated_at?: string;
  created_by?: string;
};

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  safety_rating: number;
  infra_rating: number;
  age_range?: string | null;
  comment?: string | null;
  visited_at: string; // YYYY-MM-DD
  created_at?: string;
};

export type Report = {
  id: string;
  place_id: string;
  user_id: string;
  type: ReportType;
  description: string;
  photo_path?: string | null;
  status?: string | null;
  created_at?: string;
};
