/**
 * DTO for triggering a design→code or code→design sync.
 */
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

/** Sync mode for design→code: create PR (safe) or commit directly (fast) */
export type SyncMode = 'pr' | 'direct-commit';

export class DesignToCodeSyncRequestDto {
  @IsNotEmpty()
  @IsString()
  projectId!: string;

  /** How to push generated code: open a PR or commit directly */
  @IsIn(['pr', 'direct-commit'])
  syncMode!: SyncMode;

  /** Target branch for the commit or PR base */
  @IsNotEmpty()
  @IsString()
  targetBranch!: string;
}

export class CodeToDesignSyncRequestDto {
  @IsNotEmpty()
  @IsString()
  projectId!: string;
}
