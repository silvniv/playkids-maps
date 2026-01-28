import { supabase, IS_OFFLINE_MODE } from './supabase';
import { offlinePlacesService } from './offlineDb';
import type { Place } from '../types';

type CreatePlaceInput = {
  name: string;
  category: string;
  lat: number;
  lng: number;
  neighborhood?: string | null;
  address_approx?: string | null;
  description?: string | null;
  accessibility?: boolean | null;
  created_by?: string;
};

export const placesService = {
  async listPlaces(): Promise<Place[]> {
    if (IS_OFFLINE_MODE) {
      return offlinePlacesService.listPlaces();
    }

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as any;
  },

  async getPlace(id: string): Promise<Place | null> {
    if (IS_OFFLINE_MODE) {
      return offlinePlacesService.getPlace(id);
    }

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data ?? null) as any;
  },

  async createPlace(input: CreatePlaceInput): Promise<Place> {
    // Validar coordenadas
    if (input.lat < -90 || input.lat > 90) {
      throw new Error('Latitude inválida. Deve estar entre -90 e 90.');
    }
    if (input.lng < -180 || input.lng > 180) {
      throw new Error('Longitude inválida. Deve estar entre -180 e 180.');
    }

    if (IS_OFFLINE_MODE) {
      return offlinePlacesService.createPlace(input);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const createdBy = sessionData.session?.user?.id;

    if (!createdBy) {
      throw new Error('Você precisa estar logado para criar um local.');
    }

    const payload = {
      name: input.name,
      category: input.category,
      lat: input.lat,
      lng: input.lng,
      neighborhood: input.neighborhood ?? '',
      address_approx: input.address_approx ?? '',
      description: input.description ?? '',
      accessibility: input.accessibility ?? false,
      created_by: createdBy,
    } as any;

    const { data, error } = await supabase
      .from('places')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as any;
  },
};
