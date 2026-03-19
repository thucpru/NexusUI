# NexusUI — Product Development Requirements (PDR)

**Status**: ✅ COMPLETE — All phases implemented (Phase 1-9), production-ready

## Product Vision
SaaS platform + Figma plugin enabling designers/developers to create design systems, generate AI-powered UI variants, and bidirectionally sync designs with GitHub codebases.

## Target Users
- **Designers** who want code-aware design systems
- **Developers** who want design-aware codebases
- **Design-Dev teams** needing seamless handoff + sync

## Core Features

### 1. Design System Creation (Figma Plugin)
- Create/manage design tokens (colors, typography, spacing) directly in Figma
- Visual design system editor within Figma plugin panel
- Export design system as JSON/code tokens

### 2. AI-Powered UI Generation
- Generate multiple UI variants from text prompts
- Constraint-based generation follows design system strictly
- Preview variants in Figma before committing
- Credit-metered billing per generation (rate varies by model)

### 3. GitHub Integration (Bidirectional Sync)
- Connect GitHub repos via GitHub App OAuth
- **Code→Design**: Parse codebase → recreate components in Figma
- **Design→Code**: Generate React/Vue/Tailwind code from Figma designs
- Create branches/PRs with generated code
- Conflict resolution with user review

### 4. Prepaid Credit System
- Users purchase credit packages upfront (e.g., $10, $50, $100, $500)
- Credits function as wallet balance — spend on any AI model the system provides
- Each model has a different credit-per-request rate (admin-configurable)
- Real-time balance tracking with usage history and cost breakdown per model
- Low-balance alerts and auto-topup option
- Free tier: small initial credit grant for new users to try the platform

### 5. Admin Panel (Model & Pricing Management)
- Add/remove/toggle AI models available to users
- Set credit cost per request for each model (e.g., GPT-4o: 5 credits, Claude Sonnet: 8 credits)
- Configure credit packages and pricing tiers
- View platform-wide usage analytics: revenue, popular models, user spending patterns
- Manage users, adjust balances, issue refund credits

## Business Model
- Prepaid credit system — users deposit money, consume credits per AI generation
- Revenue from credit markup over raw AI API costs
- Stripe integration for credit purchases (one-time payments, optional auto-topup)
- Margin controlled via admin-set credit rates per model

## Success Metrics
- User activation: Design system created within first session
- Retention: Weekly active users returning to sync
- Revenue: Credit purchase volume and consumption growth MoM
- NPS: >50 from beta users

## Constraints

### Figma Plugin Sandbox
- Main thread: pure JS sandbox — no DOM, no browser APIs (fetch available via Figma's Fetch API)
- UI thread: iframe with null origin — CORS requires `Access-Control-Allow-Origin: *` on called APIs
- Communication: postMessage between main thread ↔ UI iframe; both threads can use fetch independently
- Network access: must declare `networkAccess.allowedDomains` in manifest (CSP enforced)
- WebSocket: supported via `ws://`/`wss://` schemes if declared in allowedDomains
- Bundle size: no hard limit (practical target <200KB for fast load, Figma allows up to ~50MB)
- Must call `figma.closePlugin()` when done

### Figma REST API
- Rate limits apply (exact numbers vary by auth type; implement backoff on 429 responses)
- HTTPS only, OAuth2 or personal access token auth

### AI Cost Management
- Multi-model AI usage tracking and credit metering
- Bull queue for async job processing to control concurrency
- Admin-configurable credit rates per model
