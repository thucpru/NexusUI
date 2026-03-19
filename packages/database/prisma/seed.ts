/**
 * Seed script — populates initial data for development/staging.
 * Run with: pnpm db:seed
 *
 * Seeds:
 * - 1 admin user
 * - Default AI models (Claude Sonnet, GPT-4o, Gemini Pro)
 * - Credit packages ($10, $50, $100, $500 tiers)
 */

import { PrismaClient, UserRole, AIModelProvider } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdminUser() {
  return prisma.user.upsert({
    where: { clerkId: 'admin_clerk_id' },
    update: {},
    create: {
      clerkId: 'admin_clerk_id',
      email: 'admin@nexusui.dev',
      name: 'NexusUI Admin',
      role: UserRole.ADMIN,
      creditBalance: 99999,
    },
  });
}

async function seedAiModels() {
  const models = [
    {
      name: 'Claude 3.5 Sonnet',
      slug: 'claude-3-5-sonnet',
      provider: AIModelProvider.ANTHROPIC,
      providerModelId: 'claude-3-5-sonnet-20241022',
      creditCostPerRequest: 8,
      providerApiKey: 'PLACEHOLDER_ANTHROPIC_API_KEY',
      description: 'Anthropic Claude 3.5 Sonnet — best for code generation tasks',
      isActive: true,
    },
    {
      name: 'GPT-4o',
      slug: 'gpt-4o',
      provider: AIModelProvider.OPENAI,
      providerModelId: 'gpt-4o',
      creditCostPerRequest: 10,
      providerApiKey: 'PLACEHOLDER_OPENAI_API_KEY',
      description: 'OpenAI GPT-4o — versatile multimodal generation',
      isActive: true,
    },
    {
      name: 'Gemini 1.5 Pro',
      slug: 'gemini-1-5-pro',
      provider: AIModelProvider.GOOGLE,
      providerModelId: 'gemini-1.5-pro-latest',
      creditCostPerRequest: 7,
      providerApiKey: 'PLACEHOLDER_GOOGLE_API_KEY',
      description: 'Google Gemini 1.5 Pro — large context window, great for complex UIs',
      // Disabled: GoogleProvider throws NotImplementedException — enable when implemented
      isActive: false,
    },
  ];

  return Promise.all(
    models.map((model) =>
      prisma.aIModel.upsert({
        where: { slug: model.slug },
        update: {},
        create: model,
      }),
    ),
  );
}

async function seedCreditPackages() {
  const packages = [
    {
      name: 'Starter Pack',
      creditAmount: 1000,
      bonusCredits: 0,
      priceInCents: 1000, // $10
      currency: 'usd',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Growth Pack',
      creditAmount: 5000,
      bonusCredits: 1000, // 6000 effective
      priceInCents: 5000, // $50
      currency: 'usd',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Pro Pack',
      creditAmount: 10000,
      bonusCredits: 3000, // 13000 effective
      priceInCents: 10000, // $100
      currency: 'usd',
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Enterprise Pack',
      creditAmount: 60000,
      bonusCredits: 10000, // 70000 effective
      priceInCents: 50000, // $500
      currency: 'usd',
      isActive: true,
      sortOrder: 4,
    },
  ];

  // Use createMany with skipDuplicates to be idempotent
  return prisma.creditPackage.createMany({
    data: packages,
    skipDuplicates: true,
  });
}

async function main() {
  console.log('🌱 Starting seed...');

  const admin = await seedAdminUser();
  console.log(`✅ Admin user: ${admin.email} (${admin.id})`);

  const models = await seedAiModels();
  console.log(`✅ AI models: ${models.map((m) => m.name).join(', ')}`);

  const packages = await seedCreditPackages();
  console.log(`✅ Credit packages: ${packages.count} created`);

  console.log('🎉 Seed complete.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
