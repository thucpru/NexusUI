/**
 * DTOs for admin credit adjustment endpoint.
 */
import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

/** Body for admin credit adjustment */
export class AdjustCreditsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  /** Positive to add, negative to remove */
  @IsInt()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  referenceId?: string;
}
