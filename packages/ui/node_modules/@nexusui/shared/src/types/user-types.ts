/** User role levels in NexusUI */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/** Core user profile stored in DB, synced from Clerk */
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Slim user reference used in related entities */
export interface UserRef {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
