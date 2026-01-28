import { useCallback, useEffect, useState } from 'react';
import type { Place } from '../types';
import { placesService } from '../services/placesService';

export function usePlaces() {
  const [data, setData] = useState<Place[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const res = await placesService.listPlaces();
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

export function usePlace(id: string) {
  const [data, setData] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<any>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setIsLoading(true);
      const res = await placesService.getPlace(id);
      setData(res);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [id]);

  return { data, isLoading, error, refetch: load };
}
