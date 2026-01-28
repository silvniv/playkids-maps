import { supabase, IS_OFFLINE_MODE } from './supabase';
import type { Review } from '../types';

export type CreateReviewInput = Omit<Review, 'id' | 'user_id' | 'created_at'>;

export const reviewsService = {
  async listReviews(placeId: string): Promise<Review[]> {
    if (IS_OFFLINE_MODE) {
      // Modo offline: sem backend, retornamos lista vazia.
      return [];
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as any;
  },

  async createReview(input: CreateReviewInput): Promise<void> {
    if (IS_OFFLINE_MODE) {
      throw new Error('Modo offline: avaliação disponível apenas conectado ao Supabase.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) throw new Error('Você precisa estar logado para avaliar.');

    const { error } = await supabase.from('reviews').insert({
      ...input,
      user_id: uid,
    } as any);

    if (error) throw error;
  },
};
