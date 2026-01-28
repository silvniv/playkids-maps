import { useCallback, useEffect, useState } from 'react';
import type { Review } from '../types';
import { reviewsService, type CreateReviewInput } from '../services/reviewsService';

export function useReviews(placeId: string) {
  const [data, setData] = useState<Review[] | null>(null);
  const [isLoading, setIsLoading] = useState(!!placeId);
  const [error, setError] = useState<any>(null);

  const load = useCallback(async () => {
    if (!placeId) return;
    try {
      setError(null);
      setIsLoading(true);
      const res = await reviewsService.listReviews(placeId);
      setData(res);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    load();
  }, [placeId]);

  return { data, isLoading, error, refetch: load };
}

export function useCreateReview() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (input: CreateReviewInput) => {
    setIsPending(true);
    try {
      await reviewsService.createReview(input);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutateAsync, isPending };
}
