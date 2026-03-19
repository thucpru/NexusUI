/** Lifecycle states for a NexusUI project */
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

/** Top-level project owned by a user */
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  figmaFileKey?: string;
  githubRepoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Slim project reference used in related entities */
export interface ProjectRef {
  id: string;
  name: string;
  status: ProjectStatus;
}
