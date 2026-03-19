/**
 * BillingAdminController — admin-only billing management endpoints.
 *
 * Routes (all under /api/v1):
 *   GET   /admin/billing/packages      — list all packages (including inactive)
 *   POST  /admin/billing/packages      — create package (creates Stripe Price)
 *   PATCH /admin/billing/packages/:id  — update package
 *   POST  /admin/billing/adjust        — adjust user credits
 *   GET   /admin/billing/analytics     — revenue stats
 *
 * All routes require ClerkAuthGuard + AdminRoleGuard.
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import { AdminRoleGuard } from '../../common/guards/admin-role-guard';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth-guard';
import { CreditPackageService } from './credit-package.service';
import { CreditMeteringService } from './credit-metering.service';
import { BillingService } from './billing.service';
import { AdjustCreditsDto } from './dto/adjust-credits-dto';
import { CreateCreditPackageDto, UpdateCreditPackageDto } from './dto/credit-balance-dto';

interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('admin/billing')
@UseGuards(ClerkAuthGuard, AdminRoleGuard)
export class BillingAdminController {
  constructor(
    private readonly packageService: CreditPackageService,
    private readonly meteringService: CreditMeteringService,
    private readonly billingService: BillingService,
  ) {}

  /** GET /admin/billing/packages — list all packages including inactive */
  @Get('packages')
  async listAllPackages() {
    return this.packageService.listAll();
  }

  /** POST /admin/billing/packages — create package + Stripe Price */
  @Post('packages')
  @HttpCode(HttpStatus.CREATED)
  async createPackage(@Body() dto: CreateCreditPackageDto) {
    return this.packageService.create(dto);
  }

  /** PATCH /admin/billing/packages/:id — update package */
  @Patch('packages/:id')
  async updatePackage(@Param('id') id: string, @Body() dto: UpdateCreditPackageDto) {
    return this.packageService.update(id, dto);
  }

  /** POST /admin/billing/adjust — admin credit adjustment for a user */
  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  async adjustCredits(@Req() req: AuthRequest, @Body() dto: AdjustCreditsDto) {
    const newBalance = await this.meteringService.adjustCredits(
      req.user.id,
      dto.userId,
      dto.amount,
      dto.description,
    );
    return { userId: dto.userId, newBalance };
  }

  /** GET /admin/billing/analytics — revenue stats */
  @Get('analytics')
  async getAnalytics() {
    return this.billingService.getRevenueAnalytics();
  }
}
