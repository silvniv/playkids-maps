import { supabase, IS_OFFLINE_MODE } from './supabase';
import type { ReportType } from '../types';

export const reportsService = {
  async createReport(placeId: string, type: ReportType, description: string): Promise<void> {
    if (IS_OFFLINE_MODE) {
      throw new Error('Modo offline: relato de problema disponível apenas conectado ao Supabase.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) throw new Error('Você precisa estar logado para relatar um problema.');

    const { error } = await supabase.from('reports').insert({
      place_id: placeId,
      user_id: uid,
      type,
      description,
    });

    if (error) throw error;
  },
};
