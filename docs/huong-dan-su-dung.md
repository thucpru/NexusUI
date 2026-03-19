# NexusUI — Hướng dẫn sử dụng

## Tổng quan

NexusUI là nền tảng SaaS kết hợp Figma Plugin giúp designer và developer:

- **Tạo design system** trực tiếp trong Figma (color, typography, spacing tokens)
- **Sinh UI bằng AI** — nhập prompt, chọn model AI (Claude, GPT-4, ...), nhận code component
- **Đồng bộ 2 chiều với GitHub** — Code→Design và Design→Code tự động
- **Thanh toán bằng credit** — mua credit qua Stripe, mỗi model AI có giá credit riêng

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|-----------|---------------------|
| Node.js | ≥ 20.0.0 |
| pnpm | ≥ 9.0.0 |
| Docker | Bất kỳ (cho PostgreSQL + Redis) |
| Figma Desktop | Phiên bản mới nhất |

---

## Cài đặt & Khởi chạy

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd NexusUI
pnpm install
```

### 2. Khởi chạy Database & Redis

```bash
docker compose up -d
```

Lệnh này sẽ chạy:
- **PostgreSQL 16** tại `localhost:5432` (user: `nexusui`, pass: `nexusui`, db: `nexusui`)
- **Redis 7** tại `localhost:6379`

### 3. Cấu hình Environment Variables

Sao chép file `.env.example` → `.env` tại root project và điền giá trị thật:

```bash
cp .env.example .env
```

**Các key bắt buộc:**

| Biến | Mô tả | Cách lấy |
|------|--------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Đã cấu hình sẵn theo docker-compose |
| `CLERK_SECRET_KEY` | Clerk API secret | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Cùng dashboard Clerk |
| `STRIPE_SECRET_KEY` | Stripe API secret | [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys |
| `ENCRYPTION_KEY` | AES-256 key (64 hex chars) | Chạy: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Các key tùy chọn:**

| Biến | Mô tả |
|------|--------|
| `ANTHROPIC_API_KEY` | Key cho Claude models (bootstrap) |
| `OPENAI_API_KEY` | Key cho GPT models (bootstrap) |
| `GITHUB_APP_ID` + `GITHUB_APP_PRIVATE_KEY` | GitHub App cho sync |
| `STRIPE_WEBHOOK_SECRET` | Xác thực webhook Stripe |
| `CLERK_WEBHOOK_SECRET` | Xác thực webhook Clerk |
| `INITIAL_CREDIT_GRANT` | Số credit tặng user mới (mặc định: 100) |

Web app (`apps/web/.env.local`) cần thêm:

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_API_URL` | URL API server (mặc định: `http://localhost:4000`) |
| `INTERNAL_API_SECRET` | Secret cho server-to-server calls |

### 4. Migrate Database

```bash
cd packages/database
pnpm db:generate   # Generate Prisma Client
pnpm db:migrate    # Apply migrations
pnpm db:seed       # (Tùy chọn) Seed dữ liệu mẫu
cd ../..
```

### 5. Chạy Development Server

```bash
pnpm dev
```

Turbo sẽ chạy song song tất cả apps:

| App | URL | Mô tả |
|-----|-----|--------|
| **Web Dashboard** | http://localhost:3000 | Quản lý project, mua credit, admin panel |
| **API Server** | http://localhost:4000 | NestJS REST API + WebSocket |
| **Figma Plugin** | Build tự động | Build plugin output tại `apps/plugin/dist/` |

---

## Hướng dẫn sử dụng Web Dashboard

### Đăng ký / Đăng nhập

1. Truy cập http://localhost:3000
2. Nhấn **Sign Up** hoặc **Sign In** (xác thực qua Clerk — Google OAuth, email, etc.)
3. User mới tự động nhận credit miễn phí (cấu hình bởi `INITIAL_CREDIT_GRANT`)

### Dashboard chính (`/dashboard`)

- **Stats Overview**: Tổng project, số generation, credit còn lại
- **Activity Feed**: Lịch sử hoạt động gần đây
- **Credit Usage Chart**: Biểu đồ tiêu thụ credit theo thời gian

### Quản lý Project (`/projects`)

1. Nhấn **Create Project** → điền tên, mô tả, link Figma file (tùy chọn)
2. Vào project detail (`/projects/[id]`) để:
   - Xem **Design System Preview** — tokens đang lưu
   - Xem **Generation History** — lịch sử AI generation
   - Xem **Sync Status** — trạng thái sync GitHub

### Mua Credit (`/settings/credits`)

1. Chọn **credit package** (ví dụ: $10 = 1000 credits, $50 = 5500 credits, ...)
2. Thanh toán qua Stripe Checkout
3. Credit tự động cộng vào tài khoản sau khi thanh toán thành công
4. Xem lịch sử giao dịch và số dư trong bảng **Credit History**

### Cài đặt User (`/settings`)

- Chỉnh sửa thông tin cá nhân
- Xem API usage

---

## Hướng dẫn sử dụng Figma Plugin

### Cài đặt Plugin (Development)

1. Mở **Figma Desktop**
2. Vào **Plugins → Development → Import plugin from manifest...**
3. Chọn file `apps/plugin/manifest.json` trong project NexusUI
4. Plugin xuất hiện trong menu **Plugins → Development → NexusUI**

### Tab 1: Design System

Quản lý design tokens ngay trong Figma:

- **Color Tokens**: Thêm/sửa/xóa color palette (hex, rgba)
- **Typography Tokens**: Font family, size, weight, line-height
- **Spacing Tokens**: Spacing scale (4px, 8px, 16px, ...)
- Nhấn **Save** để lưu lên server, badge "Unsaved Changes" hiện khi có thay đổi chưa lưu

### Tab 2: AI Generate

Sinh UI component bằng AI:

1. **Chọn AI Model** — dropdown hiển thị model có sẵn + giá credit mỗi request
2. **Nhập prompt** — mô tả component muốn tạo (ví dụ: "A responsive pricing card with 3 tiers")
3. Nhấn **Generate** → hệ thống:
   - Trừ credit trước
   - Gửi prompt + design system context lên server
   - Xếp hàng job qua Bull queue
   - Thông báo kết quả qua WebSocket
4. **Xem variant** — mỗi generation có thể trả về nhiều variant
5. **Apply to canvas** — chèn component lên Figma canvas

### Tab 3: Sync Controls

Đồng bộ 2 chiều với GitHub:

- **Design→Code**: Nhấn Sync → tạo branch + PR trên GitHub với code React/Tailwind từ design
- **Code→Design**: Khi code trên GitHub thay đổi (push/merge), webhook tự động cập nhật design trong Figma
- **Branch Selector**: Chọn branch làm việc
- **Sync Log**: Xem lịch sử sync chi tiết

### Credit Balance

- Hiển thị ở footer plugin, cập nhật real-time qua WebSocket
- Khi hết credit → redirect sang Web Dashboard để mua thêm

---

## Admin Panel (cho ADMIN role)

Truy cập từ sidebar Web Dashboard khi đăng nhập với role ADMIN.

### Quản lý AI Models (`/admin/models`)

- **Thêm model**: Tên, slug, provider (Anthropic/OpenAI/Google/Custom), API key (mã hóa AES-256), giá credit/request
- **Bật/tắt model**: Toggle `isActive` — tắt model sẽ ẩn khỏi plugin
- **Chỉnh giá credit**: Thay đổi `creditCostPerRequest` theo thời gian

### Quản lý Credit Packages (`/admin/packages`)

- Tạo/sửa package: tên, số credit, bonus credits, giá (cents), Stripe Price ID
- Sắp xếp thứ tự hiển thị

### Quản lý Users (`/admin/users`)

- Xem danh sách users, credit balance, spending patterns
- **Điều chỉnh credit**: Cộng/trừ credit thủ công (ghi audit log)
- **Hoàn credit**: Refund cho user khi cần

### Analytics (`/admin/analytics`)

- Revenue tổng quan
- Model phổ biến nhất
- Top users theo spending
- Credit flow chart

---

## Kiến trúc kỹ thuật (tóm tắt)

```
NexusUI/
├── apps/
│   ├── web/          # Next.js 15 — Web Dashboard (port 3000)
│   ├── api/          # NestJS — REST API + WebSocket (port 4000)
│   └── plugin/       # Figma Plugin (Preact + TypeScript)
├── packages/
│   ├── database/     # Prisma schema + migrations
│   ├── shared/       # TypeScript types, Zod validators, utils
│   └── ui/           # Shared UI components
├── .env              # Root env (API server reads this)
├── apps/web/.env.local  # Web-specific env
└── docker-compose.yml   # PostgreSQL + Redis
```

### API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/health` | Health check |
| POST | `/api/v1/projects` | Tạo project |
| GET | `/api/v1/projects` | Danh sách project |
| POST | `/api/v1/ai-generation/generate` | Sinh UI bằng AI |
| GET | `/api/v1/billing/balance` | Xem số dư credit |
| POST | `/api/v1/billing/checkout` | Tạo Stripe checkout session |
| GET | `/api/v1/billing/history` | Lịch sử credit |
| GET | `/api/v1/models` | Danh sách AI models |
| POST | `/api/v1/sync/design-to-code` | Sync Design→Code |
| POST | `/api/v1/sync/code-to-design` | Sync Code→Design |

---

## Troubleshooting

### Database connection failed
```bash
# Kiểm tra Docker containers đang chạy
docker compose ps

# Restart nếu cần
docker compose down && docker compose up -d
```

### Prisma generate lỗi
```bash
cd packages/database
pnpm db:generate
```

### Port bị chiếm
- Web: Đổi port trong `apps/web/package.json` → script `dev`
- API: Set `PORT=4001` trong `.env`

### Credit không cập nhật
- Kiểm tra Redis đang chạy: `docker compose ps`
- Kiểm tra WebSocket connection trong browser DevTools → Network → WS tab

### Figma Plugin không load
- Đảm bảo đã build: `cd apps/plugin && pnpm build`
- Re-import manifest trong Figma: Plugins → Development → Import plugin from manifest
- Kiểm tra console log trong Figma: Plugins → Development → Open Console

---

## Lệnh hữu ích

```bash
# Development
pnpm dev              # Chạy tất cả apps
pnpm build            # Build tất cả
pnpm lint             # Lint tất cả
pnpm typecheck        # Type check tất cả
pnpm test             # Chạy tests

# Database
cd packages/database
pnpm db:studio        # Mở Prisma Studio (GUI quản lý DB)
pnpm db:migrate       # Apply pending migrations
pnpm db:seed          # Seed dữ liệu mẫu

# Formatting
pnpm format           # Prettier format toàn bộ codebase
```
