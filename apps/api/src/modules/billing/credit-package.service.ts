/**
 * CreditPackageService — Admin CRUD for credit packages.
 * Creates/updates Stripe Prices to match each package.
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { DatabaseService } from '../../database/database-service';
import type { CreditPackage } from '@nexusui/database';
import type { CreateCreditPackageDto, UpdateCreditPackageDto } from './dto/credit-balance-dto';

@Injectable()
export class CreditPackageService {
  private readonly logger = new Logger(CreditPackageService.name);
  private readonly stripe: Stripe;

  constructor(private readonly db: DatabaseService) {
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    this.stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  }

  /** List all packages ordered by sortOrder (admin — includes inactive) */
  async listAll(): Promise<CreditPackage[]> {
    return this.db.client.creditPackage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** List only active packages (user-facing) */
  async listActive(): Promise<CreditPackage[]> {
    return this.db.client.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Find one by ID — throws NotFoundException if missing */
  async findById(id: string): Promise<CreditPackage> {
    const pkg = await this.db.client.creditPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException(`Credit package ${id} not found`);
    return pkg;
  }

  /** Create a new package and corresponding Stripe Price */
  async create(dto: CreateCreditPackageDto): Promise<CreditPackage> {
    const stripeProduct = await this.stripe.products.create({
      name: dto.name,
      metadata: { creditAmount: String(dto.creditAmount), bonusCredits: String(dto.bonusCredits) },
    });

    const stripePrice = await this.stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: dto.priceInCents,
      currency: dto.currency ?? 'usd',
    });

    const pkg = await this.db.client.creditPackage.create({
      data: {
        name: dto.name,
        creditAmount: dto.creditAmount,
        bonusCredits: dto.bonusCredits ?? 0,
        priceInCents: dto.priceInCents,
        currency: dto.currency ?? 'usd',
        sortOrder: dto.sortOrder ?? 0,
        stripePriceId: stripePrice.id,
      },
    });

    this.logger.log(`Created credit package ${pkg.id} with Stripe Price ${stripePrice.id}`);
    return pkg;
  }

  /**
   * Update an existing package.
   * If price changes, archives old Stripe Price and creates a new one.
   */
  async update(id: string, dto: UpdateCreditPackageDto): Promise<CreditPackage> {
    const existing = await this.findById(id);

    let newStripePriceId = existing.stripePriceId;

    const priceChanged =
      dto.priceInCents !== undefined && dto.priceInCents !== existing.priceInCents;

    if (priceChanged && existing.stripePriceId) {
      // Archive old price — Stripe prices are immutable, must create new
      await this.stripe.prices.update(existing.stripePriceId, { active: false });

      const newPrice = await this.stripe.prices.create({
        product: (await this.stripe.prices.retrieve(existing.stripePriceId)).product as string,
        unit_amount: dto.priceInCents!,
        currency: existing.currency,
      });
      newStripePriceId = newPrice.id;
    }

    const updated = await this.db.client.creditPackage.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.creditAmount !== undefined && { creditAmount: dto.creditAmount }),
        ...(dto.bonusCredits !== undefined && { bonusCredits: dto.bonusCredits }),
        ...(dto.priceInCents !== undefined && { priceInCents: dto.priceInCents }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        stripePriceId: newStripePriceId,
      },
    });

    this.logger.log(`Updated credit package ${id}`);
    return updated;
  }
}
