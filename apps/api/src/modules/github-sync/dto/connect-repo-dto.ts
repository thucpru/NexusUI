/**
 * DTO for connecting a GitHub repository to a project.
 * User provides installation ID (from GitHub App callback) + repo details.
 */
import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class ConnectRepoDto {
  @IsNotEmpty()
  @IsString()
  projectId!: string;

  /** GitHub App installation ID (numeric, stored as BigInt in DB) */
  @IsNotEmpty()
  @IsNumberString()
  installationId!: string;

  /** Repo owner (org or user) */
  @IsNotEmpty()
  @IsString()
  repoOwner!: string;

  /** Repo name (without owner) */
  @IsNotEmpty()
  @IsString()
  repoName!: string;

  /** Default branch to sync against */
  @IsString()
  branch: string = 'main';
}
