/**
 * DTOs for credit balance and history responses.
 */
import { IsString, IsNotEmpty, IsInt, IsOptional, IsBoolean } from 'class-validator';

/** Response shape for GET /billing/balance */
export class CreditBalanceDto {
  userId!: string;
  balance!: number;
  lastUpdatedAt!: Date | null;
}

/** Body for creating a credit package (admin) */
export class CreateCreditPackageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  creditAmount!: number;

  @IsInt()
  bonusCredits!: number;

  /** Price in cents (e.g. 500 = $5.00) */
  @IsInt()
  priceInCents!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

/** Body for updating a credit package (admin) */
export class UpdateCreditPackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  creditAmount?: number;

  @IsInt()
  @IsOptional()
  bonusCredits?: number;

  @IsInt()
  @IsOptional()
  priceInCents?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
