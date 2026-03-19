import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import type { CreditBalance, CreditLedger, CreditPackage } from '@nexusui/shared';

/** Paginated ledger response shape */
interface LedgerResponse {
  data: CreditLedger[];
  pagination: { total: number; hasMore: boolean; nextCursor: string | null; prevCursor: string | null; limit: number };
}

/** Hook for current user's credit balance */
export function useCreditBalance() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<CreditBalance>({
    queryKey: ['credits', 'balance'],
    queryFn: () => api.getCreditBalance() as Promise<CreditBalance>,
    refetchInterval: 30_000,
  });
}

/** Hook for credit ledger (transaction history) */
export function useCreditLedger(params?: Record<string, string>) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<LedgerResponse>({
    queryKey: ['credits', 'ledger', params],
    queryFn: () => api.getCreditLedger(params) as Promise<LedgerResponse>,
  });
}

/** Hook for available credit packages */
export function useCreditPackages() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<CreditPackage[]>({
    queryKey: ['credits', 'packages'],
    queryFn: () => api.getCreditPackages() as Promise<CreditPackage[]>,
  });
}

/** Hook for initiating a credit purchase (returns Stripe checkout URL) */
export function usePurchaseCredits() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (packageId: string) =>
      api.purchaseCredits({ packageId }) as Promise<{ checkoutUrl: string }>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}
