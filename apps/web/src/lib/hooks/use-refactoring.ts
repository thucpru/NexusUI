import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import type {
  ComponentAuditListResponse,
  ComponentAuditDto,
  RefactoringJobListResponse,
  RefactoringJobDto,
  ScanComponentsRequest,
  BeautifyComponentRequest,
  GeneratePrRequest,
} from '@nexusui/shared';

/** Hook for listing all component audits in a project */
export function useComponentAudits(projectId: string) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<ComponentAuditListResponse>({
    queryKey: ['refactoring', 'components', projectId],
    queryFn: () => api.getComponentAudits(projectId) as Promise<ComponentAuditListResponse>,
    enabled: !!projectId,
  });
}

/** Hook for a single component audit */
export function useComponentAudit(projectId: string, componentId: string) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<ComponentAuditDto>({
    queryKey: ['refactoring', 'components', projectId, componentId],
    queryFn: () => api.getComponentAudit(projectId, componentId) as Promise<ComponentAuditDto>,
    enabled: !!projectId && !!componentId,
  });
}

/** Hook for triggering a component scan on a project */
export function useScanComponents() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: ({ projectId, ...body }: ScanComponentsRequest) =>
      api.scanComponents(projectId, body) as Promise<{ message: string }>,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['refactoring', 'components', vars.projectId] });
    },
  });
}

/** Hook for beautifying a single component */
export function useBeautifyComponent() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: ({ projectId, ...body }: BeautifyComponentRequest) =>
      api.beautifyComponent(projectId, body) as Promise<RefactoringJobDto>,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['refactoring', 'jobs', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['refactoring', 'components', vars.projectId] });
    },
  });
}

/** Hook for listing refactoring jobs for a project */
export function useRefactoringJobs(projectId: string, params?: Record<string, string>) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<RefactoringJobListResponse>({
    queryKey: ['refactoring', 'jobs', projectId, params],
    queryFn: () => api.getRefactoringJobs(projectId, params) as Promise<RefactoringJobListResponse>,
    enabled: !!projectId,
    refetchInterval: 5_000, // poll for real-time job status updates
  });
}

/** Hook for a single refactoring job */
export function useRefactoringJob(projectId: string, jobId: string) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<RefactoringJobDto>({
    queryKey: ['refactoring', 'jobs', projectId, jobId],
    queryFn: () => api.getRefactoringJob(projectId, jobId) as Promise<RefactoringJobDto>,
    enabled: !!projectId && !!jobId,
    refetchInterval: 3_000,
  });
}

/** Hook for generating a GitHub PR from completed refactoring jobs */
export function useGeneratePr() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: ({ projectId, ...body }: GeneratePrRequest) =>
      api.generatePr(projectId, body) as Promise<{ prUrl: string }>,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['refactoring', 'jobs', vars.projectId] });
    },
  });
}
