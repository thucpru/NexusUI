import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import type {
  AdminStats,
  ModelUsageStats,
  RevenueStats,
  AIModel,
  CreditPackage,
  User,
} from '@nexusui/shared';

/** Hook for platform-level admin statistics */
export function useAdminStats() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.getAdminStats() as Promise<AdminStats>,
    refetchInterval: 60_000,
  });
}

/** Hook for model usage statistics */
export function useModelUsageStats() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<ModelUsageStats[]>({
    queryKey: ['admin', 'model-usage'],
    queryFn: () => api.getModelUsage() as Promise<ModelUsageStats[]>,
  });
}

/** Hook for revenue statistics */
export function useRevenueStats(params?: Record<string, string>) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<RevenueStats[]>({
    queryKey: ['admin', 'revenue', params],
    queryFn: () => api.getRevenue(params) as Promise<RevenueStats[]>,
  });
}

/** Hook for full AI model list (admin view with config) */
export function useAdminAIModels() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<AIModel[]>({
    queryKey: ['admin', 'ai-models'],
    queryFn: () => api.getAIModels() as Promise<AIModel[]>,
  });
}

/** Hook for creating an AI model */
export function useCreateAIModel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (data: unknown) => api.createAIModel(data) as Promise<AIModel>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-models'] });
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });
}

/** Hook for updating an AI model */
export function useUpdateAIModel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.updateAIModel(id, data) as Promise<AIModel>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-models'] });
    },
  });
}

/** Hook for deleting an AI model */
export function useDeleteAIModel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (id: string) => api.deleteAIModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-models'] });
    },
  });
}

/** Hook for admin credit packages management */
export function useAdminCreditPackages() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<CreditPackage[]>({
    queryKey: ['admin', 'credit-packages'],
    queryFn: () => api.getCreditPackages() as Promise<CreditPackage[]>,
  });
}

/** Hook for creating a credit package */
export function useCreateCreditPackage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (data: unknown) => api.createCreditPackage(data) as Promise<CreditPackage>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-packages'] });
      queryClient.invalidateQueries({ queryKey: ['credits', 'packages'] });
    },
  });
}

/** Hook for updating a credit package */
export function useUpdateCreditPackage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.updateCreditPackage(id, data) as Promise<CreditPackage>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-packages'] });
    },
  });
}

/** Hook for deleting a credit package */
export function useDeleteCreditPackage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (id: string) => api.deleteCreditPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'credit-packages'] });
    },
  });
}

/** Hook for user management */
export function useAdminUsers(params?: Record<string, string>) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<{ data: User[]; pagination: { total: number; hasMore: boolean; nextCursor: string | null; prevCursor: string | null; limit: number } }>({
    queryKey: ['admin', 'users', params],
    queryFn: () =>
      api.getUsers(params) as Promise<{ data: User[]; pagination: { total: number; hasMore: boolean; nextCursor: string | null; prevCursor: string | null; limit: number } }>,
  });
}

/** Hook for admin credit adjustment */
export function useAdminAdjustCredits() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (data: { userId: string; amount: number; reason: string }) =>
      api.adminAdjustCredits(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/** Hook for updating user role */
export function useUpdateUserRole() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.updateUserRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
