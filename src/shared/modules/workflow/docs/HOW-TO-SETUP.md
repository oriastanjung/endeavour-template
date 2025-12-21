# 🚀 Cara Setup Workflow Module

## Daftar Isi
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [Running Workers](#running-workers)
- [Frontend Routes](#frontend-routes)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Sebelum setup workflow module, pastikan kamu sudah punya:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | >= 18.0 | `node -v` |
| Bun | >= 1.0 | `bun -v` |
| PostgreSQL | >= 14 | `psql --version` |
| Redis | >= 6.0 | `redis-server --version` |

---

## Installation

### 1. Install Dependencies

```bash
# Main dependencies
bun add bullmq ioredis handlebars

# Type definitions
bun add -D @types/node
```

### 2. Environment Variables

Tambahkan ke file `.env`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Redis (untuk BullMQ)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # kosongkan jika tidak ada password
```

---

## Database Setup

### 1. Copy Prisma Schema

Pastikan file `src/shared/modules/workflow/prisma/Workflow.prisma` ada:

```prisma
// Workflow Models
model Workflow {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String
  isActive    Boolean  @default(false)
  version     Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  nodes       WorkflowNode[]
  edges       WorkflowEdge[]
  executions  WorkflowExecution[]
  triggers    Trigger[]

  @@map("workflow")
}

// ... (lihat file lengkap di prisma folder)
```

### 2. Generate Prisma Client

```bash
bun run prisma:generate
```

### 3. Push Schema ke Database

```bash
bun run prisma:push
```

Atau gunakan migration:

```bash
bun run prisma:migrate
```

### 4. Verify Tables

Buka Prisma Studio untuk cek:

```bash
bun run prisma:studio
```

Pastikan tabel berikut ada:
- ✅ `workflow`
- ✅ `workflow_node`
- ✅ `workflow_edge`
- ✅ `workflow_execution`
- ✅ `workflow_node_run`
- ✅ `trigger`

---

## Redis Setup

### Option A: Local Redis

**Mac (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

**Windows (WSL recommended):**
```bash
wsl --install
# Lalu ikuti langkah Ubuntu
```

**Verify:**
```bash
redis-cli ping
# Output: PONG
```

### Option B: Docker Redis

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

### Option C: Cloud Redis

Gunakan service seperti:
- [Upstash](https://upstash.com/) - Free tier available
- [Redis Cloud](https://redis.com/try-free/)
- [Railway](https://railway.app/)

Update `.env`:
```env
REDIS_HOST="your-redis-host.upstash.io"
REDIS_PORT="6379"
REDIS_PASSWORD="your-password"
```

---

## Running Workers

Workers adalah proses background yang menjalankan node.

### Development Mode

**Terminal 1 - Dev Server:**
```bash
bun dev
```

**Terminal 2 - Workers:**
```bash
bun run workers
# atau
bun tsx src/shared/modules/workflow/backend/workers/index.ts
```

### Production Mode

Pastikan workers running di production! Contoh dengan PM2:

```bash
# Install PM2
npm install -g pm2

# Start workers
pm2 start src/shared/modules/workflow/backend/workers/index.ts --name "workflow-workers"

# Monitor
pm2 logs workflow-workers
pm2 status
```

### Verify Workers

Buka Bull Board di `/bull-board`:

```
http://localhost:3000/bull-board
```

Kamu harus melihat:
- 📋 `workflow_queue` - Untuk workflow orchestration
- 📋 `node_queue` - Untuk node execution

---

## Frontend Routes

### Struktur Routes

```
src/app/(homepage)/workflow/
├── page.tsx                    # Dashboard list
├── detail/
│   └── [id]/
│       └── page.tsx            # Editor canvas
└── preview/
    └── [id]/
        └── page.tsx            # Run & history
```

### Akses Pages

| Route | Fungsi |
|-------|--------|
| `/workflow` | Dashboard - list semua workflow |
| `/workflow/detail/[id]` | Editor - edit workflow |
| `/workflow/preview/[id]` | Preview - run & lihat history |

### Tambah Navigation (Optional)

Untuk menambah link di navbar/sidebar:

```tsx
// Di komponen navigasi kamu
<Link href="/workflow">
  <PlayCircle className="h-4 w-4" />
  Workflows
</Link>
```

---

## Verification

### Checklist Setup

- [ ] Database tables created
- [ ] Redis running
- [ ] Workers running
- [ ] Can access `/workflow`
- [ ] Can access `/bull-board`

### Quick Test

1. **Buka Dashboard:**
   ```
   http://localhost:3000/workflow
   ```

2. **Create Workflow:**
   - Klik "Create Workflow"
   - Isi nama: "Test Workflow"
   - Submit

3. **Edit Workflow:**
   - Klik "Edit" pada workflow baru
   - Drag "Manual Trigger" dari sidebar
   - Drag "Output" dari sidebar
   - Connect keduanya

4. **Run Workflow:**
   - Klik "Preview & Run"
   - Klik "Run Workflow"
   - Lihat execution di sidebar

5. **Check Bull Board:**
   - Buka `/bull-board`
   - Lihat job di queue

---

## Troubleshooting

### ❌ "Redis connection refused"

**Problem:** Redis tidak running

**Solution:**
```bash
# Check redis status
redis-cli ping

# Start redis
# Mac:
brew services start redis

# Ubuntu:
sudo systemctl start redis
```

### ❌ "Workers not processing jobs"

**Problem:** Workers tidak running

**Solution:**
```bash
# Jalankan workers di terminal terpisah
bun tsx src/shared/modules/workflow/backend/workers/index.ts
```

### ❌ "Table does not exist"

**Problem:** Database belum di-setup

**Solution:**
```bash
bun run prisma:generate
bun run prisma:push
```

### ❌ "Cannot find module"

**Problem:** Dependencies belum install

**Solution:**
```bash
bun install
bun run prisma:generate
```

### ❌ "Workflow stuck at PENDING"

**Problem:** Workers tidak memproses

**Solution:**
1. Check Redis connection
2. Check workers running
3. Lihat Bull Board untuk error
4. Check console logs

### ❌ "Node execution failed"

**Problem:** Error di node action

**Solution:**
1. Check execution detail di preview page
2. Lihat error message di node run
3. Debug action code
4. Check stateIn yang diterima

---

## File Configuration Reference

### Redis Connection

File: `src/backend/lib/redis.ts`
```typescript
import Redis from "ioredis";

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
});
```

### tRPC Router

File: `src/backend/_app.ts`
```typescript
import { workflowRouter } from "@/shared/modules/workflow/backend/trpc/router";

export const appRouter = createTRPCRouter({
  // ... other routers
  workflow: workflowRouter,
});
```

### Queue Workers

File: `src/shared/modules/workflow/backend/workers/index.ts`
```typescript
// Workers auto-start saat file dijalankan
import "./workflow.worker";
import "./node.worker";

console.log("✅ Workflow workers started");
```

---

## Production Checklist

Sebelum deploy ke production:

- [ ] **Environment Variables** - Set di hosting provider
- [ ] **Redis** - Gunakan managed Redis (Upstash, Redis Cloud)
- [ ] **Workers** - Start dengan PM2 atau container
- [ ] **Monitoring** - Setup logging dan alerting
- [ ] **Backup** - Database backup strategy
- [ ] **Rate Limiting** - Limit API calls jika perlu
- [ ] **Authentication** - Protect workflow endpoints

---

## Next Steps

Setelah setup selesai:

1. **Pahami cara kerja:** [HOW-ITS-WORK.md](./HOW-ITS-WORK.md)
2. **Buat node custom:** [HOW-TO-ADD-NODE.md](./HOW-TO-ADD-NODE.md)
3. **Explore existing nodes** di `src/shared/modules/workflow/nodes/`

---

## Quick Reference Commands

```bash
# Development
bun dev                          # Start dev server
bun run workers                  # Start workers

# Database
bun run prisma:generate          # Generate Prisma client
bun run prisma:push              # Push schema to DB
bun run prisma:studio            # Open Prisma Studio

# Redis
redis-cli ping                   # Check Redis
redis-cli monitor                # Monitor commands

# Production
pm2 start workers.js             # Start workers with PM2
pm2 logs workflow-workers        # View logs
```

---

**Happy Automating! 🎉**
