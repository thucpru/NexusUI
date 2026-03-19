import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import type { Project, PaginatedResponse } from '@nexusui/shared';

/** Hook for listing and managing projects */
export function useProjects() {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<PaginatedResponse<Project>>({
    queryKey: ['projects'],
    queryFn: () => api.getProjects() as Promise<PaginatedResponse<Project>>,
  });
}

/** Hook for a single project by ID */
export function useProject(id: string) {
  const { getToken } = useAuth();
  const api = createApiClient(getToken);

  return useQuery<Project>({
    queryKey: ['projects', id],
    queryFn: () => api.getProject(id) as Promise<Project>,
    enabled: !!id,
  });
}

/** Hook for creating a new project */
export function useCreateProject() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.createProject(data) as Promise<Project>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/** Hook for updating a project */
export function useUpdateProject() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      api.updateProject(id, data) as Promise<Project>,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

/** Hook for deleting a project */
export function useDeleteProject() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const api = createApiClient(getToken);

  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
