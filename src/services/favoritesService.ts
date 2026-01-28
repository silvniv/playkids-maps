import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, IS_OFFLINE_MODE } from './supabase';
import { offlinePlacesService } from './offlineDb';
import type { Place } from '../types';

const OFFLINE_FAVORITES_KEY = 'offline:favorites';

async function getOfflineFavoriteIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

async function setOfflineFavoriteIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_FAVORITES_KEY, JSON.stringify(ids));
}

export const favoritesService = {
  async listFavorites(): Promise<Place[]> {
    if (IS_OFFLINE_MODE) {
      const ids = await getOfflineFavoriteIds();
      if (!ids.length) return [];
      const places = await offlinePlacesService.listPlaces();
      const map = new Map(places.map((p) => [p.id, p]));
      return ids.map((id) => map.get(id)).filter(Boolean) as Place[];
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) {
      throw new Error('Você precisa estar logado para ver seus favoritos.');
    }

    const { data: favs, error: favErr } = await supabase
      .from('favorites')
      .select('place_id')
      .eq('user_id', uid);

    if (favErr) throw favErr;

    const placeIds = (favs ?? []).map((f: any) => f.place_id).filter(Boolean);
    if (!placeIds.length) return [];

    const { data: places, error } = await supabase
      .from('places')
      .select('*')
      .in('id', placeIds);

    if (error) throw error;

    const map = new Map((places ?? []).map((p: any) => [p.id, p]));
    return placeIds.map((id) => map.get(id)).filter(Boolean) as Place[];
  },

  async isFavorite(placeId: string): Promise<boolean> {
    if (IS_OFFLINE_MODE) {
      const ids = await getOfflineFavoriteIds();
      return ids.includes(placeId);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) {
      // Retorna false silenciosamente para não quebrar UI
      return false;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', uid)
      .eq('place_id', placeId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async add(placeId: string): Promise<void> {
    if (IS_OFFLINE_MODE) {
      const ids = await getOfflineFavoriteIds();
      if (!ids.includes(placeId)) {
        ids.push(placeId);
        await setOfflineFavoriteIds(ids);
      }
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) throw new Error('Você precisa estar logado para favoritar.');

    const { error } = await supabase.from('favorites').insert({
      user_id: uid,
      place_id: placeId,
    });

    if (error) throw error;
  },

  async remove(placeId: string): Promise<void> {
    if (IS_OFFLINE_MODE) {
      const ids = await getOfflineFavoriteIds();
      const filtered = ids.filter((id) => id !== placeId);
      await setOfflineFavoriteIds(filtered);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) throw new Error('Você precisa estar logado para remover favorito.');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', uid)
      .eq('place_id', placeId);

    if (error) throw error;
  },
};
