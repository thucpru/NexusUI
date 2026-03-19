import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import type { Generation, PaginatedResponse } from '@nexusui/shared';

/** Hook for listing generations, optionally filtered by projectId */
export function useGenerations(params?: { projectId?: string; limit?: string }) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  const queryParams: Record<string, string> = {};
  if (params?.projectId) queryParams['projectId'] = params.projectId;
  if (params?.limit) queryParams['limit'] = params.limit;

  return useQuery<PaginatedResponse<Generation> & { total: number }>({
    queryKey: ['generations', params],
    queryFn: () =>
      api.getGenerations(queryParams) as Promise<PaginatedResponse<Generation> & { total: number }>,
  });
}

/** Hook for triggering a new AI generation */
export function useCreateGeneration() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      modelId: string;
      prompt: string;
      designSystemId?: string;
      framework?: 'react' | 'vue' | 'svelte' | 'html';
    }) => api.createGeneration(data) as Promise<Generation>,
    onSuccess: (gen) => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      queryClient.invalidateQueries({ queryKey: ['credits', 'balance'] });
      queryClient.invalidateQueries({
        queryKey: ['generations', { projectId: gen.projectId }],
      });
    },
  });
}
