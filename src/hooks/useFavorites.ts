import { useCallback, useEffect, useState } from 'react';
import type { Place } from '../types';
import { favoritesService } from '../services/favoritesService';

export function useFavorites() {
  const [data, setData] = useState<Place[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const res = await favoritesService.listFavorites();
      setData(res);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, isLoading, error, refetch: load };
}

export function useIsFavorite(placeId: string) {
  const [data, setData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(!!placeId);
  const [error, setError] = useState<any>(null);

  const load = useCallback(async () => {
    if (!placeId) return;
    try {
      setError(null);
      setIsLoading(true);
      const res = await favoritesService.isFavorite(placeId);
      setData(res);
    } catch (e) {
      setError(e);
      setData(false);
    } finally {
      setIsLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    load();
  }, [placeId]);

  return { data, isLoading, error, refetch: load };
}

export function useToggleFavorite() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({ placeId, isFavorite }: { placeId: string; isFavorite: boolean }) => {
    setIsPending(true);
    try {
      if (isFavorite) await favoritesService.remove(placeId);
      else await favoritesService.add(placeId);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}
