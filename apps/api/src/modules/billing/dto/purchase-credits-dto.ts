/**
 * DTOs for credit purchase endpoints.
 */
import { IsString, IsNotEmpty } from 'class-validator';

/** Body for POST /billing/checkout */
export class PurchaseCreditsDto {
  @IsString()
  @IsNotEmpty()
  packageId!: string;
}
