import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import type { AIModelRef } from '@nexusui/shared';

/** Hook for listing available AI models (user-facing slim view) */
export function useAIModels() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<AIModelRef[]>({
    queryKey: ['ai-models'],
    queryFn: () => api.getAIModels() as Promise<AIModelRef[]>,
    staleTime: 5 * 60 * 1000, // 5 min — model list changes rarely
  });
}
